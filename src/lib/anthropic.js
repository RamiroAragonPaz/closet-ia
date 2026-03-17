// Motor de razonamiento usando Google Gemini API (free tier: 1500 requests/día)
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const SYSTEM_PROMPT = `Sos un asesor de imagen masculino experto en moda smart casual para el ámbito laboral. 
Tu rol es justificar combinaciones de ropa de manera concisa, sofisticada y útil.
Cuando des tu análisis incluí:
1. Por qué los colores funcionan juntos (teoría del color, contraste, paletas)
2. La coherencia de estilo y formalidad
3. Cómo el clima del día influye en la elección
4. Si corresponde, qué podría mejorar el outfit
Respondé en español rioplatense, de manera directa. Máximo 4 oraciones. Sin saludos ni intro.`;

export async function getOutfitReasoning({ outfit, availableGarments, recentOutfits, weather }) {
  if (!GEMINI_API_KEY) {
    return 'API key de Gemini no configurada. Agregá REACT_APP_GEMINI_API_KEY en las variables de entorno de Vercel.';
  }

  const outfitDesc = outfit.map(g => `${g.type} ${g.colorName} (${g.name})`).join(', ');
  const historyDesc = recentOutfits.slice(0, 5).map(o =>
    o.pieces.map(p => p.name).join(' + ')
  ).join(' | ') || 'ninguno reciente';
  const weatherDesc = weather ? `${weather.temp}°C, ${weather.description}` : 'clima no disponible';

  const prompt = `${SYSTEM_PROMPT}

Outfit propuesto: ${outfitDesc}
Clima hoy en La Plata: ${weatherDesc}
Últimos outfits usados: ${historyDesc}

Justificá este outfit como asesor de imagen.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('[Gemini] Error', response.status, errData);
      return `Error IA (${response.status}): ${errData?.error?.message || 'revisá la consola'}`;
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Combinación seleccionada por coherencia de estilo y paleta de colores.';
  } catch (err) {
    console.error('[Gemini] Fetch error:', err);
    return `Error de red al conectar con la IA: ${err.message}`;
  }
}
