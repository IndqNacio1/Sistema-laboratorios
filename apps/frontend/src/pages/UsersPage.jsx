import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import StatCard from '../components/StatCard.jsx';
import AppShell from '../layouts/AppShell.jsx';
import { userRoles } from '../data/usersData.js';
import { getUsers } from '../services/usersService.js';
import { getCurrentUser } from '../services/authService.js';

const roleLabel = (role) => userRoles.find((item) => item.value === role)?.label || role;
const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'correo', label: 'Correo' },
  { key: 'rol', label: 'Rol', render: roleLabel },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsLogin, setNeedsLogin] = useState(false);
  const [revision, setRevision] = useState(0);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setUsers([]);
    setCurrent(null);
    Promise.all([getUsers({ signal: controller.signal }), getCurrentUser({ signal: controller.signal })])
      .then(([rows, user]) => { if (!controller.signal.aborted) { setUsers(rows); setCurrent(user); setNeedsLogin(false); } })
      .catch((failure) => { if (!controller.signal.aborted) { setError(failure.message); setNeedsLogin(failure.status === 401); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);

  const filtered = users.filter((user) => (!role || user.rol === role) && `${user.nombre} ${user.correo}`.toLowerCase().includes(search.trim().toLowerCase()));
  const stats = [
    { label: 'Usuarios', value: users.length },
    { label: 'Administradores', value: users.filter((user) => user.rol === 'administrador').length },
    { label: 'Recepcion', value: users.filter((user) => user.rol === 'recepcion').length },
  ];

  return (
    <AppShell title="Gestion de usuarios" subtitle="Modulo administrador" branchName={current?.sucursalNombre || 'Sin sesion'}>
      <section className="grid gap-4 sm:grid-cols-3">{stats.map((stat) => <StatCard key={stat.label} {...stat} value={loading || error ? '--' : stat.value} />)}</section>
      <section className="mt-6 border-y border-slate-200 bg-white py-4 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold">Usuarios del sistema</h3>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={loading} onClick={() => setRevision((value) => value + 1)} className="rounded border border-slate-300 px-3 py-2 text-sm disabled:opacity-50">Actualizar</button>
            {current?.rol === 'administrador' && <a href="/crear-cuenta" className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white">Nuevo usuario</a>}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">Buscar<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o correo" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
          <label className="block text-sm">Rol<select aria-label="Rol" value={role} onChange={(event) => setRole(event.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2"><option value="">Todos</option>{userRoles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        </div>
        <div className="mt-4" aria-busy={loading}>
          {loading ? <p role="status" className="py-6 text-sm text-slate-600">Cargando usuarios...</p>
            : needsLogin ? <p className="text-sm"><a href="/login?next=%2Fusuarios" className="underline">Iniciar sesion</a></p>
              : error ? <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800"><p>{error}</p><button type="button" className="mt-2 underline" onClick={() => setRevision((value) => value + 1)}>Reintentar</button><a href="/login?next=%2Fusuarios" className="ml-4 underline">Cambiar cuenta</a></div>
                : <DataTable columns={columns} rows={filtered} emptyMessage={users.length ? 'No hay usuarios con los filtros seleccionados.' : 'No hay usuarios registrados.'} />}
        </div>
      </section>
    </AppShell>
  );
}
