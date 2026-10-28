import { requestJson } from './apiClient.js';

async function getList(path, options) {
  const data = await requestJson(path, options);
  if (!Array.isArray(data)) throw new Error('El servidor devolvio un listado no valido.');
  return data;
}

export const getPatients = (options) => getList('/pacientes', options);
export const getBranches = (options) => getList('/sucursales', options);

export async function getPatient(id, options) {
  const data = await requestJson(`/pacientes/${encodeURIComponent(id)}`, options);
  if (data?.id !== id) throw new Error('No se pudo consultar la ficha del paciente.');
  return data;
}

export function getPatientPayload(values) {
  return {
    nombre: values.nombre.trim(), apellidos: values.apellidos.trim(),
    telefono: values.telefono.trim() || null, correo: values.correo.trim() || null,
    fechaNacimiento: values.fechaNacimiento || null, genero: values.genero.trim() || null,
    sucursalId: values.sucursalId, estatus: values.estatus,
  };
}

export async function savePatient(values, id) {
  const data = await requestJson(id ? `/pacientes/${encodeURIComponent(id)}` : '/pacientes', {
    method: id ? 'PUT' : 'POST', body: getPatientPayload(values),
  });
  if (!data?.id || (id && data.id !== id)) throw new Error('No se pudo confirmar el guardado. Actualiza el listado antes de reintentar.');
  return data;
}
