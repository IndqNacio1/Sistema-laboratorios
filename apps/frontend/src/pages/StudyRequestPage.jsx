import React, { useEffect, useRef, useState } from 'react';
import AppShell from '../layouts/AppShell.jsx';
import { getStudyOptions, hasValidStudyPrice, prepareStudyRequest, saveStudyRequest } from '../services/studyRequestService.js';
import { clearSession } from '../services/session.js';

const inputClass = 'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm';
const money = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const patientName = (patient) => `${patient.nombre} ${patient.apellidos}`;

export default function StudyRequestPage() {
  const [options, setOptions] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState('');
  const [patientId, setPatientId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [error, setError] = useState('');
  const [draft, setDraft] = useState(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const busy = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    getStudyOptions({ signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setOptions(data); })
      .catch((failure) => { if (!controller.signal.aborted) { setLoadError(failure.message); setNeedsLogin(failure.status === 401); } });
    return () => controller.abort();
  }, [revision]);

  const patients = options?.patients || [];
  const services = options?.services || [];
  const matches = patients.filter((patient) => patientName(patient).toLowerCase().includes(search.trim().toLowerCase()));
  const selectedPatient = patients.find((patient) => patient.id === (draft?.pacienteId || patientId));
  const selectedService = services.find((service) => service.id === (draft?.servicioId || serviceId));
  const submit = (event) => {
    event.preventDefault();
    setError('');
    try {
      setDraft(prepareStudyRequest(selectedPatient, selectedService));
    } catch (failure) {
      setError(failure.message);
    }
  };
  const save = async () => {
    if (busy.current || !draft) return;
    busy.current = true;
    setSaving(true);
    setError('');
    try {
      setSaved(await saveStudyRequest(draft));
    } catch (failure) {
      setError(failure.message);
      if (failure.status === 401) setNeedsLogin(true);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  return (
    <AppShell title="Solicitud de estudios" subtitle="Recepcion" branchName={options?.usuario?.sucursalNombre || 'Sin sesion'}>
      <section className="border-y border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-base font-semibold">{draft ? 'Revision de solicitud' : 'Nueva solicitud'}</h3>
        <a href="/solicitudes-estudios/listado" className="mt-2 inline-block text-sm underline">Ver solicitudes</a>
        {options?.usuario && <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600"><span>{options.usuario.nombre}</span><button type="button" disabled={saving} className="underline" onClick={() => { clearSession(); window.location.assign('/login'); }}>Cerrar sesion</button></div>}
        {needsLogin ? <p className="mt-4 text-sm"><a href="/login" className="font-medium underline">Iniciar sesion</a></p> : loadError ? (
          <div role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">
            <p>{loadError}</p>
            <button type="button" className="mt-2 underline" onClick={() => { setLoadError(''); setRevision((value) => value + 1); }}>Reintentar</button>
            <a href="/login" className="ml-4 underline">Cambiar cuenta</a>
          </div>
        ) : !options ? <p role="status" className="mt-4 text-sm text-slate-600">Cargando pacientes y servicios...</p>
          : !patients.length || !services.length ? (
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              {!patients.length && <p>No hay pacientes activos. <a href="/pacientes" className="underline">Ir a pacientes</a></p>}
              {!services.length && <p>No hay servicios activos. <a href="/servicios" className="underline">Ir a servicios</a></p>}
            </div>
          ) : saved ? (
            <div className="mt-4">
              <p role="status" className="text-sm font-medium text-emerald-800">Solicitud registrada correctamente.</p>
              <p className="mt-3 break-all text-sm">Folio: {saved.id}</p>
              <p className="mt-2 text-sm">Estado: Pendiente</p>
              <button type="button" className="mt-4 rounded border border-slate-300 px-4 py-2 text-sm" onClick={() => { setSaved(null); setDraft(null); setPatientId(''); setServiceId(''); setSearch(''); setOptions(null); setRevision((value) => value + 1); }}>Nueva solicitud</button>
            </div>
          ) : draft ? (
            <div className="mt-4">
              <p role="status" className="text-sm font-medium text-amber-800">Borrador sin guardar</p>
              <dl className="mt-4 grid gap-4 border-y border-slate-200 py-4 sm:grid-cols-3">
                <div className="min-w-0"><dt className="text-xs text-slate-500">Paciente</dt><dd className="mt-1 break-words text-sm">{patientName(selectedPatient)}</dd></div>
                <div className="min-w-0"><dt className="text-xs text-slate-500">Servicio</dt><dd className="mt-1 break-words text-sm">{selectedService.nombre}</dd></div>
                <div><dt className="text-xs text-slate-500">Costo</dt><dd className="mt-1 text-sm tabular-nums">{money.format(selectedService.precio)}</dd></div>
              </dl>
              {error && <p role="alert" className="mt-3 rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" disabled={saving} className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50" onClick={save}>{saving ? 'Guardando...' : 'Guardar solicitud'}</button>
                <button type="button" disabled={saving} className="rounded border border-slate-300 px-4 py-2 text-sm disabled:opacity-50" onClick={() => { setDraft(null); setError(''); }}>Editar borrador</button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="min-w-0 space-y-3">
                  <label className="block text-sm">Buscar paciente<input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPatientId(''); setError(''); }} className={inputClass} /></label>
                  <label className="block text-sm">Paciente
                    <select aria-label="Paciente" required value={patientId} onChange={(event) => { setPatientId(event.target.value); setError(''); }} className={inputClass}>
                      <option value="">{matches.length ? 'Seleccionar paciente' : 'No hay coincidencias'}</option>
                      {matches.map((patient) => <option key={patient.id} value={patient.id}>{patientName(patient)} ({patient.id.slice(-8)})</option>)}
                    </select>
                  </label>
                </div>
                <div className="min-w-0 space-y-3">
                  <label className="block text-sm">Servicio
                    <select aria-label="Servicio" required value={serviceId} onChange={(event) => { setServiceId(event.target.value); setError(''); }} className={inputClass}>
                      <option value="">Seleccionar servicio</option>
                      {services.map((service) => <option key={service.id} value={service.id}>{service.nombre}</option>)}
                    </select>
                  </label>
                  <div className="border-t border-slate-200 pt-3 text-sm">
                    <span className="text-slate-500">Costo del servicio: </span>
                    <output aria-label="Costo del servicio" className="font-medium tabular-nums">{hasValidStudyPrice(selectedService?.precio) ? money.format(selectedService.precio) : '--'}</output>
                  </div>
                </div>
              </div>
              {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
              <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white">Revisar solicitud</button>
            </form>
          )}
      </section>
    </AppShell>
  );
}
