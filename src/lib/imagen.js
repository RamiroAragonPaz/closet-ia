const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const COLOR_EN = {
  'azul marino': 'navy blue', 'blanco': 'white', 'negro': 'black',
  'marrón': 'brown', 'celeste': 'light blue', 'beige': 'beige',
  'verde': 'olive green', 'burdeos': 'burgundy', 'gris': 'light gray',
  'gris oscuro': 'charcoal gray',
};

const TYPE_EN = {
  'camisa': 'dress shirt', 'remera': 't-shirt', 'pantalon': 'chino trousers',
  'jeans': 'jeans', 'saco': 'blazer', 'buzo': 'sweater',
  'zapatos': 'leather oxford shoes', 'zapatillas': 'clean sneakers',
  'mocasines': 'loafers', 'cinturon': 'leather belt',
};

/**
 * Construye un prompt detallado para Google Imagen basado en las prendas
 */
export function buildImagenPrompt(outfit) {
  const pieces = outfit.map(g => {
    const color = COLOR_EN[g.colorName] || g.colorName;
    const type  = TYPE_EN[g.type] || g.type;
    return `${color} ${type}`;
  });

  return `Professional fashion photography of a well-dressed man wearing: ${pieces.join(', ')}. Smart casual style, full body shot, clean white studio background, soft natural lighting, sharp focus, high quality fashion editorial look. The man is standing confidently, modern professional aesthetic.`;
}

/**
 * Genera una imagen con Google Imagen 3 via Gemini API.
 * Devuelve un base64 data URL o null si falla.
 */
export async function generateOutfitImage(outfit) {
  if (!GEMINI_API_KEY) {
    console.warn('[Imagen] REACT_APP_GEMINI_API_KEY no configurada');
    return null;
  }

  const prompt = buildImagenPrompt(outfit);

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
          personGeneration: 'allow_adult',
          safetyFilterLevel: 'block_only_high',
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('[Imagen] Error', response.status, errData);
      return { error: errData?.error?.message || `Error ${response.status}` };
    }

    const data = await response.json();
    const b64 = data.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) return null;

    return { dataUrl: `data:image/png;base64,${b64}`, prompt };
  } catch (err) {
    console.error('[Imagen] Fetch error:', err);
    return { error: err.message };
  }
}
