import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { test } from 'node:test';
import app from '../src/app.js';
import { AppDataSource } from '../src/config/db.js';
import { PacienteSchema, SucursalSchema } from '../src/entities/Laboratorio.js';

test('consulta, registro y edicion de pacientes en PostgreSQL', async (t) => {
  await AppDataSource.initialize();
  const branchRepository = AppDataSource.getRepository(SucursalSchema);
  const patientRepository = AppDataSource.getRepository(PacienteSchema);
  const branchId = randomUUID();
  const inactiveId = randomUUID();
  const patientIds = [];
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const send = (path, method, body) => fetch(`${base}${path}`, {
    method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const form = { nombre: 'Paciente API', apellidos: 'Temporal', telefono: '6681234567',
    correo: 'paciente@example.test', sucursalId: branchId, fechaNacimiento: '2000-02-29', genero: 'otro', estatus: 'activo' };
  let saved;
  try {
    await branchRepository.save([
      { id: branchId, nombre: `API-${branchId}`, direccion: 'Prueba temporal' },
      { id: inactiveId, nombre: `API-${inactiveId}`, direccion: 'Prueba temporal', estatus: 'inactivo' },
    ]);
    await t.test('consulta las sucursales reales', async () => {
      const response = await fetch(`${base}/sucursales`);
      assert.equal(response.status, 200);
      assert.ok((await response.json()).some((branch) => branch.id === branchId));
    });
    await t.test('registra solo campos permitidos', async () => {
      const response = await send('/pacientes', 'POST', { ...form, id: randomUUID(), created_at: '1990-01-01' });
      assert.equal(response.status, 201);
      saved = await response.json();
      patientIds.push(saved.id);
      assert.equal(saved.nombre, form.nombre);
      assert.equal(saved.sucursalId, branchId);
      assert.notEqual(saved.created_at.slice(0, 10), '1990-01-01');
      assert.equal((await patientRepository.findOneByOrFail({ id: saved.id })).correo, form.correo);
    });
    await t.test('consulta ficha, edita y conserva la identidad', async () => {
      const detail = await fetch(`${base}/pacientes/${saved.id}`);
      assert.equal(detail.status, 200);
      assert.equal((await detail.json()).apellidos, form.apellidos);
      const edited = await send(`/pacientes/${saved.id}`, 'PUT', { ...form, nombre: 'Paciente actualizado', estatus: 'inactivo', telefono: '', correo: '' });
      assert.equal(edited.status, 200);
      const data = await edited.json();
      assert.equal(data.id, saved.id);
      assert.equal(data.telefono, null);
      assert.equal(data.estatus, 'inactivo');
      assert.equal((await patientRepository.findOneByOrFail({ id: saved.id })).nombre, 'Paciente actualizado');
    });
    await t.test('filtra por sucursal y estado', async () => {
      const response = await fetch(`${base}/pacientes?sucursalId=${branchId}&estatus=inactivo`);
      const rows = await response.json();
      assert.equal(response.status, 200);
      assert.ok(rows.some((patient) => patient.id === saved.id));
      assert.ok(rows.every((patient) => patient.sucursalId === branchId && patient.estatus === 'inactivo'));
      const active = await (await fetch(`${base}/pacientes?sucursalId=${branchId}&estatus=activo`)).json();
      assert.equal(active.length, 0);
    });
    await t.test('rechaza datos invalidos sin escribir pacientes', async () => {
      for (const values of [
        { ...form, nombre: ' ' }, { ...form, correo: 'no-es-correo' }, { ...form, apellidos: '' },
        { ...form, telefono: 123 }, { ...form, fechaNacimiento: '2025-02-30' },
        { ...form, fechaNacimiento: '2999-01-01' }, { ...form, fechaNacimiento: false },
        { ...form, estatus: 'desconocido' }, { ...form, sucursalId: null },
        { ...form, sucursalId: inactiveId }, { ...form, sucursalId: randomUUID() },
      ]) assert.equal((await send('/pacientes', 'POST', values)).status, 400);
      assert.equal(await patientRepository.countBy({ sucursalId: branchId }), 1);
    });
    await t.test('responde 400 o 404 para identificadores y filtros invalidos', async () => {
      assert.equal((await fetch(`${base}/pacientes/no-uuid`)).status, 400);
      assert.equal((await fetch(`${base}/pacientes/${randomUUID()}`)).status, 404);
      assert.equal((await send(`/pacientes/${randomUUID()}`, 'PUT', form)).status, 404);
      assert.equal((await fetch(`${base}/pacientes?estatus=desconocido`)).status, 400);
      assert.equal((await fetch(`${base}/pacientes?sucursalId=no-uuid`)).status, 400);
    });
  } finally {
    for (const id of patientIds) await patientRepository.delete(id);
    await branchRepository.delete([branchId, inactiveId]);
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await AppDataSource.destroy();
  }
});
