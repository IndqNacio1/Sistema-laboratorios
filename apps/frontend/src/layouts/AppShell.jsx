import React from 'react';
import { appRoutes } from '../routes/appRoutes.js';

function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-5 py-6 lg:block">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Sistema</p>
          <h1 className="mt-1 text-lg font-semibold">Laboratorios</h1>
        </div>

        <nav className="mt-8 space-y-1">
          {appRoutes.map((route) => (
            <a
              key={route.path}
              href={route.path}
              className="block rounded px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {route.label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Panel administrativo</p>
              <h2 className="text-lg font-semibold">Resumen operativo</h2>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p>Sucursal matriz</p>
              <p>Turno matutino</p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-6">{children}</main>
      </div>
    </div>
  );
}

export default AppShell;
