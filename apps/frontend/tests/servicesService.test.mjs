import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { getServices, getService, getServicePayload, saveService } from '../src/services/servicesService.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const form = { nombre: ' Servicio ', descripcion: ' ', precio: '100.10', estatus: 'activo' };

test('consulta el catalogo en su endpoint propio', async () => {
  globalThis.fetch = async (url) => { assert.equal(url, 'http://localhost:3000/api/servicios'); return Response.json([]); };
  assert.deepEqual(await getServices(), []);
});
test('normaliza texto sin convertir el costo a punto flotante', () => {
  assert.deepEqual(getServicePayload({ ...form, id: 'ignorado' }), { nombre: 'Servicio', descripcion: null, precio: '100.10', estatus: 'activo' });
});
test('usa POST para registro y PUT para edicion', async () => {
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    assert.equal(options.method, calls++ === 0 ? 'POST' : 'PUT');
    assert.equal(JSON.parse(options.body).precio, '100.10');
    return Response.json({ id: 's1', ...form });
  };
  assert.equal((await saveService(form)).id, 's1');
  assert.equal((await saveService(form, 's1')).id, 's1');
});
test('rechaza respuestas incompatibles y registros diferentes al solicitado', async () => {
  globalThis.fetch = async () => Response.json({ message: 'OK' });
  await assert.rejects(getServices(), /listado de servicios no valido/);
  await assert.rejects(saveService(form), /confirmar el guardado/);
  globalThis.fetch = async () => Response.json({ id: 'otro' });
  await assert.rejects(getService('s1'), /consultar el servicio/);
  await assert.rejects(saveService(form, 's1'), /confirmar el guardado/);
});
test('muestra el error de validacion del backend', async () => {
  globalThis.fetch = async () => Response.json({ message: 'El costo no es valido.' }, { status: 400 });
  await assert.rejects(saveService(form), /costo no es valido/);
});
