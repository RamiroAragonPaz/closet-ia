// Lógica para armar outfits evitando repeticiones recientes



// Colores que combinan bien entre sí (compatibilidad cromática básica)
const COLOR_COMPAT = {
  'azul marino':  ['beige', 'gris', 'blanco', 'celeste', 'marrón'],
  'blanco':       ['azul marino', 'negro', 'gris', 'beige', 'marrón', 'verde', 'burdeos', 'celeste'],
  'negro':        ['blanco', 'gris', 'beige', 'celeste', 'burdeos'],
  'gris':         ['azul marino', 'blanco', 'negro', 'celeste', 'burdeos'],
  'beige':        ['azul marino', 'marrón', 'verde', 'blanco', 'negro'],
  'marrón':       ['beige', 'blanco', 'verde', 'celeste'],
  'celeste':      ['azul marino', 'blanco', 'gris', 'negro', 'marrón'],
  'verde':        ['beige', 'marrón', 'blanco', 'negro'],
  'burdeos':      ['gris', 'negro', 'blanco', 'beige'],
  'gris oscuro':  ['blanco', 'celeste', 'beige', 'azul marino'],
};

function colorsCompat(colorA, colorB) {
  const compat = COLOR_COMPAT[colorA] || [];
  return compat.includes(colorB) || colorA === colorB;
}

function getAvailableByCategory(garments, categories) {
  return garments.filter(
    g => categories.includes(g.type) && g.status === 'available'
  );
}

function getRecentlyUsedIds(history, days = 7) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Set(
    history
      .filter(o => o.wornAt?.toMillis ? o.wornAt.toMillis() > cutoff : true)
      .flatMap(o => o.pieces?.map(p => p.id) || [])
  );
}

function pickRandom(arr) {
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function buildOutfit(garments, history = []) {
  const recentIds = getRecentlyUsedIds(history);

  // Preferir prendas no usadas recientemente
  const fresh = g => !recentIds.has(g.id);

  const tops = getAvailableByCategory(garments, ['camisa', 'remera']);
  const bottoms = getAvailableByCategory(garments, ['pantalon', 'jeans']);
  const layers = getAvailableByCategory(garments, ['saco', 'buzo']);

  const freshTops = tops.filter(fresh);
  const freshBottoms = bottoms.filter(fresh);
  const freshLayers = layers.filter(fresh);

  // Elegir top primero (priorizando frescos)
  const top = pickRandom(freshTops.length ? freshTops : tops);
  if (!top) return [];

  // Elegir bottom compatible con el top
  const compatBottoms = (freshBottoms.length ? freshBottoms : freshBottoms.concat(bottoms))
    .filter(b => colorsCompat(top.colorName, b.colorName));
  const bottom = pickRandom(compatBottoms.length ? compatBottoms : (freshBottoms.length ? freshBottoms : bottoms));
  if (!bottom) return [top];

  // Agregar capa exterior si hay disponible y compatible
  const compatLayers = (freshLayers.length ? freshLayers : layers)
    .filter(l => colorsCompat(top.colorName, l.colorName) || colorsCompat(bottom.colorName, l.colorName));
  const layer = pickRandom(compatLayers);

  return [top, bottom, layer].filter(Boolean);
}
