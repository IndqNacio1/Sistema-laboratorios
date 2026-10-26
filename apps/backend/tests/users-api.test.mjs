import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { test } from 'node:test';
import app from '../src/app.js';
import { AppDataSource } from '../src/config/db.js';

test('API de usuarios conectada a PostgreSQL', async (t) => {
  await AppDataSource.initialize();
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}/api`;
  const correo = `prueba-${randomUUID()}@example.test`;
  const password = randomUUID();
  const send = (path, body) => fetch(`${url}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  try {
    await t.test('health verifica la conexion', async () => {
      const response = await fetch(`${url}/health`);
      assert.equal(response.status, 200);
      assert.equal((await response.json()).baseDeDatos, 'conectada');
    });
    await t.test('registra y persiste un usuario sin exponer el hash', async () => {
      const response = await send('/usuarios', { nombre: 'Prueba de API', correo, password, rol: 'recepcion' });
      assert.equal(response.status, 201);
      const created = await response.json();
      assert.equal(created.password, undefined);
      assert.equal(created.sucursalId, '00000000-0000-4000-8000-000000000001');
      const saved = await AppDataSource.query('SELECT nombres FROM laboratorio.usuarios WHERE id=$1', [created.id]);
      assert.equal(saved[0].nombres, 'Prueba de API');
      const listed = await (await fetch(`${url}/usuarios`)).json();
      assert.ok(listed.some((user) => user.id === created.id));
      assert.ok(listed.every((user) => user.password === undefined));
    });
    await t.test('rechaza correos duplicados y roles invalidos', async () => {
      assert.equal((await send('/usuarios', { nombre: 'Duplicado', correo: correo.toUpperCase(), password })).status, 409);
      assert.equal((await send('/usuarios', { nombre: 'Invalido', correo, password, rol: 'desconocido' })).status, 400);
    });
    await t.test('login consulta el hash oculto y genera un token', async () => {
      const response = await send('/auth/login', { correo, password });
      assert.equal(response.status, 200);
      assert.equal(typeof (await response.json()).token, 'string');
    });
  } finally {
    await AppDataSource.query('DELETE FROM laboratorio.usuarios WHERE correo=$1', [correo]);
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await AppDataSource.destroy();
  }
});
