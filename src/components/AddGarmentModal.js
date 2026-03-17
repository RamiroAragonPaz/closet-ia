import React, { useState } from 'react';

const COLOR_OPTIONS = [
  { hex: '#1a1a2e', name: 'azul marino' },
  { hex: '#f5f5f0', name: 'blanco', light: true },
  { hex: '#2d2d2d', name: 'negro' },
  { hex: '#8b6f5e', name: 'marrón' },
  { hex: '#6b8cba', name: 'celeste' },
  { hex: '#c4a882', name: 'beige' },
  { hex: '#4a7c59', name: 'verde' },
  { hex: '#7a4a4a', name: 'burdeos' },
  { hex: '#888888', name: 'gris' },
  { hex: '#444455', name: 'gris oscuro' },
];

const GARMENT_TYPES = [
  { value: 'camisa',     label: 'Camisa' },
  { value: 'remera',     label: 'Remera' },
  { value: 'pantalon',   label: 'Pantalón' },
  { value: 'jeans',      label: 'Jeans' },
  { value: 'saco',       label: 'Saco / Blazer' },
  { value: 'buzo',       label: 'Buzo / Sweater' },
  { value: 'zapatos',    label: 'Zapatos' },
  { value: 'zapatillas', label: 'Zapatillas' },
];

// Si recibe prop "garment" => modo edición. Sin ella => modo agregar.
export default function GarmentModal({ garment, onSave, onClose }) {
  const isEdit = !!garment;
  const initialColor = isEdit
    ? (COLOR_OPTIONS.find(c => c.name === garment.colorName) || COLOR_OPTIONS[0])
    : COLOR_OPTIONS[0];

  const [type, setType]               = useState(isEdit ? garment.type     : 'camisa');
  const [name, setName]               = useState(isEdit ? garment.name     : '');
  const [selectedColor, setSelected]  = useState(initialColor);
  const [formality, setFormality]     = useState(isEdit ? garment.formality: 'smart-casual');
  const [loading, setLoading]         = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onSave({ type, name: name.trim(), color: selectedColor.hex, colorName: selectedColor.name, formality });
    setLoading(false);
    onClose();
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: '20px',
      animation: 'fadeIn 0.15s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)',
        border: '0.5px solid var(--border2)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        width: '100%', maxWidth: '420px',
      }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>
          {isEdit ? 'Editar prenda' : 'Agregar prenda'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label>Tipo de prenda</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              {GARMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label>Descripción</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="ej. Camisa Oxford azul marino"
              required autoFocus
            />
          </div>

          <div>
            <label>Color principal</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
              {COLOR_OPTIONS.map(c => (
                <button key={c.name} type="button" title={c.name} onClick={() => setSelected(c)} style={{
                  width: '28px', height: '28px', borderRadius: '50%', background: c.hex, cursor: 'pointer',
                  border: selectedColor.name === c.name ? '2px solid var(--accent)' : `1px solid ${c.light ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
                  transform: selectedColor.name === c.name ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.15s',
                }} />
              ))}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>
              Seleccionado: <span style={{ color: 'var(--accent)' }}>{selectedColor.name}</span>
            </p>
          </div>

          <div>
            <label>Formalidad</label>
            <select value={formality} onChange={e => setFormality(e.target.value)}>
              <option value="smart-casual">Smart Casual</option>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? <span className="spinner" /> : isEdit ? 'Guardar cambios' : 'Agregar al guardarropa'}
            </button>
            <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
