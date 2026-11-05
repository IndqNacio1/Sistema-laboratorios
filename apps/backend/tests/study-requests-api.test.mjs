import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { test } from 'node:test';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { AppDataSource } from '../src/config/db.js';
import { UsuarioSchema, PacienteSchema, ServicioSchema, SucursalSchema, EstudioPacienteSchema } from '../src/entities/Laboratorio.js';

test('solicitudes clinicas autenticadas y limitadas por sucursal', async (t) => {
  await AppDataSource.initialize();
  const manager = AppDataSource.manager;
  const branchA = randomUUID(), branchB = randomUUID();
  const patientA = randomUUID(), patientB = randomUUID();
  const userId = randomUUID(), adminId = randomUUID(), operativeId = randomUUID(), supervisorId = randomUUID(), serviceId = randomUUID();
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api/solicitudes-estudios`;
  const token = (id, options = {}) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h', ...options });
  const send = (path, method = 'GET', body, auth = token(userId)) => fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${auth}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const form = { pacienteId: patientA, servicioId: serviceId };
  try {
    await manager.getRepository(SucursalSchema).save([branchA, branchB].map((id) => ({ id, nombre: `Solicitud ${id}`, direccion: 'Prueba temporal' })));
    await manager.getRepository(PacienteSchema).save([{ id: patientA, sucursalId: branchA, nombre: 'Paciente A', apellidos: 'Temporal' }, { id: patientB, sucursalId: branchB, nombre: 'Paciente B', apellidos: 'Temporal' }]);
    await manager.getRepository(ServicioSchema).save({ id: serviceId, nombre: 'Servicio temporal', precio: '99.50' });
    await manager.getRepository(UsuarioSchema).save([
      { id: userId, sucursalId: branchA, rol: 'recepcion' },
      { id: adminId, sucursalId: branchB, rol: 'administrador' },
      { id: operativeId, sucursalId: branchA, rol: 'operativo' },
      { id: supervisorId, sucursalId: branchA, rol: 'supervisor' },
    ].map((user) => ({ ...user, nombre: 'Usuario de prueba', correo: `${user.id}@example.test`, password: 'hash-temporal' })));
    await t.test('rechaza solicitudes sin sesion, con token invalido o vencido', async () => {
      for (const auth of [null, 'invalido', token(userId, { expiresIn: -1 })]) assert.equal((await send('', 'POST', form, auth)).status, 401);
    });
    await t.test('ofrece solo pacientes de la sucursal y permite consulta global al administrador', async () => {
      const options = await (await send('/opciones')).json();
      assert.equal(options.usuario.sucursalId, branchA);
      assert.ok(options.patients.some((patient) => patient.id === patientA));
      assert.ok(options.patients.every((patient) => patient.sucursalId === branchA));
      const adminOptions = await (await send('/opciones', 'GET', null, token(adminId))).json();
      assert.ok(adminOptions.patients.some((patient) => patient.id === patientB));
    });
    await t.test('guarda estado pendiente y usuario real, ignorando campos manipulados', async () => {
      const response = await send('', 'POST', { ...form, usuarioId: adminId, estado: 'completado', resultado: 'ignorado' });
      assert.equal(response.status, 201);
      const data = await response.json();
      const saved = await manager.getRepository(EstudioPacienteSchema).findOneByOrFail({ id: data.id });
      assert.equal(saved.usuarioId, userId);
      assert.equal(saved.estado, 'pendiente');
      assert.equal(saved.resultado, null);
      assert.equal((await send('/' + saved.id)).status, 200);
    });
    await t.test('rechaza pacientes ajenos y roles no autorizados', async () => {
      assert.equal((await send('', 'POST', { ...form, pacienteId: patientB })).status, 403);
      assert.equal((await send('', 'POST', form, token(supervisorId))).status, 403);
      assert.equal((await send('/opciones', 'GET', null, token(supervisorId))).status, 403);
    });
    await t.test('permite registro operativo y consulta de supervisor; administrador puede atender otra sucursal', async () => {
      const operative = await send('', 'POST', form, token(operativeId));
      assert.equal(operative.status, 201);
      const own = await operative.json();
      assert.equal((await send('/' + own.id, 'GET', null, token(supervisorId))).status, 200);
      const admin = await send('', 'POST', { ...form, pacienteId: patientB }, token(adminId));
      assert.equal(admin.status, 201);
      const other = await admin.json();
      assert.equal((await send('/' + other.id)).status, 403);
      assert.equal((await send('/' + other.id, 'GET', null, token(adminId))).status, 200);
    });
    await t.test('revalida paciente y servicio al guardar', async () => {
      await manager.getRepository(PacienteSchema).update(patientA, { estatus: 'inactivo' });
      assert.equal((await send('', 'POST', form)).status, 400);
      await manager.getRepository(PacienteSchema).update(patientA, { estatus: 'activo' });
      await manager.getRepository(ServicioSchema).update(serviceId, { estatus: 'inactivo' });
      assert.equal((await send('', 'POST', form)).status, 400);
      await manager.getRepository(ServicioSchema).update(serviceId, { estatus: 'activo' });
    });
    await t.test('revalida la sucursal y la cuenta de un token ya emitido', async () => {
      const auth = token(userId);
      await manager.getRepository(SucursalSchema).update(branchA, { estatus: 'inactivo' });
      assert.equal((await send('', 'POST', form, auth)).status, 403);
      await manager.getRepository(SucursalSchema).update(branchA, { estatus: 'activo', expiresAt: new Date('2000-01-01') });
      assert.equal((await send('', 'POST', form, auth)).status, 403);
      await manager.getRepository(SucursalSchema).update(branchA, { expiresAt: null });
      await manager.getRepository(UsuarioSchema).update(userId, { estatus: 'inactivo' });
      assert.equal((await send('', 'POST', form, auth)).status, 401);
      await manager.getRepository(UsuarioSchema).update(userId, { estatus: 'activo' });
    });
    await t.test('no guarda ante errores y devuelve 400 o 404 segun corresponda', async () => {
      assert.equal((await send('', 'POST', { ...form, pacienteId: 'no-uuid' })).status, 400);
      assert.equal((await send('', 'POST', { ...form, servicioId: randomUUID() })).status, 404);
      assert.equal((await manager.getRepository(EstudioPacienteSchema).countBy({ servicioId: serviceId })), 3);
    });
  } finally {
    await manager.getRepository(EstudioPacienteSchema).delete({ servicioId: serviceId });
    await manager.getRepository(UsuarioSchema).delete([userId, adminId, operativeId, supervisorId]);
    await manager.getRepository(PacienteSchema).delete([patientA, patientB]);
    await manager.getRepository(ServicioSchema).delete(serviceId);
    await manager.getRepository(SucursalSchema).delete([branchA, branchB]);
    await new Promise((resolve) => server.close(resolve));
    await AppDataSource.destroy();
  }
});
