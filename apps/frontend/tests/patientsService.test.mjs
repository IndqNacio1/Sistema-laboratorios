import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { getPatient, getPatients, getBranches, getPatientPayload, savePatient } from '../src/services/patientsService.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const values = { nombre: ' Ana ', apellidos: ' Rivera ', correo: ' ', telefono: ' ', genero: '', fechaNacimiento: '', sucursalId: 's1', estatus: 'activo' };

test('pacientes y sucursales consultan las rutas reales', async () => {
  globalThis.fetch = async (url) => { assert.ok(url.endsWith('/pacientes') || url.endsWith('/sucursales')); return Response.json([]); };
  assert.deepEqual(await getPatients(), []);
  assert.deepEqual(await getBranches(), []);
});
test('serializa solo los campos editables y normaliza opcionales vacios', () => {
  assert.deepEqual(getPatientPayload({ ...values, id: 'ignorado' }), { nombre: 'Ana', apellidos: 'Rivera', correo: null, telefono: null, genero: null, fechaNacimiento: null, sucursalId: 's1', estatus: 'activo' });
});
test('usa POST para altas y PUT para ediciones', async () => {
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    assert.equal(options.method, calls++ === 0 ? 'POST' : 'PUT');
    assert.equal(JSON.parse(options.body).apellidos, 'Rivera');
    return Response.json({ id: 'p1', nombre: 'Ana', apellidos: 'Rivera' });
  };
  assert.equal((await savePatient(values)).id, 'p1');
  assert.equal((await savePatient(values, 'p1')).id, 'p1');
});
test('no confirma respuestas incompatibles ni fichas de otro paciente', async () => {
  globalThis.fetch = async () => Response.json({ message: 'OK' });
  await assert.rejects(getPatients(), /listado no valido/);
  await assert.rejects(savePatient(values), /confirmar el guardado/);
  globalThis.fetch = async () => Response.json({ id: 'otro' });
  await assert.rejects(getPatient('p1'), /ficha del paciente/);
});
test('conserva el mensaje de validacion del servidor', async () => {
  globalThis.fetch = async () => Response.json({ message: 'La sucursal esta inactiva.' }, { status: 400 });
  await assert.rejects(savePatient(values), /sucursal esta inactiva/);
});
