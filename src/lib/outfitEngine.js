// Lógica para armar outfits evitando repeticiones recientes

// Colores que combinan bien entre sí (compatibilidad cromática básica)
const COLOR_COMPAT = {
  'azul marino': ['beige', 'gris', 'blanco', 'celeste', 'marrón', 'gris oscuro'],
  'blanco':      ['azul marino', 'negro', 'gris', 'beige', 'marrón', 'verde', 'burdeos', 'celeste', 'gris oscuro'],
  'negro':       ['blanco', 'gris', 'beige', 'celeste', 'burdeos', 'gris oscuro'],
  'gris':        ['azul marino', 'blanco', 'negro', 'celeste', 'burdeos', 'gris oscuro'],
  'beige':       ['azul marino', 'marrón', 'verde', 'blanco', 'negro'],
  'marrón':      ['beige', 'blanco', 'verde', 'celeste', 'azul marino'],
  'celeste':     ['azul marino', 'blanco', 'gris', 'negro', 'marrón'],
  'verde':       ['beige', 'marrón', 'blanco', 'negro'],
  'burdeos':     ['gris', 'negro', 'blanco', 'beige'],
  'gris oscuro': ['blanco', 'celeste', 'beige', 'azul marino', 'negro'],
};

// Reglas de compatibilidad calzado <-> pantalón
// Cuero marrón/negro va con pantalón formal; zapatillas con jeans/casual
const SHOE_COMPAT = {
  'zapatos':    ['pantalon', 'jeans'],
  'zapatillas': ['jeans', 'pantalon'],
  'mocasines':  ['pantalon', 'jeans'],
};

// Cinturón debe hacer juego con el calzado en términos de color y estilo
const BELT_SHOE_COMPAT = {
  'negro':  ['negro', 'gris oscuro'],
  'marrón': ['marrón', 'beige'],
  'beige':  ['marrón', 'beige'],
};

function colorsCompat(colorA, colorB) {
  if (!colorA || !colorB) return true;
  const compat = COLOR_COMPAT[colorA] || [];
  return compat.includes(colorB) || colorA === colorB;
}

function getAvailableByCategory(garments, categories) {
  return garments.filter(g => categories.includes(g.type) && g.status === 'available');
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
  if (!arr || !arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function buildOutfit(garments, history = []) {
  const recentIds = getRecentlyUsedIds(history);
  const fresh = g => !recentIds.has(g.id);
  const preferFresh = (arr) => {
    const f = arr.filter(fresh);
    return f.length ? f : arr;
  };

  const tops    = getAvailableByCategory(garments, ['camisa', 'remera']);
  const bottoms = getAvailableByCategory(garments, ['pantalon', 'jeans']);
  const layers  = getAvailableByCategory(garments, ['saco', 'buzo']);
  const shoes   = getAvailableByCategory(garments, ['zapatos', 'zapatillas', 'mocasines']);
  const belts   = getAvailableByCategory(garments, ['cinturon']);

  // 1. Top
  const top = pickRandom(preferFresh(tops));
  if (!top) return [];

  // 2. Bottom compatible con top
  const compatBottoms = preferFresh(bottoms).filter(b => colorsCompat(top.colorName, b.colorName));
  const bottom = pickRandom(compatBottoms.length ? compatBottoms : preferFresh(bottoms));
  if (!bottom) return [top];

  // 3. Capa exterior compatible
  const compatLayers = preferFresh(layers).filter(
    l => colorsCompat(top.colorName, l.colorName) || colorsCompat(bottom.colorName, l.colorName)
  );
  const layer = pickRandom(compatLayers.length ? compatLayers : layers);

  // 4. Calzado compatible con bottom y colores del outfit
  const compatShoes = preferFresh(shoes).filter(s => {
    const shoeTypes = SHOE_COMPAT[s.type] || ['pantalon', 'jeans'];
    const fitsBottom = shoeTypes.includes(bottom.type);
    const fitsColor  = colorsCompat(s.colorName, bottom.colorName) || colorsCompat(s.colorName, top.colorName);
    return fitsBottom && fitsColor;
  });
  const shoe = pickRandom(compatShoes.length ? compatShoes : preferFresh(shoes));

  // 5. Cinturón que combine con el calzado elegido
  let belt = null;
  if (shoe && belts.length) {
    const shoeColorGroup = BELT_SHOE_COMPAT[shoe.colorName];
    const compatBelts = preferFresh(belts).filter(b =>
      shoeColorGroup ? shoeColorGroup.includes(b.colorName) : colorsCompat(b.colorName, shoe.colorName)
    );
    belt = pickRandom(compatBelts.length ? compatBelts : preferFresh(belts));
  }

  return [top, bottom, layer, shoe, belt].filter(Boolean);
}
