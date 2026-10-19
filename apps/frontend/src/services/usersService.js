const apiUrl = (import.meta.env?.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

export const usersEndpoints = { list: '/usuarios', create: '/usuarios' };

async function requestUsers({ method = 'GET', body, signal } = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timeout = setTimeout(abort, 15000);
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) controller.abort();
  try {
    const response = await fetch(`${apiUrl}${usersEndpoints.list}`, {
      method,
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401) throw new Error('Tu sesion no es valida. Inicia sesion nuevamente.');
      if (response.status === 403) throw new Error('No tienes permiso para administrar usuarios.');
      if (response.status === 409) throw new Error('El correo ya esta registrado.');
      throw new Error(data?.message || data?.mensaje || 'No se pudo completar la solicitud.');
    }
    return data;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (controller.signal.aborted) throw new Error('La solicitud tardo demasiado. Intenta nuevamente.');
    if (error instanceof TypeError) throw new Error('No se pudo conectar con el servidor. Intenta nuevamente.');
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

export async function getUsers(options) {
  const data = await requestUsers(options);
  const rows = Array.isArray(data) ? data : data?.data;
  if (!Array.isArray(rows)) throw new Error('El servidor devolvio un listado de usuarios no valido.');
  return rows.map(({ id, nombre, correo, rol }) => ({ id, nombre, correo, rol }));
}

export function getUserPayload(formValues) {
  return {
    nombre: formValues.nombre.trim(),
    correo: formValues.correo.trim(),
    password: formValues.password,
    rol: formValues.rol,
  };
}

export async function createUser(formValues) {
  const data = await requestUsers({ method: 'POST', body: getUserPayload(formValues) });
  if (!data?.id) throw new Error('No se pudo confirmar el registro. Actualiza el listado antes de intentar nuevamente.');
  const { id, nombre, correo, rol } = data;
  return { id, nombre, correo, rol };
}
