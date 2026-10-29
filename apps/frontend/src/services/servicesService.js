import { requestJson } from './apiClient.js';

export async function getServices(options) {
  const rows = await requestJson('/servicios', options);
  if (!Array.isArray(rows)) throw new Error('El servidor devolvio un listado de servicios no valido.');
  return rows;
}

export async function getService(id, options) {
  const service = await requestJson(`/servicios/${encodeURIComponent(id)}`, options);
  if (service?.id !== id) throw new Error('No se pudo consultar el servicio.');
  return service;
}

export function getServicePayload(values) {
  return {
    nombre: values.nombre.trim(), descripcion: values.descripcion.trim() || null,
    precio: String(values.precio), estatus: values.estatus,
  };
}

export async function saveService(values, id) {
  const saved = await requestJson(id ? `/servicios/${encodeURIComponent(id)}` : '/servicios', {
    method: id ? 'PUT' : 'POST', body: getServicePayload(values),
  });
  if (!saved?.id || (id && saved.id !== id)) throw new Error('No se pudo confirmar el guardado. Actualiza el listado antes de reintentar.');
  return saved;
}
