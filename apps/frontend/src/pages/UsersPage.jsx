import React, { useMemo, useState } from 'react';
import DataTable from '../components/DataTable.jsx';
import StatCard from '../components/StatCard.jsx';
import AppShell from '../layouts/AppShell.jsx';
import { emptyUserForm, userActions, userFilterOptions, userStats, users } from '../data/usersData.js';

const userColumns = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'correo', label: 'Correo' },
  { key: 'rol', label: 'Rol' },
  { key: 'sucursal', label: 'Sucursal' },
  { key: 'estado', label: 'Estado' },
];

function UsersPage() {
  const [filters, setFilters] = useState({
    rol: 'Todos',
    estado: 'Todos',
    sucursal: 'Todas',
  });

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesRole = filters.rol === 'Todos' || user.rol === filters.rol;
        const matchesStatus = filters.estado === 'Todos' || user.estado === filters.estado;
        const matchesBranch = filters.sucursal === 'Todas' || user.sucursal === filters.sucursal;

        return matchesRole && matchesStatus && matchesBranch;
      }),
    [filters],
  );

  const handleFilterChange = (field, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  };

  return (
    <AppShell title="Gestion de usuarios" subtitle="Modulo administrador">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {userStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="mt-6 rounded border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-semibold">Usuarios del sistema</h3>
            <p className="mt-1 text-sm text-slate-500">
              Informacion simulada para preparar la administracion de cuentas.
            </p>
          </div>

          <button className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Nuevo usuario
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="block rounded border border-slate-200 px-3 py-2">
            <span className="text-xs uppercase text-slate-500">Rol</span>
            <select
              className="mt-1 w-full bg-transparent text-sm font-medium text-slate-800 outline-none"
              value={filters.rol}
              onChange={(event) => handleFilterChange('rol', event.target.value)}
            >
              {userFilterOptions.roles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </label>

          <label className="block rounded border border-slate-200 px-3 py-2">
            <span className="text-xs uppercase text-slate-500">Estado</span>
            <select
              className="mt-1 w-full bg-transparent text-sm font-medium text-slate-800 outline-none"
              value={filters.estado}
              onChange={(event) => handleFilterChange('estado', event.target.value)}
            >
              {userFilterOptions.estados.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>

          <label className="block rounded border border-slate-200 px-3 py-2">
            <span className="text-xs uppercase text-slate-500">Sucursal</span>
            <select
              className="mt-1 w-full bg-transparent text-sm font-medium text-slate-800 outline-none"
              value={filters.sucursal}
              onChange={(event) => handleFilterChange('sucursal', event.target.value)}
            >
              {userFilterOptions.sucursales.map((branch) => (
                <option key={branch}>{branch}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4">
          <DataTable columns={userColumns} rows={filteredUsers} />
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold">Acciones preparadas</h3>
          <p className="mt-1 text-sm text-slate-500">
            Opciones visuales para administrar usuarios cuando se conecte la API.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {userActions.map((action) => (
              <button
                key={action}
                className="rounded border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold">Formulario base</h3>
          <p className="mt-1 text-sm text-slate-500">Alta y edicion de usuarios.</p>

          <form className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-medium uppercase text-slate-500">Nombre</span>
              <input
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none"
                placeholder="Nombre completo"
                defaultValue={emptyUserForm.nombre}
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium uppercase text-slate-500">Correo</span>
              <input
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none"
                placeholder="correo@laboratorio.com"
                defaultValue={emptyUserForm.correo}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <label className="block">
                <span className="text-xs font-medium uppercase text-slate-500">Rol</span>
                <select
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none"
                  defaultValue={emptyUserForm.rol}
                >
                  {userFilterOptions.roles
                    .filter((role) => role !== 'Todos')
                    .map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-medium uppercase text-slate-500">Estado</span>
                <select
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none"
                  defaultValue={emptyUserForm.estado}
                >
                  {userFilterOptions.estados
                    .filter((status) => status !== 'Todos')
                    .map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-medium uppercase text-slate-500">Sucursal</span>
              <select
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none"
                defaultValue={emptyUserForm.sucursal}
              >
                {userFilterOptions.sucursales
                  .filter((branch) => branch !== 'Todas')
                  .map((branch) => (
                    <option key={branch}>{branch}</option>
                  ))}
              </select>
            </label>
          </form>
        </aside>
      </section>
    </AppShell>
  );
}

export default UsersPage;
