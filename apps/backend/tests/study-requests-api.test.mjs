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
    await t.test('lista registros persistidos por sucursal, rol y filtros sin exponer resultados', async () => {
      assert.equal((await send('', 'GET', null, null)).status, 401);
      const own = await (await send('')).json();
      assert.equal(own.total, 2);
      assert.ok(own.items.every((item) => item.sucursalId === branchA));
      assert.ok(own.items.every((item) => item.paciente === 'Paciente A Temporal' && item.servicio === 'Servicio temporal'));
      assert.ok(own.items.every((item) => !('resultado' in item) && !('usuarioId' in item)));
      const admin = await (await send('?search=' + serviceId, 'GET', null, token(adminId))).json();
      assert.equal(admin.total, 0);
      const global = await (await send('?search=Servicio%20temporal', 'GET', null, token(adminId))).json();
      assert.ok(global.items.some((item) => item.pacienteId === patientB));
      const supervisor = await (await send('', 'GET', null, token(supervisorId))).json();
      assert.equal(supervisor.total, 2);
      assert.equal((await (await send('?search=Paciente%20B')).json()).total, 0);
      assert.equal((await (await send('?search=' + own.items[0].id)).json()).total, 1);
      assert.equal((await (await send('?search=%25')).json()).total, 0);
      assert.equal((await (await send('?estado=completado')).json()).total, 0);
      const first = await (await send('?limit=1&page=1&estado=pendiente')).json();
      const second = await (await send('?limit=1&page=2&estado=pendiente')).json();
      assert.equal(first.total, 2);
      assert.equal(first.items.length, 1);
      assert.notEqual(first.items[0].id, second.items[0].id);
      const reloaded = await (await send('?limit=1&page=1&estado=pendiente')).json();
      assert.equal(reloaded.items[0].id, first.items[0].id);
      assert.deepEqual((await (await send('?page=3&limit=1')).json()).items, []);
      await manager.getRepository(PacienteSchema).update(patientA, { estatus: 'inactivo' });
      assert.equal((await (await send('')).json()).total, 2);
      await manager.getRepository(PacienteSchema).update(patientA, { estatus: 'activo' });
    });
    await t.test('valida filtros y aplica los permisos actuales al listado', async () => {
      for (const query of ['?estado=otro', '?page=0', '?limit=51', '?page=1.5', '?search=a&search=b', '?search=' + 'a'.repeat(101)]) {
        assert.equal((await send(query)).status, 400, query);
      }
      const adminToken = token(adminId);
      await manager.getRepository(UsuarioSchema).update(adminId, { rol: 'supervisor' });
      assert.equal((await (await send('?search=Paciente%20A', 'GET', null, adminToken)).json()).total, 0);
      await manager.getRepository(UsuarioSchema).update(adminId, { rol: 'administrador' });
      await manager.getRepository(UsuarioSchema).update(userId, { estatus: 'inactivo' });
      assert.equal((await send('')).status, 401);
      await manager.getRepository(UsuarioSchema).update(userId, { estatus: 'activo' });
      await manager.getRepository(SucursalSchema).update(branchA, { estatus: 'inactivo' });
      assert.equal((await send('')).status, 403);
      await manager.getRepository(SucursalSchema).update(branchA, { estatus: 'activo' });
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
