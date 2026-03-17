const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

/**
 * Arma un query de búsqueda en inglés basado en las prendas del outfit.
 * Ej: "smart casual navy shirt beige chinos gray blazer men outfit"
 */
export function buildUnsplashQuery(outfit) {
  const colorMap = {
    'azul marino': 'navy', 'blanco': 'white', 'negro': 'black',
    'marrón': 'brown', 'celeste': 'light blue', 'beige': 'beige',
    'verde': 'olive green', 'burdeos': 'burgundy', 'gris': 'gray',
    'gris oscuro': 'charcoal',
  };
  const typeMap = {
    'camisa': 'shirt', 'remera': 'tshirt', 'pantalon': 'trousers',
    'jeans': 'jeans', 'saco': 'blazer', 'buzo': 'sweater',
    'zapatos': 'shoes', 'zapatillas': 'sneakers',
  };

  const parts = outfit.map(g => {
    const color = colorMap[g.colorName] || g.colorName;
    const type  = typeMap[g.type] || g.type;
    return `${color} ${type}`;
  });

  return `smart casual men outfit ${parts.join(' ')} style`;
}

/**
 * Busca fotos en Unsplash y devuelve array de { url, thumb, author, authorUrl, photoUrl }
 */
export async function searchUnsplashPhotos(query, count = 4) {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('Unsplash API key no configurada (REACT_APP_UNSPLASH_ACCESS_KEY)');
    return [];
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=portrait&content_filter=high`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    });

    if (!res.ok) throw new Error(`Unsplash error: ${res.status}`);
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
    console.error('Unsplash fetch error:', err);
    return [];
  }
}
