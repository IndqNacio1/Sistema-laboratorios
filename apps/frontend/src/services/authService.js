import { requestJson } from './apiClient.js';
import { setSessionToken } from './session.js';

export async function login(correo, password) {
  const data = await requestJson('/auth/login', { method: 'POST', body: { correo: correo.trim(), password },
    unauthorizedMessage: 'Correo o contrasena incorrectos.', forbiddenMessage: 'Tu cuenta o sucursal no esta disponible. Contacta al administrador.' });
  if (typeof data?.token !== 'string' || !data.token) throw new Error('No se pudo confirmar la sesion.');
  setSessionToken(data.token);
}

export async function getCurrentUser(options) {
  const user = await requestJson('/auth/me', options);
  if (!user?.id || !user.rol || !user.sucursalId) throw new Error('No se pudo verificar la cuenta.');
  return user;
}

export function getLoginDestination(search = '') {
  const next = new URLSearchParams(search).get('next');
  return ['/crear-cuenta', '/usuarios', '/solicitudes-estudios', '/solicitudes-estudios/listado'].includes(next) ? next : '/solicitudes-estudios/listado';
}
