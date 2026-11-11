import React, { useEffect, useRef, useState } from 'react';

const inputClass = 'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm';

export default function PatientDialog({ mode, patient, branches, saving, error, onSave, onClose, onEdit }) {
  const dialog = useRef(null);
  const [form, setForm] = useState(() => ({
    nombre: patient?.nombre || '', apellidos: patient?.apellidos || '',
    telefono: patient?.telefono || '', correo: patient?.correo || '',
    fechaNacimiento: patient?.fechaNacimiento || '', genero: patient?.genero || '',
    sucursalId: patient?.sucursalId || branches.find((branch) => branch.estatus === 'activo')?.id || '',
    estatus: patient?.estatus || 'activo',
  }));
  const [validationError, setValidationError] = useState('');
  const readOnly = mode === 'view';
  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.nombre.trim() || !form.apellidos.trim()) {
      setValidationError('Completa nombre y apellidos.');
      return;
    }
    setValidationError('');
    onSave(form);
  };
  const fields = [
    ['Nombre', 'nombre', 'text', 100, true], ['Apellidos', 'apellidos', 'text', 100, true],
    ['Telefono', 'telefono', 'tel', 20, false], ['Correo', 'correo', 'email', 100, false],
    ['Fecha de nacimiento', 'fechaNacimiento', 'date', undefined, false], ['Genero', 'genero', 'text', 30, false],
  ];

  return (
    <dialog ref={dialog} aria-labelledby="patient-dialog-title" onCancel={(event) => {
      event.preventDefault();
      if (!saving) onClose();
    }} className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto rounded border border-slate-200 bg-white p-5 text-slate-900 shadow-xl backdrop:bg-black/40">
      <h3 id="patient-dialog-title" className="text-lg font-semibold">{readOnly ? 'Ficha del paciente' : mode === 'edit' ? 'Editar paciente' : 'Registrar paciente'}</h3>
      {readOnly ? (
        <>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {[...fields.map(([label, field]) => [label, patient[field]]),
              ['Sucursal', branches.find((branch) => branch.id === patient.sucursalId)?.nombre || 'Sin identificar'],
              ['Estado', patient.estatus === 'activo' ? 'Activo' : 'Inactivo']].map(([label, value]) => (
              <div key={label} className="min-w-0"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm">{value || 'No registrado'}</dd></div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={onEdit} className="rounded bg-slate-900 px-4 py-2 text-sm text-white">Editar paciente</button>
            <button type="button" onClick={onClose} className="rounded border border-slate-300 px-4 py-2 text-sm">Cerrar</button>
          </div>
        </>
      ) : (
        <form onSubmit={submit} className="mt-5">
          <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2">
            {fields.map(([label, field, type, maxLength, required]) => (
              <label key={field} className="min-w-0 text-sm">{label}
                <input autoFocus={field === 'nombre'} name={field} value={form[field]} onChange={change} type={type}
                  maxLength={maxLength} required={required} max={type === 'date' ? maxDate : undefined}
                  className={inputClass} />
              </label>
            ))}
            <label className="min-w-0 text-sm">Sucursal
              <select aria-label="Sucursal" required name="sucursalId" value={form.sucursalId} onChange={change} className={inputClass}>
                <option value="">Seleccionar sucursal</option>
                {branches.map((branch) => <option key={branch.id} value={branch.id} disabled={branch.estatus !== 'activo' && branch.id !== patient?.sucursalId}>{branch.nombre}{branch.estatus === 'inactivo' ? ' (Inactiva)' : ''}</option>)}
              </select>
            </label>
            <label className="min-w-0 text-sm">Estado
              <select aria-label="Estado" name="estatus" value={form.estatus} onChange={change} className={inputClass}>
                <option value="activo">Activo</option><option value="inactivo">Inactivo</option>
              </select>
            </label>
          </fieldset>
          {(validationError || error) && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">{validationError || error}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar paciente'}</button>
            <button type="button" disabled={saving} onClick={onClose} className="rounded border border-slate-300 px-4 py-2 text-sm disabled:opacity-50">Cancelar</button>
          </div>
        </form>
      )}
    </dialog>
  );
}
