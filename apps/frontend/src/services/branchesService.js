import { requestJson } from './apiClient.js';

export async function getBranches(options) {
  const rows = await requestJson('/sucursales', options);
  if (!Array.isArray(rows)) throw new Error('El servidor devolvio un listado de sucursales no valido.');
  return rows;
}

export async function getBranch(id, options) {
  const branch = await requestJson(`/sucursales/${encodeURIComponent(id)}`, options);
  if (branch?.id !== id) throw new Error('No se pudo consultar la sucursal.');
  return branch;
}

export function getBranchPayload(values) {
  return { nombre: values.nombre.trim(), direccion: values.direccion.trim(), telefono: values.telefono.trim() || null, estatus: values.estatus };
}

export async function saveBranch(values, id) {
  const branch = await requestJson(id ? `/sucursales/${encodeURIComponent(id)}` : '/sucursales', {
    method: id ? 'PUT' : 'POST', body: getBranchPayload(values),
  });
  if (!branch?.id || (id && branch.id !== id)) throw new Error('No se pudo confirmar el guardado. Actualiza el listado antes de reintentar.');
  return branch;
}
