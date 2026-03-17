import React from 'react';

/**
 * Genera una ilustración SVG procedural de un maniquí masculino
 * vestido con las prendas del outfit actual.
 * Recibe: outfit = [{ type, color, name }]
 */
export default function OutfitIllustration({ outfit }) {
  if (!outfit || outfit.length === 0) return null;

  const top    = outfit.find(g => ['camisa','remera'].includes(g.type));
  const bottom = outfit.find(g => ['pantalon','jeans'].includes(g.type));
  const layer  = outfit.find(g => ['saco','buzo'].includes(g.type));

  const topColor    = top?.color    || '#555';
  const bottomColor = bottom?.color || '#333';
  const layerColor  = layer?.color  || null;

  // Colores derivados (oscurecer ligeramente para sombras)
  function darken(hex, amount = 30) {
    const n = parseInt(hex.replace('#',''), 16);
    const r = Math.max(0, (n >> 16) - amount);
    const g = Math.max(0, ((n >> 8) & 0xff) - amount);
    const b = Math.max(0, (n & 0xff) - amount);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  const skinTone   = '#d4a574';
  const skinDark   = '#b8895a';
  const hairColor  = '#2c1810';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <p style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Ilustración del look
      </p>
      <svg
        viewBox="0 0 160 320"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', maxWidth: '140px', height: 'auto' }}
      >
        {/* ── CABEZA ── */}
        {/* Cuello */}
        <rect x="72" y="68" width="16" height="18" rx="2" fill={skinTone} />
        {/* Cabeza */}
        <ellipse cx="80" cy="52" rx="22" ry="26" fill={skinTone} />
        {/* Pelo */}
        <ellipse cx="80" cy="30" rx="22" ry="12" fill={hairColor} />
        <rect x="58" y="28" width="8" height="18" rx="4" fill={hairColor} />
        <rect x="94" y="28" width="8" height="18" rx="4" fill={hairColor} />
        {/* Orejas */}
        <ellipse cx="58" cy="52" rx="5" ry="7" fill={skinTone} />
        <ellipse cx="102" cy="52" rx="5" ry="7" fill={skinTone} />
        {/* Cara */}
        <ellipse cx="72" cy="54" rx="3" ry="4" fill={skinDark} opacity="0.4" />
        <ellipse cx="88" cy="54" rx="3" ry="4" fill={skinDark} opacity="0.4" />
        <ellipse cx="72" cy="53" rx="1.5" ry="2" fill="#1a1a1a" />
        <ellipse cx="88" cy="53" rx="1.5" ry="2" fill="#1a1a1a" />
        <path d="M74 63 Q80 67 86 63" stroke={skinDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* ── TORSO CON CAPA (SACO) ── */}
        {layerColor && (
          <>
            {/* Saco/blazer — forma trapezoidal con solapas */}
            <path d="M52 86 L50 200 L110 200 L108 86 L95 78 L80 84 L65 78 Z"
              fill={layerColor} />
            {/* Sombra lateral saco */}
            <path d="M52 86 L50 200 L60 200 L62 86 Z"
              fill={darken(layerColor, 25)} opacity="0.5" />
            <path d="M108 86 L110 200 L100 200 L98 86 Z"
              fill={darken(layerColor, 25)} opacity="0.5" />
            {/* Solapas */}
            <path d="M80 84 L68 96 L72 120 L80 110 Z" fill={darken(layerColor, 20)} />
            <path d="M80 84 L92 96 L88 120 L80 110 Z" fill={darken(layerColor, 20)} />
            {/* Botones saco */}
            <circle cx="80" cy="130" r="2" fill={darken(layerColor, 40)} />
            <circle cx="80" cy="148" r="2" fill={darken(layerColor, 40)} />
            <circle cx="80" cy="166" r="2" fill={darken(layerColor, 40)} />
            {/* Camisa visible bajo solapas */}
            <path d="M72 86 L72 120 L80 110 L88 120 L88 86 Z" fill={topColor} />
          </>
        )}

        {/* ── TORSO SIN CAPA ── */}
        {!layerColor && (
          <>
            <path d="M55 86 L52 200 L108 200 L105 86 L92 78 L80 84 L68 78 Z"
              fill={topColor} />
            {/* Sombra lateral */}
            <path d="M55 86 L52 200 L62 200 L65 86 Z"
              fill={darken(topColor, 20)} opacity="0.4" />
            <path d="M105 86 L108 200 L98 200 L95 86 Z"
              fill={darken(topColor, 20)} opacity="0.4" />
            {/* Cuello camisa / remera */}
            {top?.type === 'camisa' ? (
              <>
                <path d="M80 84 L70 96 L74 104 L80 98 Z" fill="#f5f5f0" />
                <path d="M80 84 L90 96 L86 104 L80 98 Z" fill="#f5f5f0" />
                <path d="M74 84 L74 110" stroke={darken(topColor, 15)} strokeWidth="0.8" />
              </>
            ) : (
              <path d="M68 80 Q80 90 92 80" stroke={darken(topColor, 30)} strokeWidth="1.5" fill="none" />
            )}
          </>
        )}

        {/* ── BRAZOS ── */}
        {/* Brazo izquierdo */}
        <path d="M52 90 Q36 120 38 165 L48 163 Q48 125 62 98 Z"
          fill={layerColor || topColor} />
        <ellipse cx="43" cy="168" rx="6" ry="8" fill={skinTone} />
        {/* Brazo derecho */}
        <path d="M108 90 Q124 120 122 165 L112 163 Q112 125 98 98 Z"
          fill={layerColor || topColor} />
        <ellipse cx="117" cy="168" rx="6" ry="8" fill={skinTone} />

        {/* ── PANTALÓN ── */}
        {/* Cintura */}
        <rect x="52" y="196" width="56" height="10" rx="2"
          fill={darken(bottomColor, 15)} />
        {/* Pierna izquierda */}
        <path d="M52 206 L48 300 L70 300 L80 220 Z"
          fill={bottomColor} />
        {/* Pierna derecha */}
        <path d="M108 206 L112 300 L90 300 L80 220 Z"
          fill={bottomColor} />
        {/* Costura central */}
        <line x1="80" y1="206" x2="80" y2="300" stroke={darken(bottomColor, 20)} strokeWidth="0.8" opacity="0.6" />
        {/* Sombra interior piernas */}
        <path d="M68 210 L65 300 L70 300 L72 210 Z" fill={darken(bottomColor, 20)} opacity="0.35" />
        <path d="M92 210 L95 300 L90 300 L88 210 Z" fill={darken(bottomColor, 20)} opacity="0.35" />

        {/* ── ZAPATOS ── */}
        <ellipse cx="59" cy="304" rx="13" ry="6" fill="#1a1a1a" />
        <ellipse cx="101" cy="304" rx="13" ry="6" fill="#1a1a1a" />
      </svg>

      {/* Leyenda de colores */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
        {outfit.map((g, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: g.color, border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />
            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{g.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
