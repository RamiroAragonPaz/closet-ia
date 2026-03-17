const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export async function selectOutfitWithAI({ availableGarments, recentOutfits, weather }) {
  if (!GEMINI_API_KEY) {
    return { selectedIds: [], reasoning: 'API key de Gemini no configurada.' };
  }

  const available = availableGarments.filter(g => g.status === 'available');
  if (!available.length) {
    return { selectedIds: [], reasoning: 'No hay prendas disponibles.' };
  }

  const garmentList = available
    .map(g => `  {"id":"${g.id}","tipo":"${g.type}","color":"${g.colorName}","nombre":"${g.name}"}`)
    .join('\n');

  const historyDesc = recentOutfits.slice(0, 5)
    .map(o => o.pieces?.map(p => p.name).join(' + '))
    .filter(Boolean).join(' | ') || 'ninguno';

  const weatherDesc = weather?.temp
    ? `${weather.temp}°C, ${weather.description}`
    : 'templado';

  const prompt = `Sos un asesor de imagen masculino, estilo smart casual para el trabajo.

GUARDARROPA DISPONIBLE:
[
${garmentList}
]

CLIMA HOY EN LA PLATA: ${weatherDesc}
OUTFITS RECIENTES (evitar repetir): ${historyDesc}

TAREA: Elegir el mejor outfit posible siguiendo estas reglas estrictas:
1. Elegí EXACTAMENTE 1 top: camisa o remera (obligatorio)
2. Elegí EXACTAMENTE 1 bottom: pantalon o jeans (obligatorio)
3. Elegí EXACTAMENTE 1 calzado: zapatos, zapatillas o mocasines (obligatorio si hay disponible)
4. Saco/buzo: SOLO incluirlo si el clima lo justifica (frio o templado) Y si realmente mejora el look. Si hace calor (mas de 22°C) no incluyas capa exterior.
5. Cinturón: incluirlo solo si hay disponible Y combina con el calzado elegido.
6. NUNCA incluyas 2 prendas del mismo tipo.
7. Priorizá paleta de colores coherente.
8. No repitas prendas usadas recientemente si hay alternativas.

RESPONDÉ ÚNICAMENTE con este JSON (sin texto antes ni después, sin comillas extra, sin markdown):
{"selectedIds":["id1","id2","id3"],"reasoning":"3 oraciones en español explicando por qué funciona esta combinación."}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 600,
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('[Gemini] Error', response.status, errData);
      return { selectedIds: [], reasoning: `Error IA (${response.status}): ${errData?.error?.message || 'sin detalle'}` };
    }

    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('[Gemini] Raw:', raw);

    // Extraer JSON aunque venga con markdown o texto extra
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Gemini] No JSON found in:', raw);
      return { selectedIds: [], reasoning: 'El asesor no devolvió un formato válido. Intentá generar otro outfit.' };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const ids = Array.isArray(parsed.selectedIds) ? parsed.selectedIds : [];
    const reasoning = typeof parsed.reasoning === 'string' ? parsed.reasoning : 'Outfit seleccionado por el asesor.';

    // Validar: máximo 1 prenda por categoría
    const CATEGORY = {
      camisa: 'top', remera: 'top',
      pantalon: 'bottom', jeans: 'bottom',
      saco: 'layer', buzo: 'layer',
      zapatos: 'shoes', zapatillas: 'shoes', mocasines: 'shoes',
      cinturon: 'belt',
    };
    const seen = new Set();
    const validIds = ids.filter(id => {
      const g = available.find(g => g.id === id);
      if (!g) return false;
      const cat = CATEGORY[g.type] || g.type;
      if (seen.has(cat)) return false;
      seen.add(cat);
      return true;
    });

    console.log('[Gemini] Valid IDs:', validIds);
    return { selectedIds: validIds, reasoning };

  } catch (err) {
    console.error('[Gemini] Error:', err);
    return { selectedIds: [], reasoning: `Error al procesar la respuesta: ${err.message}` };
  }
}
