import React, { useRef, useState } from 'react';
import { getLoginDestination, login } from '../services/authService.js';

export default function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const busy = useRef(false);
  const submit = async (event) => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setError('');
    try {
      await login(correo, password);
      window.location.assign(getLoginDestination(window.location.search));
    } catch (failure) {
      setError(failure.message);
      busy.current = false;
      setSaving(false);
    }
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-sm rounded border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Sistema de laboratorios</p>
        <h1 className="text-xl font-semibold text-slate-900">Iniciar sesion</h1>
        <p className="mt-2 text-sm text-slate-600">Ingresa con tu cuenta para consultar y registrar solicitudes de estudios.</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <fieldset disabled={saving} className="space-y-4">
            <label className="block text-sm">Correo<input autoFocus required type="email" maxLength={100} autoComplete="username" value={correo} onChange={(event) => { setCorreo(event.target.value); setError(''); }} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
            <label className="block text-sm">Contrasena<input required type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
            <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />Mostrar contrasena</label>
          </fieldset>
          {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button disabled={saving} type="submit" className="w-full rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? 'Ingresando...' : 'Entrar'}</button>
        </form>
        <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">
          <a href="/crear-cuenta" className="font-medium text-slate-900 underline">Crear cuenta</a>
          <p className="mt-2">Las cuentas las registra el administrador de tu laboratorio. Si necesitas acceso o recuperar tu contrasena, contactalo.</p>
        </div>
        <a href="/dashboard" className="mt-4 inline-block text-sm text-slate-600 underline">Volver al inicio</a>
      </section>
    </main>
  );
}
