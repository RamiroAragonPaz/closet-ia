import React, { useState, useEffect, useCallback } from 'react';
import { buildOutfit } from '../lib/outfitEngine';
import { getOutfitReasoning } from '../lib/anthropic';
import { saveOutfit } from '../lib/firestore';
import { useWeather } from '../hooks/useWeather';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function todayLabel() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

export default function TodayTab({ garments, history, userId, onOutfitSaved }) {
  const { weather } = useWeather();
  const [outfit, setOutfit] = useState([]);
  const [reasoning, setReasoning] = useState('');
  const [loadingReasoning, setLoadingReasoning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const generate = useCallback(async () => {
    const pieces = buildOutfit(garments, history);
    setOutfit(pieces);
    setConfirmed(false);

    if (!pieces.length) {
      setReasoning('No hay suficientes prendas disponibles. Revisá el guardarropa y marcá algunas como limpias.');
      return;
    }

    setLoadingReasoning(true);
    setReasoning('');
    const text = await getOutfitReasoning({ outfit: pieces, availableGarments: garments, recentOutfits: history, weather });
    setReasoning(text);
    setLoadingReasoning(false);
  }, [garments, history, weather]);

  useEffect(() => {
    if (garments.length) generate();
  }, []); // solo al montar

  async function handleConfirm() {
    if (!outfit.length || saving) return;
    setSaving(true);
    await saveOutfit(userId, { pieces: outfit.map(g => ({ id: g.id, name: g.name, color: g.color, type: g.type })), reasoning });
    setSaving(false);
    setConfirmed(true);
    onOutfitSaved();
  }

  const available = garments.filter(g => g.status === 'available').length;
  const dirty = garments.filter(g => g.status === 'dirty').length;

  return (
    <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
      {/* Stats rápidas */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Disponibles', value: available, color: 'var(--success)' },
          { label: 'A lavar', value: dirty, color: 'var(--danger)' },
          { label: 'Total', value: garments.length, color: 'var(--muted)' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: 'var(--surface)', border: '0.5px solid var(--border)',
            borderRadius: '8px', padding: '10px 12px',
          }}>
            <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            <p style={{ fontSize: '22px', fontFamily: 'Cormorant Garamond, serif', color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: 'var(--accent2)', marginBottom: '16px' }}>
        Sugerencia de hoy <small style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'var(--muted)', fontWeight: 300, marginLeft: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>IA · Smart Casual</small>
      </p>

      <div className="card" style={{ marginBottom: '0' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {todayLabel()}
          </span>
          <button className="btn" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={generate}>
            ↻ Otra opción
          </button>
        </div>

        {/* Prendas */}
        {outfit.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '13px', padding: '8px 0' }}>
            No hay prendas disponibles. Marcá algunas como limpias en el guardarropa.
          </p>
        ) : (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {outfit.map(g => (
              <div key={g.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'var(--surface2)',
                border: '0.5px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 14px',
                flex: '1', minWidth: '140px',
              }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: g.color, flexShrink: 0, border: '1px solid rgba(255,255,255,0.15)' }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{g.type}</p>
                  <p style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Razonamiento IA */}
        <div style={{
          background: 'var(--surface2)',
          borderLeft: '2px solid var(--accent)',
          borderRadius: '0 8px 8px 0',
          padding: '12px 16px',
          marginBottom: '16px',
        }}>
          <p style={{ fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
            ✦ Razonamiento del asesor
          </p>
          {loadingReasoning ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '13px' }}>
              <span className="spinner" /> Consultando al asesor de imagen...
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.65' }}>{reasoning}</p>
          )}
        </div>

        {/* Acciones */}
        {confirmed ? (
          <p style={{ color: 'var(--success)', fontSize: '13px', textAlign: 'center', padding: '8px 0' }}>
            ✓ Outfit confirmado — ¡que tengas un excelente día!
          </p>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={handleConfirm} disabled={saving || !outfit.length}>
              {saving ? <span className="spinner" /> : '✓ Usar este outfit'}
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                outfit.forEach(g => g.status = 'dirty');
                generate();
              }}
            >
              Marcar todo a lavar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
