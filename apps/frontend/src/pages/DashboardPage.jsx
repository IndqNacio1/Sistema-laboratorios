import React from 'react';
import DataTable from '../components/DataTable.jsx';
import StatCard from '../components/StatCard.jsx';
import AppShell from '../layouts/AppShell.jsx';
import { dashboardStats, moduleSummary, recentStudies } from '../data/dashboardData.js';

const studyColumns = [
  { key: 'folio', label: 'Folio' },
  { key: 'paciente', label: 'Paciente' },
  { key: 'servicio', label: 'Servicio' },
  { key: 'estado', label: 'Estado' },
  { key: 'sucursal', label: 'Sucursal' },
];

function DashboardPage() {
  return (
    <AppShell>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Estudios recientes</h3>
            <span className="text-sm text-slate-500">Datos de prueba</span>
          </div>
          <DataTable columns={studyColumns} rows={recentStudies} />
        </div>

        <div>
          <h3 className="mb-3 text-base font-semibold">Modulos prioritarios</h3>
          <div className="space-y-3">
            {moduleSummary.map((module) => (
              <article key={module.title} className="rounded border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="font-medium text-slate-900">{module.title}</h4>
                <p className="mt-1 text-sm text-slate-600">{module.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default DashboardPage;
