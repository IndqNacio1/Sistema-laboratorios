import React, { useEffect, useState } from 'react';
import AppShell from '../layouts/AppShell.jsx';
import DataTable from '../components/DataTable.jsx';
import { getStudyRequests } from '../services/studyRequestService.js';
import { clearSession } from '../services/session.js';

const states = { pendiente: 'Pendiente', en_proceso: 'En proceso', completado: 'Completado', cancelado: 'Cancelado' };
const date = new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' });
const columns = [
  { key: 'id', label: 'Folio', render: (value) => <span className="whitespace-nowrap">{value}</span> },
  { key: 'paciente', label: 'Paciente' },
  { key: 'servicio', label: 'Servicio' },
  { key: 'fecha', label: 'Fecha', render: (value) => date.format(new Date(value)) },
  { key: 'estado', label: 'Estado', render: (value) => states[value] || value },
];

export default function StudyRequestsListPage() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ search: '', estado: '', page: 1 });
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setData(null);
    getStudyRequests({ ...filters, signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        const lastPage = Math.max(1, Math.ceil(result.total / result.limit));
        if (result.page > lastPage) { setFilters((value) => ({ ...value, page: lastPage })); return; }
        setData(result);
        setNeedsLogin(false);
      })
      .catch((failure) => { if (!controller.signal.aborted) { setError(failure.message); setNeedsLogin(failure.status === 401); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filters, revision]);

  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  return (
    <AppShell title="Solicitudes de estudios" subtitle="Laboratorio" branchName={data?.usuario.sucursalNombre || 'Sin sesion'}>
      <section className="space-y-4 border-y border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold">Solicitudes registradas</h3>
          {data && <div className="flex flex-wrap items-center gap-4 text-sm">
            <span>{data.usuario.nombre}</span>
            {['administrador', 'recepcion', 'operativo'].includes(data.usuario.rol) && <a href="/solicitudes-estudios" className="rounded bg-slate-900 px-3 py-2 text-white">Nueva solicitud</a>}
            <button type="button" className="underline" onClick={() => { clearSession(); window.location.assign('/login'); }}>Cerrar sesion</button>
          </div>}
        </div>
        <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); setFilters((value) => ({ ...value, search: search.trim(), page: 1 })); }}>
          <label className="w-full min-w-0 text-sm sm:w-auto sm:flex-1">Buscar paciente, servicio o folio
            <input type="search" maxLength={100} value={search} onChange={(event) => setSearch(event.target.value)} className="mt-1 block w-full rounded border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm">Estado
            <select aria-label="Estado" value={filters.estado} onChange={(event) => setFilters((value) => ({ ...value, estado: event.target.value, page: 1 }))} className="mt-1 block rounded border border-slate-300 bg-white px-3 py-2">
              <option value="">Todos</option>
              {Object.entries(states).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <button type="submit" className="rounded border border-slate-300 px-4 py-2 text-sm">Buscar</button>
          <button type="button" disabled={loading} onClick={() => setRevision((value) => value + 1)} className="rounded border border-slate-300 px-4 py-2 text-sm disabled:opacity-50">Actualizar</button>
        </form>
        {loading ? <p role="status" className="text-sm text-slate-600">Cargando solicitudes...</p>
          : needsLogin ? <p className="text-sm"><a href="/login" className="underline">Iniciar sesion</a></p>
            : error ? <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800"><p>{error}</p><button type="button" className="mt-2 underline" onClick={() => setRevision((value) => value + 1)}>Reintentar</button><a href="/login" className="ml-4 underline">Cambiar cuenta</a></div>
              : data && <>
                <div className="overflow-x-auto"><div className="min-w-[680px]"><DataTable columns={columns} rows={data.items} emptyMessage="No hay solicitudes que coincidan con la consulta." /></div></div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <p role="status">{data.total} solicitudes · Pagina {data.page} de {pages}</p>
                  <div className="flex gap-3">
                    <button type="button" disabled={data.page <= 1} onClick={() => setFilters((value) => ({ ...value, page: value.page - 1 }))} className="rounded border px-3 py-2 disabled:opacity-50">Anterior</button>
                    <button type="button" disabled={data.page >= pages} onClick={() => setFilters((value) => ({ ...value, page: value.page + 1 }))} className="rounded border px-3 py-2 disabled:opacity-50">Siguiente</button>
                  </div>
                </div>
              </>}
      </section>
    </AppShell>
  );
}
