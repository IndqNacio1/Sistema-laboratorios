import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { getBranches, getBranch, getBranchPayload, saveBranch } from '../src/services/branchesService.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const form = { nombre: ' Norte ', direccion: ' Calle 123 ', telefono: ' ', estatus: 'activo' };

test('consulta las sucursales reales', async () => {
  globalThis.fetch = async (url) => { assert.equal(url, 'http://localhost:3000/api/sucursales'); return Response.json([]); };
  assert.deepEqual(await getBranches(), []);
});
test('serializa solo campos editables y normaliza telefono vacio', () => {
  assert.deepEqual(getBranchPayload({ ...form, id: 'ignorado' }), { nombre: 'Norte', direccion: 'Calle 123', telefono: null, estatus: 'activo' });
});
test('distingue altas y ediciones', async () => {
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    assert.equal(options.method, calls++ === 0 ? 'POST' : 'PUT');
    assert.equal(JSON.parse(options.body).direccion, 'Calle 123');
    return Response.json({ id: 's1', ...form });
  };
  assert.equal((await saveBranch(form)).id, 's1');
  assert.equal((await saveBranch(form, 's1')).id, 's1');
});
test('no confirma respuestas incompatibles', async () => {
  globalThis.fetch = async () => Response.json({ message: 'OK' });
  await assert.rejects(getBranches(), /listado de sucursales no valido/);
  await assert.rejects(saveBranch(form), /confirmar el guardado/);
  globalThis.fetch = async () => Response.json({ id: 'otro' });
  await assert.rejects(getBranch('s1'), /consultar la sucursal/);
  await assert.rejects(saveBranch(form, 's1'), /confirmar el guardado/);
});
test('conserva el mensaje de nombre duplicado del servidor', async () => {
  globalThis.fetch = async () => Response.json({ message: 'Ya existe una sucursal con ese nombre.' }, { status: 409 });
  await assert.rejects(saveBranch(form), /existe una sucursal/);
});
