import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { test } from 'node:test';
import app from '../src/app.js';
import { AppDataSource } from '../src/config/db.js';
import { SucursalSchema, PacienteSchema, UsuarioSchema } from '../src/entities/Laboratorio.js';

test('registro y edicion de sucursales en PostgreSQL', async (t) => {
  await AppDataSource.initialize();
  const repository = AppDataSource.getRepository(SucursalSchema);
  const ids = [];
  const personId = randomUUID();
  const userId = randomUUID();
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api/sucursales`;
  const send = (path, method, body) => fetch(`${base}${path}`, { method,
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const form = { nombre: `Sucursal API ${randomUUID()}`, direccion: 'Calle de prueba 123', telefono: '+52 6681234567', estatus: 'activo' };
  let saved;
  try {
    await t.test('registra solo datos editables', async () => {
      const forcedId = randomUUID();
      const response = await send('', 'POST', { ...form, id: forcedId, expiresAt: '2030-01-01', created_at: '1990-01-01' });
      assert.equal(response.status, 201);
      saved = await response.json();
      ids.push(saved.id);
      assert.notEqual(saved.id, forcedId);
      assert.equal(saved.expiresAt, null);
      assert.notEqual(saved.created_at.slice(0, 10), '1990-01-01');
      assert.equal((await repository.findOneByOrFail({ id: saved.id })).direccion, form.direccion);
    });
    await t.test('rechaza nombres duplicados', async () => {
      assert.equal((await send('', 'POST', form)).status, 409);
    });
    await t.test('consulta y edita sin perder relaciones', async () => {
      await AppDataSource.getRepository(PacienteSchema).save({ id: personId, sucursalId: saved.id, nombre: 'Paciente temporal', apellidos: 'Prueba' });
      await AppDataSource.getRepository(UsuarioSchema).save({ id: userId, sucursalId: saved.id, nombre: 'Usuario temporal', correo: `${userId}@example.test`, password: 'hash-temporal', rol: 'recepcion' });
      const detail = await fetch(`${base}/${saved.id}`);
      assert.equal(detail.status, 200);
      assert.equal((await detail.json()).telefono, form.telefono);
      const response = await send(`/${saved.id}`, 'PUT', { ...form, nombre: `${form.nombre} editada`, direccion: 'Nueva direccion', telefono: '', estatus: 'inactivo' });
      assert.equal(response.status, 200);
      const data = await response.json();
      assert.equal(data.id, saved.id);
      assert.equal(data.telefono, null);
      assert.equal(data.estatus, 'inactivo');
      assert.equal((await repository.findOneByOrFail({ id: saved.id })).direccion, 'Nueva direccion');
      assert.equal((await AppDataSource.getRepository(PacienteSchema).findOneByOrFail({ id: personId })).sucursalId, saved.id);
      assert.equal((await AppDataSource.getRepository(UsuarioSchema).findOneByOrFail({ id: userId })).sucursalId, saved.id);
    });
    await t.test('filtra estados y conserva campos usados por pacientes', async () => {
      const response = await fetch(`${base}?estatus=inactivo`);
      assert.equal(response.status, 200);
      const rows = await response.json();
      assert.ok(rows.some((branch) => branch.id === saved.id));
      assert.ok(rows.every((branch) => branch.estatus === 'inactivo' && typeof branch.nombre === 'string'));
      assert.ok(rows.every((branch) => Object.hasOwn(branch, 'direccion')));
    });
    await t.test('rechaza campos invalidos sin modificar la sucursal', async () => {
      for (const body of [
        { ...form, nombre: ' ' }, { ...form, nombre: 'a'.repeat(101) },
        { ...form, direccion: '' }, { ...form, direccion: 'a'.repeat(501) },
        { ...form, telefono: 'correo@ejemplo' }, { ...form, telefono: '123' },
        { ...form, telefono: 6681234567 }, { ...form, estatus: null },
      ]) assert.equal((await send('', 'POST', body)).status, 400);
      assert.equal((await send(`/${saved.id}`, 'PUT', { ...form, direccion: ' ' })).status, 400);
      assert.equal((await repository.findOneByOrFail({ id: saved.id })).direccion, 'Nueva direccion');
    });
    await t.test('reporta identificadores y filtros invalidos', async () => {
      assert.equal((await fetch(`${base}/no-uuid`)).status, 400);
      assert.equal((await fetch(`${base}/${randomUUID()}`)).status, 404);
      assert.equal((await send(`/${randomUUID()}`, 'PUT', form)).status, 404);
      assert.equal((await fetch(`${base}?estatus=desconocido`)).status, 400);
    });
  } finally {
    await AppDataSource.getRepository(PacienteSchema).delete(personId);
    await AppDataSource.getRepository(UsuarioSchema).delete(userId);
    for (const id of ids) await repository.delete(id);
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await AppDataSource.destroy();
  }
});
