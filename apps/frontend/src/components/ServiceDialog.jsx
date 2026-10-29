import React, { useEffect, useRef, useState } from 'react';

const inputClass = 'mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm';

export default function ServiceDialog({ service, saving, error, onClose, onSave }) {
  const dialog = useRef(null);
  const [form, setForm] = useState({ nombre: service?.nombre || '', descripcion: service?.descripcion || '', precio: service?.precio ?? '', estatus: service?.estatus || 'activo' });
  const [validationError, setValidationError] = useState('');
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    if (!form.nombre.trim()) {
      setValidationError('El nombre es obligatorio.');
      return;
    }
    if (!/^\d{1,10}(\.\d{1,2})?$/.test(String(form.precio))) {
      setValidationError('Ingresa un costo valido con un maximo de dos decimales.');
      return;
    }
    setValidationError('');
    onSave(form);
  };

  return (
    <dialog ref={dialog} aria-labelledby="service-dialog-title" onCancel={(event) => {
      event.preventDefault();
      if (!saving) onClose();
    }} className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded border border-slate-200 bg-white p-5 text-slate-900 shadow-xl backdrop:bg-black/40">
      <h3 id="service-dialog-title" className="text-lg font-semibold">{service ? 'Editar servicio' : 'Registrar servicio'}</h3>
      <form onSubmit={submit} className="mt-5">
        <fieldset disabled={saving} className="space-y-4">
          <label className="block text-sm">Nombre
            <input autoFocus required name="nombre" maxLength={150} value={form.nombre} onChange={change} className={inputClass} />
          </label>
          <label className="block text-sm">Descripcion
            <textarea aria-label="Descripcion" name="descripcion" rows={3} maxLength={2000} value={form.descripcion} onChange={change} className={`${inputClass} resize-y`} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">Costo
              <input required name="precio" type="number" min="0" max="9999999999.99" step="0.01" value={form.precio} onChange={change} className={inputClass} />
            </label>
            <label className="block text-sm">Estado
              <select aria-label="Estado" name="estatus" value={form.estatus} onChange={change} className={inputClass}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select>
            </label>
          </div>
        </fieldset>
        {(validationError || error) && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">{validationError || error}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar servicio'}</button>
          <button type="button" disabled={saving} onClick={onClose} className="rounded border border-slate-300 px-4 py-2 text-sm disabled:opacity-50">Cancelar</button>
        </div>
      </form>
    </dialog>
  );
}
