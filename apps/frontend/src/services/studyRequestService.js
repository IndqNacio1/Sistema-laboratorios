import { requestJson } from './apiClient.js';

export async function getStudyRequests({ search = '', estado = '', page = 1, signal } = {}) {
  const query = new URLSearchParams({ search: search.trim(), estado, page: String(page), limit: '20' });
  const data = await requestJson(`/solicitudes-estudios?${query}`, { signal });
  if (!Array.isArray(data?.items) || !Number.isInteger(data.total) || data.total < 0 || !data.usuario?.id
    || !Number.isInteger(data.page) || data.page < 1 || !Number.isInteger(data.limit) || data.limit < 1) {
    throw new Error('No se pudo cargar el listado de solicitudes.');
  }
  return data;
}

export async function getStudyOptions(options) {
  const data = await requestJson('/solicitudes-estudios/opciones', options);
  if (!Array.isArray(data?.patients) || !Array.isArray(data?.services) || !data?.usuario?.id) throw new Error('No se pudieron cargar las opciones de solicitud.');
  const { patients, services, usuario } = data;
  return {
    usuario,
    patients: patients.filter((patient) => patient.estatus === 'activo'),
    services: services.filter((service) => service.estatus === 'activo'),
  };
}

export async function saveStudyRequest(draft) {
  const data = await requestJson('/solicitudes-estudios', { method: 'POST', body: {
    pacienteId: draft.pacienteId, servicioId: draft.servicioId,
  } });
  if (!data?.id || data.estado !== 'pendiente' || data.pacienteId !== draft.pacienteId || data.servicioId !== draft.servicioId) {
    throw new Error('No se pudo confirmar la solicitud. Consulta al responsable antes de intentar nuevamente.');
  }
  return data;
}

export const hasValidStudyPrice = (price) => /^\d{1,10}(\.\d{1,2})?$/.test(String(price));

export function prepareStudyRequest(patient, service) {
  if (!patient?.id || patient.estatus !== 'activo') throw new Error('Selecciona un paciente activo.');
  if (!service?.id || service.estatus !== 'activo') throw new Error('Selecciona un servicio activo.');
  if (!hasValidStudyPrice(service.precio)) throw new Error('El servicio no tiene un costo valido.');
  return { pacienteId: patient.id, servicioId: service.id };
}
