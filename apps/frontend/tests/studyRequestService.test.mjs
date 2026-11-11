import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { getStudyOptions, prepareStudyRequest, saveStudyRequest, getStudyRequests } from '../src/services/studyRequestService.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const patient = { id: 'p1', estatus: 'activo' };
const service = { id: 's1', estatus: 'activo', precio: '85.10' };

test('consulta listado con filtros codificados, pagina y cancelacion', async () => {
  const controller = new AbortController();
  const data = { items: [{ id: 'e1' }], total: 21, page: 2, limit: 20, usuario: { id: 'u1' } };
  globalThis.fetch = async (url, options) => {
    const query = new URL(url).searchParams;
    assert.equal(query.get('search'), 'Ana & Luis');
    assert.equal(query.get('estado'), 'pendiente');
    assert.equal(query.get('page'), '2');
    assert.equal(query.get('limit'), '20');
    assert.equal(options.method, 'GET');
    assert.ok(options.signal);
    return Response.json(data);
  };
  assert.deepEqual(await getStudyRequests({ search: ' Ana & Luis ', estado: 'pendiente', page: 2, signal: controller.signal }), data);
});

test('rechaza listado incompleto y propaga errores del servidor', async () => {
  globalThis.fetch = async () => Response.json({ items: [], total: 0 });
  await assert.rejects(getStudyRequests(), /listado/);
  globalThis.fetch = async () => Response.json({ message: 'Consulta no disponible.' }, { status: 500 });
  await assert.rejects(getStudyRequests(), /Consulta no disponible/);
});

test('consulta pacientes y servicios y excluye registros inactivos', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(options.method, 'GET');
    assert.ok(url.endsWith('/api/solicitudes-estudios/opciones'));
    return Response.json({ usuario: { id: 'u1' },
      patients: [patient, { ...patient, id: 'inactivo', estatus: 'inactivo' }],
      services: [service, { ...service, id: 'inactivo', estatus: 'inactivo' }] });
  };
  assert.deepEqual(await getStudyOptions(), { usuario: { id: 'u1' }, patients: [patient], services: [service] });
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
  globalThis.fetch = async () => Response.json({ message: 'Servicios no disponibles.' }, { status: 500 });
  await assert.rejects(getStudyOptions(), /Servicios no disponibles/);
});

test('guarda solo identificadores y confirma la respuesta persistida', async () => {
  globalThis.fetch = async (url, options) => {
    assert.ok(url.endsWith('/api/solicitudes-estudios'));
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { pacienteId: 'p1', servicioId: 's1' });
    return Response.json({ id: 'e1', pacienteId: 'p1', servicioId: 's1', estado: 'pendiente' }, { status: 201 });
  };
  assert.equal((await saveStudyRequest({ pacienteId: 'p1', servicioId: 's1', usuarioId: 'ignorado' })).id, 'e1');
  globalThis.fetch = async () => Response.json({ message: 'OK' });
  await assert.rejects(saveStudyRequest({ pacienteId: 'p1', servicioId: 's1' }), /confirmar la solicitud/);
});
