import React from 'react';

const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function HistoryTab({ history }) {
  if (!history.length) {
    return (
      <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: 'var(--accent2)', marginBottom: '24px' }}>
          Historial de outfits
        </p>
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
          <p style={{ fontSize: '13px' }}>Todavía no confirmaste ningún outfit.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: 'var(--accent2)', marginBottom: '20px' }}>
        Historial de outfits{' '}
        <small style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'var(--muted)', fontWeight: 300, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {history.length} registros
        </small>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {history.map((o, i) => (
          <div
            key={o.id || i}
            className="fade-in"
            style={{
              background: 'var(--surface)',
              border: '0.5px solid var(--border)',
              borderRadius: '10px',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              {/* Date */}
              <div style={{ minWidth: '80px' }}>
                <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {formatDate(o.wornAt)}
                </p>
              </div>

              {/* Pieces */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: o.reasoning ? '10px' : '0' }}>
                  {(o.pieces || []).map((p, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: p.color,
                        border: '1px solid rgba(255,255,255,0.1)',
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{p.name}</span>
                      {j < (o.pieces.length - 1) && <span style={{ color: 'var(--border2)', fontSize: '11px' }}>·</span>}
                    </div>
                  ))}
                </div>

                {/* Reasoning (colapsado) */}
                {o.reasoning && (
                  <details style={{ marginTop: '6px' }}>
                    <summary style={{
                      fontSize: '11px', color: 'var(--accent)', cursor: 'pointer',
                      listStyle: 'none', userSelect: 'none',
                    }}>
                      ✦ Ver razonamiento del asesor
                    </summary>
                    <p style={{
                      fontSize: '12px', color: 'var(--muted)', lineHeight: '1.6',
                      marginTop: '8px', paddingLeft: '8px',
                      borderLeft: '1px solid var(--border2)',
                    }}>
                      {o.reasoning}
                    </p>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
