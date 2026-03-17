// Asesor de imagen usando Google Gemini API (free tier: 1500 requests/día)
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const SYSTEM_PROMPT = `Sos un asesor de imagen masculino experto en moda smart casual para el ámbito laboral porteño.
Tu tarea es elegir el mejor outfit posible del guardarropa disponible y justificarlo con criterio estético real.

Reglas para elegir:
- Elegí UNA prenda de cada categoría relevante: top (camisa o remera), bottom (pantalón o jeans), capa exterior (saco o buzo, si hay disponible), calzado (si hay disponible), cinturón (si hay disponible y combina con el calzado).
- Priorizá combinaciones con paleta coherente: neutros con neutros, o un color protagonista con neutros que lo acompañen.
- Considerá el clima: si hace frío incluí capa exterior; si hace calor prescindí de ella aunque haya disponible.
- No repitas prendas usadas recientemente si hay alternativas disponibles.
- El cinturón debe combinar con el calzado: cuero negro con zapatos negros/grises, cuero marrón con zapatos marrones/beige.

Respondé ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin bloques de código:
{
  "selectedIds": ["id1", "id2", "id3"],
  "reasoning": "Explicación de 3-4 oraciones en español rioplatense explicando por qué funciona esta combinación: colores, estilo, clima, coherencia."
}`;

/**
 * Llama a Gemini para que elija las prendas Y justifique en una sola llamada.
 * Devuelve { selectedIds: string[], reasoning: string }
 */
export async function selectOutfitWithAI({ availableGarments, recentOutfits, weather }) {
  if (!GEMINI_API_KEY) {
    return { selectedIds: [], reasoning: 'API key de Gemini no configurada. Agregá REACT_APP_GEMINI_API_KEY en Vercel.' };
  }

  const garmentList = availableGarments
    .filter(g => g.status === 'available')
    .map(g => `- id:"${g.id}" | tipo:${g.type} | color:${g.colorName} | nombre:${g.name} | formalidad:${g.formality}`)
    .join('\n');

  const historyDesc = recentOutfits.slice(0, 5)
    .map(o => o.pieces?.map(p => p.name).join(' + '))
    .filter(Boolean).join(' | ') || 'ninguno';

  const weatherDesc = weather ? `${weather.temp}°C, ${weather.description}` : 'templado, sin datos precisos';

  const prompt = `${SYSTEM_PROMPT}

Guardarropa disponible:
${garmentList || 'No hay prendas disponibles.'}

Clima hoy en La Plata: ${weatherDesc}
Últimos outfits usados (no repetir si hay alternativa): ${historyDesc}

Elegí el mejor outfit y devolvé el JSON.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('[Gemini] Error', response.status, errData);
      return { selectedIds: [], reasoning: `Error IA (${response.status}): ${errData?.error?.message || 'revisá la consola'}` };
    }

    const data = await response.json();
    const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    try {
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      return {
        selectedIds: parsed.selectedIds || [],
        reasoning:   parsed.reasoning   || 'Outfit seleccionado por el asesor de imagen.',
      };
    } catch (parseErr) {
      console.error('[Gemini] JSON parse error:', parseErr, raw);
      return { selectedIds: [], reasoning: 'El asesor no pudo estructurar la respuesta. Intentá generar otro outfit.' };
    }

  } catch (err) {
    console.error('[Gemini] Fetch error:', err);
    return { selectedIds: [], reasoning: `Error de red: ${err.message}` };
  }
}
