import React, { useEffect, useRef, useState } from 'react';
import AppShell from '../layouts/AppShell.jsx';
import DataTable from '../components/DataTable.jsx';
import BranchDialog from '../components/BranchDialog.jsx';
import { getBranch, getBranches, saveBranch } from '../services/branchesService.js';

export default function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [dialog, setDialog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [opening, setOpening] = useState(false);
  const [actionError, setActionError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [success, setSuccess] = useState('');
  const savingRef = useRef(false);
  const openingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    getBranches({ signal: controller.signal })
      .then((rows) => { if (!controller.signal.aborted) setBranches(rows); })
      .catch((error) => { if (!controller.signal.aborted) setLoadError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);

  const edit = async (branch) => {
    if (openingRef.current) return;
    openingRef.current = true;
    setOpening(true);
    setActionError('');
    setSaveError('');
    setSuccess('');
    try {
      setDialog({ branch: await getBranch(branch.id) });
    } catch (error) {
      setActionError(error.message);
    } finally {
      openingRef.current = false;
      setOpening(false);
    }
  };

  const submit = async (values) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError('');
    try {
      const saved = await saveBranch(values, dialog.branch?.id);
      setBranches((current) => [...current.filter((branch) => branch.id !== saved.id), saved]);
      setSuccess(dialog.branch ? 'Sucursal actualizada correctamente.' : 'Sucursal registrada correctamente.');
      setDialog(null);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const rows = branches.filter((branch) => `${branch.nombre} ${branch.direccion || ''} ${branch.telefono || ''}`.toLowerCase().includes(search.trim().toLowerCase())
    && (!status || branch.estatus === status)).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  const columns = [
    { key: 'nombre', label: 'Sucursal', render: (value) => <span className="font-medium">{value}</span> },
    { key: 'direccion', label: 'Direccion', render: (value) => <span className="block max-w-sm break-words">{value}</span> },
    { key: 'telefono', label: 'Telefono', render: (value) => value || 'No registrado' },
    { key: 'estatus', label: 'Estado', render: (value) => <span className={`rounded px-2 py-1 text-xs ${value === 'activo' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{value === 'activo' ? 'Activa' : 'Inactiva'}</span> },
    { key: 'acciones', label: 'Acciones', render: (value, branch) => <button type="button" disabled={opening} onClick={() => edit(branch)} aria-label={`Editar ${branch.nombre}`} className="text-sm font-medium text-slate-700 underline disabled:opacity-50">Editar</button> },
  ];

  return (
    <AppShell title="Sucursales" subtitle="Administracion">
      <section className="border-y border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold">Sucursales del laboratorio</h3>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={loading || opening} onClick={() => setRevision((value) => value + 1)} className="rounded border border-slate-300 px-3 py-2 text-sm disabled:opacity-50">Actualizar</button>
            <button type="button" disabled={loading || !!loadError || opening} onClick={() => { setDialog({}); setSaveError(''); setSuccess(''); setActionError(''); }} className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">Nueva sucursal</button>
          </div>
        </div>
        {success && <p role="status" className="mt-4 rounded bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}
        {actionError && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">{actionError}</p>}
        {opening && <p role="status" className="mt-3 text-sm text-slate-600">Consultando sucursal...</p>}
        <div className="mt-5 grid gap-3 sm:grid-cols-[2fr_1fr]">
          <label className="block min-w-0 text-sm">Buscar sucursal<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre, direccion o telefono" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
          <label className="block min-w-0 text-sm">Estado<select aria-label="Estado" value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2"><option value="">Todas</option><option value="activo">Activas</option><option value="inactivo">Inactivas</option></select></label>
        </div>
        <div className="mt-5" aria-busy={loading}>
          {loading ? <p role="status" className="py-6 text-sm text-slate-600">Cargando sucursales...</p> : loadError ? (
            <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800"><p>{loadError}</p><button type="button" onClick={() => setRevision((value) => value + 1)} className="mt-2 underline">Reintentar</button></div>
          ) : <><p className="mb-3 text-sm text-slate-500">{rows.length} de {branches.length} sucursales</p><DataTable columns={columns} rows={rows} emptyMessage={branches.length ? 'No hay sucursales con los filtros seleccionados.' : 'No hay sucursales registradas.'} /></>}
        </div>
      </section>
      {dialog && <BranchDialog key={dialog.branch?.id || 'new'} {...dialog} saving={saving} error={saveError} onSave={submit} onClose={() => setDialog(null)} />}
    </AppShell>
  );
}
