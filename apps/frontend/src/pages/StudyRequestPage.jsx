import React, { useEffect, useState } from 'react';
import AppShell from '../layouts/AppShell.jsx';
import { getStudyOptions, hasValidStudyPrice, prepareStudyRequest } from '../services/studyRequestService.js';

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

  useEffect(() => {
    const controller = new AbortController();
    getStudyOptions({ signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setOptions(data); })
      .catch((failure) => { if (!controller.signal.aborted) setLoadError(failure.message); });
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

  return (
    <AppShell title="Solicitud de estudios" subtitle="Recepcion">
      <section className="border-y border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-base font-semibold">{draft ? 'Revision de solicitud' : 'Nueva solicitud'}</h3>
        {loadError ? (
          <div role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">
            <p>{loadError}</p>
            <button type="button" className="mt-2 underline" onClick={() => { setLoadError(''); setRevision((value) => value + 1); }}>Reintentar</button>
          </div>
        ) : !options ? <p role="status" className="mt-4 text-sm text-slate-600">Cargando pacientes y servicios...</p>
          : !patients.length || !services.length ? (
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              {!patients.length && <p>No hay pacientes activos. <a href="/pacientes" className="underline">Ir a pacientes</a></p>}
              {!services.length && <p>No hay servicios activos. <a href="/servicios" className="underline">Ir a servicios</a></p>}
            </div>
          ) : draft ? (
            <div className="mt-4">
              <p role="status" className="text-sm font-medium text-amber-800">Borrador sin guardar</p>
              <dl className="mt-4 grid gap-4 border-y border-slate-200 py-4 sm:grid-cols-3">
                <div className="min-w-0"><dt className="text-xs text-slate-500">Paciente</dt><dd className="mt-1 break-words text-sm">{patientName(selectedPatient)}</dd></div>
                <div className="min-w-0"><dt className="text-xs text-slate-500">Servicio</dt><dd className="mt-1 break-words text-sm">{selectedService.nombre}</dd></div>
                <div><dt className="text-xs text-slate-500">Costo</dt><dd className="mt-1 text-sm tabular-nums">{money.format(selectedService.precio)}</dd></div>
              </dl>
              <button type="button" className="mt-4 rounded border border-slate-300 px-4 py-2 text-sm" onClick={() => setDraft(null)}>Editar borrador</button>
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
