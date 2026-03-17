import React, { useState } from 'react';
import GarmentCard from '../components/GarmentCard';
import GarmentModal from '../components/AddGarmentModal';
import { addGarment, updateGarment, updateGarmentStatus, deleteGarment } from '../lib/firestore';

const FILTERS = [
  { label: 'Todo',        value: 'all' },
  { label: 'Camisas',     value: 'camisa' },
  { label: 'Pantalones',  value: 'pantalon' },
  { label: 'Sacos',       value: 'saco' },
  { label: 'Calzado',     value: 'calzado' },
  { label: 'Cinturones',  value: 'cinturon' },
  { label: 'Disponibles', value: 'available' },
  { label: 'A lavar',     value: 'dirty' },
];

export default function WardrobeTab({ garments, userId, onGarmentsChanged }) {
  const [filter, setFilter]         = useState('all');
  const [showAdd, setShowAdd]       = useState(false);
  const [editingGarment, setEditing] = useState(null); // garment object o null

  function filtered() {
    if (filter === 'all')       return garments;
    if (filter === 'available') return garments.filter(g => g.status === 'available');
    if (filter === 'dirty')     return garments.filter(g => g.status === 'dirty');
    const typeMap = { camisa: ['camisa','remera'], pantalon: ['pantalon','jeans'], saco: ['saco','buzo'], calzado: ['zapatos','zapatillas','mocasines'] };
    return garments.filter(g => (typeMap[filter] || [filter]).includes(g.type));
  }

  async function handleAdd(data) {
    await addGarment(userId, data);
    onGarmentsChanged();
  }

  async function handleEdit(data) {
    await updateGarment(userId, editingGarment.id, data);
    onGarmentsChanged();
  }

  async function handleToggle(garmentId, newStatus) {
    await updateGarmentStatus(userId, garmentId, newStatus);
    onGarmentsChanged();
  }

  async function handleDelete(garmentId) {
    await deleteGarment(userId, garmentId);
    onGarmentsChanged();
  }

  const items     = filtered();
  const available = garments.filter(g => g.status === 'available').length;
  const dirty     = garments.filter(g => g.status === 'dirty').length;

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: 'var(--accent2)' }}>
          Mi guardarropa{' '}
          <small style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'var(--muted)', fontWeight: 300, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {available} disponibles · {dirty} a lavar
          </small>
        </p>
        <button className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => setShowAdd(true)}>
          + Agregar prenda
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)} style={{
            padding: '5px 12px',
            background: filter === f.value ? 'var(--tag-bg)' : 'none',
            border: `0.5px solid ${filter === f.value ? 'var(--accent)' : 'var(--border2)'}`,
            borderRadius: '16px',
            color: filter === f.value ? 'var(--accent)' : 'var(--muted)',
            fontFamily: 'DM Sans, sans-serif', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧺</div>
          <p style={{ fontSize: '13px' }}>
            {garments.length === 0 ? 'Todavía no cargaste prendas. ¡Empezá agregando tu primera!' : 'No hay prendas en esta categoría.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {items.map(g => (
            <GarmentCard
              key={g.id}
              garment={g}
              onToggleStatus={handleToggle}
              onEdit={g => setEditing(g)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal agregar */}
      {showAdd && (
        <GarmentModal
          onSave={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* Modal editar */}
      {editingGarment && (
        <GarmentModal
          garment={editingGarment}
          onSave={handleEdit}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
