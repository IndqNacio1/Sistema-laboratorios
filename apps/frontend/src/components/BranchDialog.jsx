import React, { useEffect, useRef, useState } from 'react';

const inputClass = 'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm';

export default function BranchDialog({ branch, saving, error, onSave, onClose }) {
  const dialog = useRef(null);
  const [form, setForm] = useState({ nombre: branch?.nombre || '', direccion: branch?.direccion || '', telefono: branch?.telefono || '', estatus: branch?.estatus || 'activo' });
  const [validationError, setValidationError] = useState('');
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.nombre.trim() || !form.direccion.trim()) {
      setValidationError('Completa el nombre y la direccion.');
      return;
    }
    const phone = form.telefono.trim();
    if (phone && (!/^[+0-9 ().-]+$/.test(phone) || !/^\d{7,15}$/.test(phone.replace(/\D/g, '')))) {
      setValidationError('El telefono debe contener entre 7 y 15 digitos y solo signos de formato telefonico.');
      return;
    }
    setValidationError('');
    onSave(form);
  };

  return (
    <dialog ref={dialog} aria-labelledby="branch-dialog-title" onCancel={(event) => {
      event.preventDefault();
      if (!saving) onClose();
    }} className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded border border-slate-200 bg-white p-5 text-slate-900 shadow-xl backdrop:bg-black/40">
      <h3 id="branch-dialog-title" className="text-lg font-semibold">{branch ? 'Editar sucursal' : 'Registrar sucursal'}</h3>
      <form onSubmit={submit} className="mt-5">
        <fieldset disabled={saving} className="space-y-4">
          <label className="block text-sm">Nombre
            <input autoFocus required name="nombre" maxLength={100} value={form.nombre} onChange={change} className={inputClass} />
          </label>
          <label className="block text-sm">Direccion
            <textarea aria-label="Direccion" required name="direccion" rows={3} maxLength={500} value={form.direccion} onChange={change} className={`${inputClass} resize-y`} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">Telefono
              <input type="tel" name="telefono" maxLength={20} value={form.telefono} onChange={change} className={inputClass} />
            </label>
            <label className="block text-sm">Estado
              <select aria-label="Estado" name="estatus" value={form.estatus} onChange={change} className={inputClass}><option value="activo">Activa</option><option value="inactivo">Inactiva</option></select>
            </label>
          </div>
        </fieldset>
        {(validationError || error) && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">{validationError || error}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar sucursal'}</button>
          <button type="button" disabled={saving} onClick={onClose} className="rounded border border-slate-300 px-4 py-2 text-sm disabled:opacity-50">Cancelar</button>
        </div>
      </form>
    </dialog>
  );
}
