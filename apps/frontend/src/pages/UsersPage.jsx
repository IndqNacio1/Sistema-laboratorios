import React, { useEffect, useRef, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import StatCard from '../components/StatCard.jsx';
import AppShell from '../layouts/AppShell.jsx';
import { emptyUserForm, userRoles } from '../data/usersData.js';
import { createUser, getUsers } from '../services/usersService.js';

const roleLabel = (role) => userRoles.find((item) => item.value === role)?.label
  || (role === 'recepcionista' ? 'Recepcion' : role);

const userColumns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'correo', label: 'Correo' },
  { key: 'rol', label: 'Rol', render: roleLabel },
];

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [revision, setRevision] = useState(0);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyUserForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [success, setSuccess] = useState('');
  const savingRef = useRef(false);
  const nameInput = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    getUsers({ signal: controller.signal })
      .then((rows) => { if (!controller.signal.aborted) setUsers(rows); })
      .catch((error) => { if (!controller.signal.aborted) setLoadError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);

  useEffect(() => {
    if (formOpen) nameInput.current?.focus();
  }, [formOpen]);

  const filteredUsers = users.filter((user) => {
    const matchesRole = !role || user.rol === role || (role === 'recepcion' && user.rol === 'recepcionista');
    return matchesRole && `${user.nombre} ${user.correo}`.toLowerCase().includes(search.trim().toLowerCase());
  });
  const stats = [
    { label: 'Usuarios', value: users.length },
    { label: 'Administradores', value: users.filter((user) => user.rol === 'administrador').length },
    { label: 'Recepcion', value: users.filter((user) => ['recepcion', 'recepcionista'].includes(user.rol)).length },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (savingRef.current) return;
    setSaveError('');
    setSuccess('');
    if (!form.nombre.trim() || !form.correo.trim() || !form.password.trim()) {
      setSaveError('Completa el nombre, correo y contrasena.');
      return;
    }
    if (new TextEncoder().encode(form.password).length > 72) {
      setSaveError('La contrasena es demasiado larga. Usa un maximo de 72 bytes.');
      return;
    }
    if (users.some((user) => user.correo?.toLowerCase() === form.correo.trim().toLowerCase())) {
      setSaveError('El correo ya esta registrado.');
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const created = await createUser(form);
      setUsers((current) => [...current.filter((user) => user.id !== created.id), created]);
      setForm({ ...emptyUserForm });
      setFormOpen(false);
      setSuccess('Usuario registrado correctamente.');
    } catch (error) {
      setSaveError(error.message);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <AppShell title="Gestion de usuarios" subtitle="Modulo administrador">
      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} value={loading || loadError ? '--' : stat.value} />)}
      </section>
      {success && <p role="status" className="mt-4 rounded bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}
      <section className="mt-6 border-y border-slate-200 bg-white py-4 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold">Usuarios del sistema</h3>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={loading || saving} onClick={() => setRevision((value) => value + 1)} className="rounded border border-slate-300 px-3 py-2 text-sm disabled:opacity-50">Actualizar</button>
            <button type="button" disabled={loading || saving} onClick={() => { setFormOpen(true); setSuccess(''); }} className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Nuevo usuario</button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">Buscar
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o correo" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
          </label>
          <label className="block text-sm">Rol
            <select value={role} onChange={(event) => setRole(event.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2">
              <option value="">Todos</option>
              {userRoles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-4" aria-busy={loading}>
          {loading ? <p role="status" className="py-6 text-sm text-slate-600">Cargando usuarios...</p>
            : loadError ? <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800"><p>{loadError}</p><button type="button" className="mt-2 underline" onClick={() => setRevision((value) => value + 1)}>Reintentar</button></div>
              : <DataTable columns={userColumns} rows={filteredUsers} emptyMessage={users.length ? 'No hay usuarios con los filtros seleccionados.' : 'No hay usuarios registrados.'} />}
        </div>
      </section>
      {formOpen && (
        <section className="mt-6 border-t border-slate-200 pt-5" aria-labelledby="user-form-title">
          <h3 id="user-form-title" className="text-base font-semibold">Nuevo usuario</h3>
          <form onSubmit={handleSubmit} className="mt-4 max-w-xl space-y-4">
            <fieldset disabled={saving} className="space-y-4">
              <label className="block text-sm">Nombre
                <input ref={nameInput} required maxLength={100} autoComplete="name" name="nombre" value={form.nombre} onChange={updateForm} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
              </label>
              <label className="block text-sm">Correo
                <input required type="email" maxLength={100} autoComplete="email" name="correo" value={form.correo} onChange={updateForm} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
              </label>
              <label className="block text-sm">Contrasena
                <input required type="password" minLength={8} maxLength={72} autoComplete="new-password" name="password" value={form.password} onChange={updateForm} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
              </label>
              <label className="block text-sm">Rol
                <select name="rol" value={form.rol} onChange={updateForm} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2">
                  {userRoles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
            </fieldset>
            {saveError && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">{saveError}</p>}
            <div className="flex flex-wrap gap-3">
              <button disabled={loading || saving} type="submit" className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar usuario'}</button>
              <button disabled={saving} type="button" onClick={() => { setFormOpen(false); setForm({ ...emptyUserForm }); setSaveError(''); }} className="rounded border border-slate-300 px-4 py-2 text-sm disabled:opacity-50">Cancelar</button>
            </div>
          </form>
        </section>
      )}
    </AppShell>
  );
}

export default UsersPage;
