import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { createUser, getUserPayload, getUsers } from '../src/services/usersService.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test('consulta el endpoint real y descarta campos sensibles', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'http://localhost:3000/api/usuarios');
    assert.equal(options.method, 'GET');
    return Response.json([{ id: 'u1', nombre: 'Ana', correo: 'ana@example.test', rol: 'recepcion', password: 'hash' }]);
  };
  const users = await getUsers();
  assert.equal(users[0].id, 'u1');
  assert.equal('password' in users[0], false);
});

test('acepta una lista vacia y rechaza respuestas incompatibles', async () => {
  globalThis.fetch = async () => Response.json({ data: [] });
  assert.deepEqual(await getUsers(), []);
  globalThis.fetch = async () => Response.json({ mensaje: 'OK' });
  await assert.rejects(getUsers(), /listado de usuarios no valido/);
});

test('registra con los nombres de campos del controlador sin datos de sucursal inventados', async () => {
  const values = { nombre: ' Ana ', correo: ' ana@example.test ', password: 'clave1234', rol: 'recepcion', estado: 'Activo' };
  const expected = { nombre: 'Ana', correo: 'ana@example.test', password: 'clave1234', rol: 'recepcion' };
  assert.deepEqual(getUserPayload(values), expected);
  globalThis.fetch = async (url, options) => {
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), expected);
    assert.equal(options.headers['Content-Type'], 'application/json');
    return Response.json({ ...expected, id: 'u2' }, { status: 201 });
  };
  const created = await createUser(values);
  assert.equal(created.id, 'u2');
  assert.equal('password' in created, false);
});

test('reporta duplicados, permisos y errores del servidor', async () => {
  for (const [status, pattern] of [[409, /correo ya esta registrado/], [401, /sesion/], [403, /permiso/], [500, /Error al guardar/]]) {
    globalThis.fetch = async () => Response.json({ message: 'Error al guardar' }, { status });
    await assert.rejects(getUsers(), pattern);
  }
});

test('no confirma altas si el servidor no devuelve el registro', async () => {
  globalThis.fetch = async () => Response.json({ message: 'OK' }, { status: 201 });
  await assert.rejects(createUser({ nombre: 'Ana', correo: 'ana@example.test', password: 'clave1234', rol: 'recepcion' }), /No se pudo confirmar/);
});

test('distingue error de red y permite cancelar la consulta', async () => {
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(getUsers(), /No se pudo conectar/);
  globalThis.fetch = async (url, { signal }) => {
    signal.throwIfAborted();
    return Response.json([]);
  };
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(getUsers({ signal: controller.signal }), { name: 'AbortError' });
});
