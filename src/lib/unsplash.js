const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

const COLOR_EN = {
  'azul marino': 'navy', 'blanco': 'white', 'negro': 'black',
  'marrón': 'brown', 'celeste': 'light blue', 'beige': 'beige',
  'verde': 'olive', 'burdeos': 'burgundy', 'gris': 'gray',
  'gris oscuro': 'charcoal',
};

const TYPE_EN = {
  'camisa': 'shirt', 'remera': 't-shirt', 'pantalon': 'trousers',
  'jeans': 'jeans', 'saco': 'blazer', 'buzo': 'sweater',
  'zapatos': 'oxford shoes', 'zapatillas': 'sneakers',
  'mocasines': 'loafers', 'cinturon': 'belt',
};

/**
 * Arma un query preciso priorizando las prendas principales del outfit.
 * Ej: "men smart casual navy shirt beige trousers gray blazer outfit style"
 */
export function buildUnsplashQuery(outfit) {
  // Priorizamos top + bottom + capa exterior (las piezas más visibles)
  const priority = ['camisa','remera','pantalon','jeans','saco','buzo'];
  const main = outfit
    .filter(g => priority.includes(g.type))
    .slice(0, 3)
    .map(g => `${COLOR_EN[g.colorName] || g.colorName} ${TYPE_EN[g.type] || g.type}`)
    .join(' ');

  return `men smart casual ${main} outfit style fashion`;
}

/**
 * Busca 4 fotos en Unsplash y las devuelve.
 */
export async function searchUnsplashPhotos(query, count = 4) {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('[Unsplash] REACT_APP_UNSPLASH_ACCESS_KEY no configurada');
    return [];
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=portrait&content_filter=high&color=`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    });

    if (!res.ok) {
      console.error('[Unsplash] Error', res.status);
      return [];
    }

    const data = await res.json();
    return (data.results || []).map(photo => ({
      id:        photo.id,
      thumb:     photo.urls.small,
      full:      photo.urls.regular,
      author:    photo.user.name,
      authorUrl: photo.user.links.html,
      photoUrl:  photo.links.html,
    }));
  } catch (err) {
    console.error('[Unsplash] Fetch error:', err);
    return [];
  }
}
