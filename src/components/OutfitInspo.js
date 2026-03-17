import React, { useState } from 'react';

/**
 * Muestra una grilla de fotos de inspiración de Unsplash.
 * Props:
 *   photos  = [{ id, thumb, full, author, authorUrl, photoUrl }]
 *   loading = bool
 *   query   = string (el término buscado, para mostrarlo)
 */
export default function OutfitInspo({ photos, loading, query }) {
  const [expanded, setExpanded] = useState(null); // foto expandida

  if (loading) {
    return (
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span className="spinner" />
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Buscando inspiración en Unsplash...</span>
        </div>
        {/* Skeleton placeholders */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{
              aspectRatio: '2/3',
              background: 'var(--surface2)',
              borderRadius: '8px',
              border: '0.5px solid var(--border)',
              animation: 'pulse 1.5s ease infinite',
            }} />
          ))}
        </div>
      </div>
    );
  }

  if (!photos || photos.length === 0) return null;

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '15px', color: 'var(--accent2)' }}>
          Inspiración de estilo
        </p>
        <span style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          vía Unsplash
        </span>
      </div>

      {/* Query chip */}
      {query && (
        <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '10px' }}>
          Búsqueda: <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>"{query}"</span>
        </p>
      )}

      {/* Grid de fotos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {photos.map(photo => (
          <div
            key={photo.id}
            onClick={() => setExpanded(photo)}
            style={{
              aspectRatio: '2/3',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '0.5px solid var(--border)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'transform 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.03)';
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <img
              src={photo.thumb}
              alt={`Inspiración por ${photo.author}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              loading="lazy"
            />
            {/* Overlay autor */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.65))',
              padding: '16px 6px 5px',
              opacity: 0,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0'}
            >
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.8)' }}>{photo.author}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Crédito Unsplash — obligatorio por sus términos */}
      <p style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '8px', textAlign: 'right' }}>
        Fotos de{' '}
        <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--muted)', textDecoration: 'underline' }}>
          Unsplash
        </a>
      </p>

      {/* Modal foto expandida */}
      {expanded && (
        <div
          onClick={() => setExpanded(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 300, padding: '20px',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '420px', width: '100%',
              borderRadius: '12px', overflow: 'hidden',
              border: '0.5px solid var(--border2)',
            }}
          >
            <img
              src={expanded.full}
              alt={`Foto por ${expanded.author}`}
              style={{ width: '100%', display: 'block', maxHeight: '80vh', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'rgba(0,0,0,0.7)',
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <a
                href={expanded.authorUrl + '?utm_source=closet_ia&utm_medium=referral'}
                target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}
                onClick={e => e.stopPropagation()}
              >
                📷 {expanded.author}
              </a>
              <a
                href={expanded.photoUrl + '?utm_source=closet_ia&utm_medium=referral'}
                target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '11px', color: 'var(--accent)', textDecoration: 'none' }}
                onClick={e => e.stopPropagation()}
              >
                Ver en Unsplash →
              </a>
            </div>
            <button
              onClick={() => setExpanded(null)}
              style={{
                position: 'absolute', top: '10px', right: '10px',
                width: '28px', height: '28px',
                background: 'rgba(0,0,0,0.6)',
                border: '0.5px solid rgba(255,255,255,0.2)',
                borderRadius: '50%', cursor: 'pointer',
                color: '#fff', fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
