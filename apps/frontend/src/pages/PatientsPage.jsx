import React, { useEffect, useRef, useState } from 'react';
import AppShell from '../layouts/AppShell.jsx';
import DataTable from '../components/DataTable.jsx';
import PatientDialog from '../components/PatientDialog.jsx';
import { getBranches, getPatient, getPatients, savePatient } from '../services/patientsService.js';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState('');
  const [branchId, setBranchId] = useState('');
  const [status, setStatus] = useState('');
  const [dialog, setDialog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [opening, setOpening] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [success, setSuccess] = useState('');
  const savingRef = useRef(false);
  const openingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    Promise.all([getPatients({ signal: controller.signal }), getBranches({ signal: controller.signal })])
      .then(([rows, locations]) => { if (!controller.signal.aborted) { setPatients(rows); setBranches(locations); } })
      .catch((error) => { if (!controller.signal.aborted) setLoadError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);

  const openPatient = async (patient, mode) => {
    if (openingRef.current) return;
    openingRef.current = true;
    setOpening(true);
    setActionError('');
    setSaveError('');
    setSuccess('');
    try {
      setDialog({ mode, patient: await getPatient(patient.id) });
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
      const saved = await savePatient(values, dialog.patient?.id);
      setPatients((current) => [...current.filter((patient) => patient.id !== saved.id), saved]);
      setSuccess(dialog.mode === 'edit' ? 'Paciente actualizado correctamente.' : 'Paciente registrado correctamente.');
      setDialog(null);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const branchName = (id) => branches.find((branch) => branch.id === id)?.nombre || 'Sin identificar';
  const rows = patients.filter((patient) => {
    const text = `${patient.nombre} ${patient.apellidos} ${patient.correo || ''} ${patient.telefono || ''}`.toLowerCase();
    return text.includes(search.trim().toLowerCase()) && (!branchId || patient.sucursalId === branchId) && (!status || patient.estatus === status);
  }).sort((a, b) => `${a.apellidos} ${a.nombre}`.localeCompare(`${b.apellidos} ${b.nombre}`, 'es'));
  const columns = [
    { key: 'nombre', label: 'Paciente', render: (value, patient) => <span className="font-medium">{value} {patient.apellidos}</span> },
    { key: 'telefono', label: 'Telefono', render: (value) => value || 'No registrado' },
    { key: 'sucursalId', label: 'Sucursal', render: branchName },
    { key: 'estatus', label: 'Estado', render: (value) => <span className={`rounded px-2 py-1 text-xs ${value === 'activo' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{value === 'activo' ? 'Activo' : 'Inactivo'}</span> },
    { key: 'acciones', label: 'Acciones', render: (value, patient) => <div className="flex gap-3 whitespace-nowrap">
      <button type="button" disabled={opening} onClick={() => openPatient(patient, 'view')} aria-label={`Ver ficha de ${patient.nombre} ${patient.apellidos}`} className="text-sm font-medium text-slate-700 underline disabled:opacity-50">Ver ficha</button>
      <button type="button" disabled={opening} onClick={() => openPatient(patient, 'edit')} aria-label={`Editar a ${patient.nombre} ${patient.apellidos}`} className="text-sm font-medium text-slate-700 underline disabled:opacity-50">Editar</button>
    </div> },
  ];

  return (
    <AppShell title="Pacientes" subtitle="Recepcion">
      <section className="border-y border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold">Registro de pacientes</h3>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={loading || opening} onClick={() => setRevision((current) => current + 1)} className="rounded border border-slate-300 px-3 py-2 text-sm disabled:opacity-50">Actualizar</button>
            <button type="button" disabled={loading || !!loadError || opening || !branches.some((branch) => branch.estatus === 'activo')} onClick={() => { setSaveError(''); setSuccess(''); setActionError(''); setDialog({ mode: 'create' }); }} className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">Nuevo paciente</button>
          </div>
        </div>
        {success && <p role="status" className="mt-4 rounded bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}
        {actionError && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">{actionError}</p>}
        {opening && <p role="status" className="mt-3 text-sm text-slate-600">Consultando paciente...</p>}
        <div className="mt-5 grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
          <label className="min-w-0 text-sm">Buscar paciente<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre, correo o telefono" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
          <label className="min-w-0 text-sm">Sucursal<select value={branchId} onChange={(event) => setBranchId(event.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2"><option value="">Todas</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.nombre}</option>)}</select></label>
          <label className="min-w-0 text-sm">Estado<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2"><option value="">Todos</option><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></label>
        </div>
        <div className="mt-5" aria-busy={loading}>
          {loading ? <p role="status" className="py-6 text-sm text-slate-600">Cargando pacientes...</p> : loadError ? (
            <div role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800"><p>{loadError}</p><button type="button" onClick={() => setRevision((current) => current + 1)} className="mt-2 underline">Reintentar</button></div>
          ) : <><p className="mb-3 text-sm text-slate-500">{rows.length} de {patients.length} pacientes</p><DataTable columns={columns} rows={rows} emptyMessage={patients.length ? 'No hay pacientes con los filtros seleccionados.' : 'No hay pacientes registrados.'} /></>}
        </div>
      </section>
      {dialog && <PatientDialog key={`${dialog.mode}-${dialog.patient?.id || 'new'}`} {...dialog} branches={branches} saving={saving} error={saveError} onSave={submit} onClose={() => setDialog(null)} onEdit={() => setDialog((current) => ({ ...current, mode: 'edit' }))} />}
    </AppShell>
  );
}
