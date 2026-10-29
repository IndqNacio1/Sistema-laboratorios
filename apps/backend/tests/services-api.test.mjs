import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { test } from 'node:test';
import app from '../src/app.js';
import { AppDataSource } from '../src/config/db.js';
import { ServicioSchema } from '../src/entities/Laboratorio.js';

test('catalogo de servicios conectado a PostgreSQL', async (t) => {
  await AppDataSource.initialize();
  const repository = AppDataSource.getRepository(ServicioSchema);
  const ids = [];
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const send = (path, method, body) => fetch(`${base}${path}`, { method,
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const form = { nombre: `Servicio API ${randomUUID()}`, descripcion: 'Prueba temporal', precio: '123.45', estatus: 'activo' };
  let saved;
  try {
    await t.test('registra solo campos editables y conserva centavos exactos', async () => {
      const forcedId = randomUUID();
      const response = await send('/servicios', 'POST', { ...form, id: forcedId, created_at: '1990-01-01' });
      assert.equal(response.status, 201);
      saved = await response.json();
      ids.push(saved.id);
      assert.notEqual(saved.id, forcedId);
      assert.equal(saved.precio, '123.45');
      assert.notEqual(saved.created_at.slice(0, 10), '1990-01-01');
      assert.equal((await repository.findOneByOrFail({ id: saved.id })).precio, '123.45');
    });
    await t.test('consulta individual y compatibilidad de estudios', async () => {
      const detail = await fetch(`${base}/servicios/${saved.id}`);
      assert.equal(detail.status, 200);
      assert.equal((await detail.json()).id, saved.id);
      const legacy = await fetch(`${base}/estudios`);
      assert.equal(legacy.status, 200);
      assert.ok((await legacy.json()).some((service) => service.id === saved.id));
    });
    await t.test('edita costo y estado sin cambiar UUID', async () => {
      const response = await send(`/servicios/${saved.id}`, 'PUT', { ...form, precio: '85.10', estatus: 'inactivo', descripcion: '' });
      assert.equal(response.status, 200);
      const data = await response.json();
      assert.equal(data.id, saved.id);
      assert.equal(data.precio, '85.10');
      assert.equal(data.descripcion, null);
      assert.equal((await repository.findOneByOrFail({ id: saved.id })).estatus, 'inactivo');
      const rows = await (await fetch(`${base}/servicios?estatus=inactivo`)).json();
      assert.ok(rows.some((service) => service.id === saved.id));
      assert.ok(rows.every((service) => service.estatus === 'inactivo'));
    });
    await t.test('acepta costo cero en la ruta anterior', async () => {
      const response = await send('/estudios', 'POST', { ...form, nombre: `${form.nombre} cero`, precio: 0 });
      assert.equal(response.status, 201);
      const data = await response.json();
      ids.push(data.id);
      assert.equal(data.precio, '0.00');
    });
    await t.test('rechaza nombres, costos y estados invalidos', async () => {
      for (const value of ['', -1, '0.001', '10000000000', null, true, '1e2', '12abc']) {
        assert.equal((await send('/servicios', 'POST', { ...form, precio: value })).status, 400);
      }
      for (const body of [{ ...form, nombre: ' ' }, { ...form, nombre: 'a'.repeat(151) },
        { ...form, descripcion: {} }, { ...form, descripcion: 'a'.repeat(2001) }, { ...form, estatus: null }]) {
        assert.equal((await send('/servicios', 'POST', body)).status, 400);
      }
      assert.equal((await send(`/servicios/${saved.id}`, 'PUT', { ...form, precio: '-1' })).status, 400);
      assert.equal((await repository.findOneByOrFail({ id: saved.id })).precio, '85.10');
    });
    await t.test('reporta identificadores y filtros incorrectos', async () => {
      assert.equal((await fetch(`${base}/servicios/no-uuid`)).status, 400);
      assert.equal((await fetch(`${base}/servicios/${randomUUID()}`)).status, 404);
      assert.equal((await send(`/servicios/${randomUUID()}`, 'PUT', form)).status, 404);
      assert.equal((await fetch(`${base}/servicios?estatus=desconocido`)).status, 400);
    });
  } finally {
    for (const id of ids) await repository.delete(id);
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await AppDataSource.destroy();
  }
});
