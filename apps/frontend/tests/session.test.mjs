import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { login } from '../src/services/authService.js';
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
