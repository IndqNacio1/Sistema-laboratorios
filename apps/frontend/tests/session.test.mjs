import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { getCurrentUser, getLoginDestination, login } from '../src/services/authService.js';
import { getSessionToken } from '../src/services/session.js';
import { requestJson } from '../src/services/apiClient.js';

const originalFetch = globalThis.fetch;
const originalStorage = globalThis.sessionStorage;
beforeEach(() => {
  const data = new Map();
  globalThis.sessionStorage = { getItem: (key) => data.get(key) || null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
});
afterEach(() => { globalThis.fetch = originalFetch; globalThis.sessionStorage = originalStorage; });

test('login guarda el token y el cliente lo envia como Bearer', async () => {
  globalThis.fetch = async (url, options) => {
    assert.deepEqual(JSON.parse(options.body), { correo: 'ana@example.test', password: 'clave1234' });
    return Response.json({ token: 'token-temporal' });
  };
  await login(' ana@example.test ', 'clave1234');
  assert.equal(getSessionToken(), 'token-temporal');
  globalThis.fetch = async (url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer token-temporal');
    return Response.json({});
  };
  await requestJson('/solicitudes-estudios/opciones');
});
test('una respuesta 401 invalida la sesion y conserva el codigo HTTP', async () => {
  globalThis.fetch = async () => Response.json({}, { status: 401 });
  await assert.rejects(requestJson('/solicitudes-estudios/opciones'), (error) => error.status === 401);
  assert.equal(getSessionToken(), null);
});

test('login muestra credenciales incorrectas y no deja un token anterior', async () => {
  sessionStorage.setItem('laboratorio_session', 'anterior');
  globalThis.fetch = async () => Response.json({ message: 'Error' }, { status: 401 });
  await assert.rejects(login('ana@example.test', 'incorrecta'), /Correo o contrasena incorrectos/);
  assert.equal(getSessionToken(), null);
  globalThis.fetch = async () => Response.json({}, { status: 403 });
  await assert.rejects(login('ana@example.test', 'incorrecta'), /cuenta o sucursal/);
});

test('consulta cuenta actual y rechaza respuestas de sesion incompletas', async () => {
  const user = { id: 'u1', rol: 'administrador', sucursalId: 's1' };
  globalThis.fetch = async (url) => { assert.ok(url.endsWith('/auth/me')); return Response.json(user); };
  assert.deepEqual(await getCurrentUser(), user);
  globalThis.fetch = async () => Response.json({ id: 'u1' });
  await assert.rejects(getCurrentUser(), /verificar la cuenta/);
});

test('el regreso despues del login solo admite rutas internas conocidas', () => {
  assert.equal(getLoginDestination('?next=%2Fcrear-cuenta'), '/crear-cuenta');
  assert.equal(getLoginDestination('?next=%2Fsolicitudes-estudios'), '/solicitudes-estudios');
  for (const next of ['https://example.com', '//example.com', '/desconocido', 'javascript:alert(1)']) {
    assert.equal(getLoginDestination('?next=' + encodeURIComponent(next)), '/solicitudes-estudios/listado');
  }
});
