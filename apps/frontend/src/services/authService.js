import { requestJson } from './apiClient.js';
import { setSessionToken } from './session.js';

export async function login(correo, password) {
  const data = await requestJson('/auth/login', { method: 'POST', body: { correo: correo.trim(), password } });
  if (typeof data?.token !== 'string' || !data.token) throw new Error('No se pudo confirmar la sesion.');
  setSessionToken(data.token);
}
