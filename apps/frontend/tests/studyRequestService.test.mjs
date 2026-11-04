import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { getStudyOptions, prepareStudyRequest } from '../src/services/studyRequestService.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const patient = { id: 'p1', estatus: 'activo' };
const service = { id: 's1', estatus: 'activo', precio: '85.10' };

test('consulta pacientes y servicios y excluye registros inactivos', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(options.method, 'GET');
    assert.match(url, /\/api\/(pacientes|servicios)$/);
    const item = url.endsWith('/pacientes') ? patient : service;
    return Response.json([item, { ...item, id: 'inactivo', estatus: 'inactivo' }]);
  };
  assert.deepEqual(await getStudyOptions(), { patients: [patient], services: [service] });
});

test('solo prepara identificadores, sin costo ni usuario editable', () => {
  assert.deepEqual(prepareStudyRequest(patient, service), { pacienteId: 'p1', servicioId: 's1' });
  assert.deepEqual(prepareStudyRequest(patient, { ...service, precio: '0.00' }), { pacienteId: 'p1', servicioId: 's1' });
});

test('rechaza selecciones ausentes o inactivas y costos invalidos', () => {
  assert.throws(() => prepareStudyRequest(null, service), /paciente activo/);
  assert.throws(() => prepareStudyRequest({ ...patient, estatus: 'inactivo' }, service), /paciente activo/);
  assert.throws(() => prepareStudyRequest(patient, null), /servicio activo/);
  assert.throws(() => prepareStudyRequest(patient, { ...service, estatus: 'inactivo' }), /servicio activo/);
  for (const precio of [null, '', '-1', '1.001']) {
    assert.throws(() => prepareStudyRequest(patient, { ...service, precio }), /costo valido/);
  }
});

test('propaga el fallo si no puede cargar uno de los catalogos', async () => {
  globalThis.fetch = async (url) => url.endsWith('/servicios')
    ? Response.json({ message: 'Servicios no disponibles.' }, { status: 500 }) : Response.json([patient]);
  await assert.rejects(getStudyOptions(), /Servicios no disponibles/);
});
