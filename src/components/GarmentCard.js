import React, { useState } from 'react';

const EMOJIS = {
  camisa: '👔', remera: '👕', pantalon: '👖', jeans: '👖',
  saco: '🧥', buzo: '🧶', zapatos: '👞', zapatillas: '👟',
  mocasines: '🥿', cinturon: '🩲',
};

export default function GarmentCard({ garment, onToggleStatus, onEdit, onDelete }) {
  const isDirty = garment.status === 'dirty';
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className="fade-in"
      style={{
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        opacity: isDirty ? 0.6 : 1,
        transition: 'opacity 0.2s, border-color 0.2s',
        position: 'relative',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Área imagen */}
      <div style={{
        height: '90px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${garment.color}22`,
        position: 'relative',
        fontSize: '32px',
      }}>
        {EMOJIS[garment.type] || '👔'}

        {/* Badge estado */}
        <span
          className={isDirty ? 'badge-dirty' : 'badge-available'}
          style={{ position: 'absolute', top: '8px', right: '8px' }}
        >
          {isDirty ? 'A lavar' : 'Disponible'}
        </span>

        {/* Botones editar / eliminar — aparecen al hover */}
        <div style={{
          position: 'absolute', top: '8px', left: '8px',
          display: 'flex', gap: '4px',
        }}>
          <button
            onClick={() => onEdit(garment)}
            title="Editar prenda"
            style={{
              width: '24px', height: '24px',
              background: 'var(--surface)',
              border: '0.5px solid var(--border2)',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--muted)',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border2)'; }}
          >
            ✎
          </button>

          {confirmDelete ? (
            <button
              onClick={() => onDelete(garment.id)}
              title="Confirmar eliminación"
              style={{
                height: '24px', padding: '0 7px',
                background: 'var(--danger)',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '10px',
                color: '#fff',
                fontFamily: 'DM Sans, sans-serif',
              }}
              onMouseLeave={() => setConfirmDelete(false)}
            >
              ¿Seguro?
            </button>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Eliminar prenda"
              style={{
                width: '24px', height: '24px',
                background: 'var(--surface)',
                border: '0.5px solid var(--border2)',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--muted)',
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border2)'; }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px 12px' }}>
        <p style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
          {garment.type}
        </p>
        <p style={{ fontSize: '13px', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {garment.name}
        </p>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <span className="tag">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: garment.color, display: 'inline-block', border: '1px solid rgba(255,255,255,0.15)' }} />
            {garment.colorName}
          </span>
          <span className="tag">{garment.formality}</span>
        </div>

        <button
          className="btn"
          onClick={() => onToggleStatus(garment.id, isDirty ? 'available' : 'dirty')}
          style={{
            width: '100%', padding: '5px 0', fontSize: '11px', borderRadius: '5px',
            color: isDirty ? 'var(--success)' : 'var(--danger)',
          }}
        >
          {isDirty ? '↑ Ya está limpia' : '↓ Marcar a lavar'}
        </button>
      </div>
    </div>
  );
}
