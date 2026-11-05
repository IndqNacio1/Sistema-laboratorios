import React, { useRef, useState } from 'react';
import { login } from '../services/authService.js';

export default function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const submit = async (event) => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setError('');
    try {
      await login(correo, password);
      window.location.assign('/solicitudes-estudios');
    } catch (failure) {
      setError(failure.message);
      busy.current = false;
      setSaving(false);
    }
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-sm rounded border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Iniciar sesion</h1>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <fieldset disabled={saving} className="space-y-4">
            <label className="block text-sm">Correo<input autoFocus required type="email" autoComplete="username" value={correo} onChange={(event) => setCorreo(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
            <label className="block text-sm">Contrasena<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
          </fieldset>
          {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button disabled={saving} type="submit" className="w-full rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? 'Ingresando...' : 'Entrar'}</button>
        </form>
        <a href="/dashboard" className="mt-4 inline-block text-sm text-slate-600 underline">Volver al inicio</a>
      </section>
    </main>
  );
}
