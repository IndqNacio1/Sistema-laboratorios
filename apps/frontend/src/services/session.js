const key = 'laboratorio_session';
export function getSessionToken() {
  return typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(key);
}
export function setSessionToken(token) {
  sessionStorage.setItem(key, token);
}
export function clearSession() {
  if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(key);
}
