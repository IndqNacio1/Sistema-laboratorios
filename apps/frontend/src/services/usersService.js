import { requestJson } from './apiClient.js';

export const usersEndpoints = { list: '/usuarios', create: '/usuarios' };
const requestUsers = (options) => requestJson(usersEndpoints.list, {
  ...options, conflictMessage: 'El correo ya esta registrado.',
});

export async function getUsers(options) {
  const data = await requestUsers(options);
  const rows = Array.isArray(data) ? data : data?.data;
  if (!Array.isArray(rows)) throw new Error('El servidor devolvio un listado de usuarios no valido.');
  return rows.map(({ id, nombre, correo, rol }) => ({ id, nombre, correo, rol }));
}

export function getUserPayload(formValues) {
  return {
    nombre: formValues.nombre.trim(), correo: formValues.correo.trim(),
    password: formValues.password, rol: formValues.rol,
  };
}

export async function createUser(formValues) {
  const data = await requestUsers({ method: 'POST', body: getUserPayload(formValues) });
  if (!data?.id) throw new Error('No se pudo confirmar el registro. Actualiza el listado antes de intentar nuevamente.');
  const { id, nombre, correo, rol } = data;
  return { id, nombre, correo, rol };
}
