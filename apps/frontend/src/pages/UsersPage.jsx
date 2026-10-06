import React from 'react';
import DataTable from '../components/DataTable.jsx';
import StatCard from '../components/StatCard.jsx';
import AppShell from '../layouts/AppShell.jsx';
import { userFilters, userStats, users } from '../data/usersData.js';

const userColumns = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'correo', label: 'Correo' },
  { key: 'rol', label: 'Rol' },
  { key: 'sucursal', label: 'Sucursal' },
  { key: 'estado', label: 'Estado' },
];

function UsersPage() {
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
          {userFilters.map((filter) => (
            <div key={filter.label} className="rounded border border-slate-200 px-3 py-2">
              <p className="text-xs uppercase text-slate-500">{filter.label}</p>
              <p className="text-sm font-medium text-slate-800">{filter.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <DataTable columns={userColumns} rows={users} />
        </div>
      </section>
    </AppShell>
  );
}

export default UsersPage;
