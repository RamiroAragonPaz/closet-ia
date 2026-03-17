const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

/**
 * Llama a Gemini para que elija las prendas Y justifique en una sola llamada.
 * Devuelve { selectedIds: string[], reasoning: string }
 */
export async function selectOutfitWithAI({ availableGarments, recentOutfits, weather }) {
  if (!GEMINI_API_KEY) {
    return { selectedIds: [], reasoning: 'API key de Gemini no configurada.' };
  }

  const available = availableGarments.filter(g => g.status === 'available');
  if (!available.length) {
    return { selectedIds: [], reasoning: 'No hay prendas disponibles.' };
  }

  const garmentList = available
    .map(g => `{"id":"${g.id}","tipo":"${g.type}","color":"${g.colorName}","nombre":"${g.name}","formalidad":"${g.formality}"}`)
    .join(',\n');

  const historyDesc = recentOutfits.slice(0, 5)
    .map(o => o.pieces?.map(p => p.name).join(' + '))
    .filter(Boolean).join(' | ') || 'ninguno';

  const weatherDesc = weather?.temp
    ? `${weather.temp}°C, ${weather.description}`
    : 'templado';

  const prompt = `Sos un asesor de imagen masculino experto en moda smart casual para el trabajo.

Guardarropa disponible (array JSON):
[
${garmentList}
]

Clima hoy en La Plata: ${weatherDesc}
Outfits recientes a evitar repetir: ${historyDesc}

Tu tarea: elegir UN outfit completo y coherente. Reglas:
- Elegí EXACTAMENTE 1 prenda de cada categoría que aplique: 1 top (camisa o remera), 1 bottom (pantalon o jeans), máximo 1 capa exterior (saco o buzo, solo si el clima lo amerita), máximo 1 calzado, máximo 1 cinturón.
- NO incluyas 2 prendas del mismo tipo.
- Priorizá paleta coherente de colores.
- El cinturón debe combinar con el calzado.
- No repitas prendas usadas recientemente si hay alternativas.

Respondé SOLO con este JSON (sin texto antes ni después, sin markdown):
{"selectedIds":["id_top","id_bottom"],"reasoning":"3 oraciones en español explicando por qué funciona esta combinación de colores y estilo."}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('[Gemini] Error', response.status, errData);
      return { selectedIds: [], reasoning: `Error IA (${response.status}): ${errData?.error?.message || 'sin detalle'}` };
    }

    const data = await response.json();
    const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('[Gemini] Raw response:', raw);

    // Limpiar posibles restos de markdown
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    const ids = Array.isArray(parsed.selectedIds) ? parsed.selectedIds : [];
    const reasoning = parsed.reasoning || 'Outfit seleccionado por el asesor.';

    // Validar que no haya dos prendas del mismo tipo
    const CATEGORY = {
      camisa: 'top', remera: 'top',
      pantalon: 'bottom', jeans: 'bottom',
      saco: 'layer', buzo: 'layer',
      zapatos: 'shoes', zapatillas: 'shoes', mocasines: 'shoes',
      cinturon: 'belt',
    };

    const seen = new Set();
    const validIds = ids.filter(id => {
      const garment = available.find(g => g.id === id);
      if (!garment) return false;
      const cat = CATEGORY[garment.type] || garment.type;
      if (seen.has(cat)) return false;
      seen.add(cat);
      return true;
    });

    console.log('[Gemini] Selected IDs after validation:', validIds);
    return { selectedIds: validIds, reasoning };

  } catch (err) {
    console.error('[Gemini] Error:', err);
    return { selectedIds: [], reasoning: `Error al procesar la respuesta de la IA: ${err.message}` };
  }
}
