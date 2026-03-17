const PEXELS_API_KEY = process.env.REACT_APP_PEXELS_API_KEY;

const COLOR_EN = {
  'azul marino': 'navy', 'blanco': 'white', 'negro': 'black',
  'marrón': 'brown', 'celeste': 'light blue', 'beige': 'beige',
  'verde': 'olive', 'burdeos': 'burgundy', 'gris': 'gray',
  'gris oscuro': 'charcoal',
};

const TYPE_EN = {
  'camisa': 'dress shirt', 'remera': 'tshirt', 'pantalon': 'trousers',
  'jeans': 'jeans', 'saco': 'blazer', 'buzo': 'sweater',
  'zapatos': 'oxford shoes', 'zapatillas': 'sneakers',
  'mocasines': 'loafers', 'cinturon': 'belt',
};

export function buildPexelsQuery(outfit) {
  const priority = ['camisa', 'remera', 'pantalon', 'jeans', 'saco', 'buzo'];
  const main = outfit
    .filter(g => priority.includes(g.type))
    .slice(0, 3)
    .map(g => `${COLOR_EN[g.colorName] || g.colorName} ${TYPE_EN[g.type] || g.type}`)
    .join(' ');
  return `men smart casual ${main} outfit`;
}

export async function searchPexelsPhotos(query, count = 4) {
  if (!PEXELS_API_KEY) {
    console.warn('[Pexels] REACT_APP_PEXELS_API_KEY no configurada');
    return [];
  }

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=portrait`;
    const res = await fetch(url, {
      headers: { Authorization: PEXELS_API_KEY },
    });

    if (!res.ok) {
      console.error('[Pexels] Error', res.status);
      return [];
    }

    const data = await res.json();
    return (data.photos || []).map(p => ({
      id:       p.id,
      thumb:    p.src.medium,
      full:     p.src.large,
      author:   p.photographer,
      authorUrl: p.photographer_url,
      photoUrl: p.url,
    }));
  } catch (err) {
    console.error('[Pexels] error:', err);
    return [];
  }
}
