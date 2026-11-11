import React, { useEffect, useRef, useState } from 'react';
import { getCurrentUser } from '../services/authService.js';
import { createUser, getRegistrationOptions } from '../services/usersService.js';
import { clearSession } from '../services/session.js';

const initial = { nombre: '', apellidos: '', correo: '', password: '', confirmPassword: '', rol: 'recepcion', sucursalId: '' };
const labels = { administrador: 'Administrador', supervisor: 'Supervisor', operativo: 'Operativo', recepcion: 'Recepcion' };
const inputClass = 'mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm';

export default function CreateAccountPage() {
  const [user, setUser] = useState(null);
  const [options, setOptions] = useState(null);
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [created, setCreated] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setUser(null);
    setOptions(null);
    getCurrentUser({ signal: controller.signal }).then(async (current) => {
      if (controller.signal.aborted) return;
      setUser(current);
      if (current.rol !== 'administrador') return;
      const data = await getRegistrationOptions({ signal: controller.signal });
      if (!controller.signal.aborted) setOptions(data);
    }).catch((failure) => {
      if (!controller.signal.aborted) { setError(failure.message); setNeedsLogin(failure.status === 401); }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);

  const update = (event) => { setForm((value) => ({ ...value, [event.target.name]: event.target.value })); setError(''); };
  const switchAccount = () => { clearSession(); window.location.assign('/login?next=%2Fcrear-cuenta'); };
  const submit = async (event) => {
    event.preventDefault();
    if (busy.current) return;
    setError('');
    if (form.password !== form.confirmPassword) { setError('Las contrasenas no coinciden.'); return; }
    if (form.password.trim().length < 8 || new TextEncoder().encode(form.password).length > 72) { setError('Usa al menos 8 caracteres y un maximo de 72 bytes en la contrasena.'); return; }
    busy.current = true;
    setSaving(true);
    try {
      setCreated(await createUser(form));
      setForm({ ...initial });
      setShowPassword(false);
    } catch (failure) {
      setError(failure.message);
      if (failure.status === 401) setNeedsLogin(true);
    } finally { busy.current = false; setSaving(false); }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <section className="w-full max-w-xl rounded border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Sistema de laboratorios</p>
        <h1 className="text-xl font-semibold">Crear cuenta</h1>
        {loading ? <p role="status" className="mt-4 text-sm">Verificando permisos...</p>
          : needsLogin ? <div className="mt-4 space-y-3 text-sm text-slate-600"><p>Inicia sesion con una cuenta de administrador para registrar usuarios y asignarles su sucursal.</p><a href="/login?next=%2Fcrear-cuenta" className="inline-block rounded bg-slate-900 px-4 py-2 text-white">Iniciar sesion</a></div>
            : user && user.rol !== 'administrador' ? <div className="mt-4 space-y-3 text-sm text-slate-600"><p>Tu cuenta no tiene permiso para crear usuarios. Solicita el registro al administrador de tu laboratorio.</p><button type="button" onClick={switchAccount} className="underline">Ingresar con otra cuenta</button></div>
              : !options ? <div role="alert" className="mt-4 text-sm text-red-800"><p>{error || 'No se pudieron cargar las opciones de registro.'}</p><button type="button" onClick={() => setRevision((value) => value + 1)} className="mt-2 underline">Reintentar</button><button type="button" onClick={switchAccount} className="ml-4 underline">Cambiar cuenta</button></div>
                : created ? <div className="mt-4 space-y-4 text-sm"><p role="status" className="font-medium text-emerald-800">Cuenta creada correctamente.</p><p className="break-words">{created.nombre} · {created.correo}</p><p>La cuenta ya puede iniciar sesion con la contrasena que asignaste. Tu sesion de administrador sigue activa.</p><div className="flex flex-wrap gap-3"><button type="button" onClick={() => { setCreated(null); setRevision((value) => value + 1); }} className="rounded border px-3 py-2">Crear otra cuenta</button><button type="button" onClick={() => { clearSession(); window.location.assign('/login'); }} className="rounded bg-slate-900 px-3 py-2 text-white">Ingresar con la nueva cuenta</button></div></div>
                  : <>
                    <p className="mt-2 text-sm text-slate-600">Asigna los datos de acceso, el rol y la sucursal del usuario.</p>
                    <p className="mt-2 text-sm text-slate-500">Administrador: {user.nombre}</p>
                    {!options.sucursales.length ? <p className="mt-4 text-sm">No hay sucursales activas disponibles.</p> : <form onSubmit={submit} className="mt-5 space-y-4">
                      <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm">Nombres<input required autoComplete="given-name" maxLength={100} name="nombre" value={form.nombre} onChange={update} className={inputClass} /></label>
                        <label className="block text-sm">Apellidos<input required autoComplete="family-name" maxLength={100} name="apellidos" value={form.apellidos} onChange={update} className={inputClass} /></label>
                        <label className="block text-sm sm:col-span-2">Correo<input required type="email" autoComplete="email" maxLength={100} name="correo" value={form.correo} onChange={update} className={inputClass} /></label>
                        <label className="block text-sm">Rol<select aria-label="Rol" required name="rol" value={form.rol} onChange={update} className={inputClass}>{options.roles.map((role) => <option key={role} value={role}>{labels[role] || role}</option>)}</select></label>
                        <label className="block text-sm">Sucursal<select aria-label="Sucursal" required name="sucursalId" value={form.sucursalId} onChange={update} className={inputClass}><option value="">Seleccionar sucursal</option>{options.sucursales.map((branch) => <option key={branch.id} value={branch.id}>{branch.nombre}</option>)}</select></label>
                        <label className="block text-sm">Contrasena<input required minLength={8} maxLength={72} type={showPassword ? 'text' : 'password'} autoComplete="new-password" name="password" value={form.password} onChange={update} aria-describedby="password-help" className={inputClass} /></label>
                        <label className="block text-sm">Confirmar contrasena<input required minLength={8} maxLength={72} type={showPassword ? 'text' : 'password'} autoComplete="new-password" name="confirmPassword" value={form.confirmPassword} onChange={update} className={inputClass} /></label>
                        <p id="password-help" className="text-xs text-slate-500 sm:col-span-2">Utiliza al menos 8 caracteres.</p>
                        <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2"><input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />Mostrar contrasenas</label>
                      </fieldset>
                      {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
                      <button type="submit" disabled={saving} className="w-full rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? 'Creando cuenta...' : 'Crear cuenta'}</button>
                    </form>}
                  </>}
        <a href="/solicitudes-estudios/listado" className="mt-5 inline-block text-sm text-slate-600 underline">Volver a solicitudes</a>
        {user?.rol === 'administrador' && <a href="/usuarios" className="ml-4 mt-5 inline-block text-sm text-slate-600 underline">Ver usuarios</a>}
      </section>
    </main>
  );
}
