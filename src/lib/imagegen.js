const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

/**
 * Construye un prompt detallado para Google Imagen 3
 * basado en las prendas del outfit.
 */
export function buildImagePrompt(outfit) {
  const colorMap = {
    'azul marino': 'navy blue', 'blanco': 'white', 'negro': 'black',
    'marrón': 'brown', 'celeste': 'light blue', 'beige': 'beige',
    'verde': 'olive green', 'burdeos': 'burgundy', 'gris': 'light gray',
    'gris oscuro': 'charcoal gray',
  };
  const typeMap = {
    'camisa': 'dress shirt', 'remera': 't-shirt', 'pantalon': 'dress trousers',
    'jeans': 'jeans', 'saco': 'blazer', 'buzo': 'sweater',
    'zapatos': 'leather oxford shoes', 'zapatillas': 'clean white sneakers',
    'mocasines': 'loafers', 'cinturon': 'leather belt',
  };

  const pieces = outfit.map(g => {
    const color = colorMap[g.colorName] || g.colorName;
    const type  = typeMap[g.type] || g.type;
    return `${color} ${type}`;
  });

  return `Full body fashion photograph of a well-dressed adult male mannequin wearing: ${pieces.join(', ')}. Smart casual office style. Clean white background. Professional fashion photography, high quality, sharp focus, natural lighting. No face, just the clothing on a mannequin form. Minimalist editorial style.`;
}

/**
 * Genera una imagen con Google Imagen 3 via Gemini API.
 * Devuelve { dataUrl } si éxito o { error } si falla.
 */
export async function generateOutfitImage(outfit) {
  if (!GEMINI_API_KEY) {
    return { error: 'API key de Gemini no configurada.' };
  }

  const prompt = buildImagePrompt(outfit);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '3:4',
          safetyFilterLevel: 'block_only_high',
          personGeneration: 'dont_allow',
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('[Imagen] Error', response.status, errData);
      const msg = errData?.error?.message || `Error ${response.status}`;
      return { error: msg };
    }

    const data = await response.json();
    const b64  = data.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) return { error: 'La API no devolvió imagen.' };

    return { dataUrl: `data:image/png;base64,${b64}`, prompt };
  } catch (err) {
    console.error('[Imagen] Fetch error:', err);
    return { error: `Error de red: ${err.message}` };
  }
}
