const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export async function selectOutfitWithAI({ availableGarments, recentOutfits, weather }) {
  if (!GEMINI_API_KEY) {
    return { selectedIds: [], reasoning: 'API key de Gemini no configurada.' };
  }

  const available = availableGarments.filter(g => g.status === 'available');
  if (!available.length) {
    return { selectedIds: [], reasoning: 'No hay prendas disponibles.' };
  }

  // Usamos índices numéricos cortos (0,1,2...) en lugar de IDs largos de Firestore
  // Así el JSON de respuesta es mucho más corto y no se trunca
  const indexMap = {};
  available.forEach((g, i) => { indexMap[i] = g.id; });

  const garmentList = available
    .map((g, i) => `${i}:${g.type}|${g.colorName}|${g.name}`)
    .join('\n');

  const historyDesc = recentOutfits.slice(0, 3)
    .map(o => o.pieces?.map(p => p.name).join('+'))
    .filter(Boolean).join(' / ') || 'ninguno';

  const weatherDesc = weather?.temp ? `${weather.temp}°C` : 'templado';

  const prompt = `Asesor de imagen masculino, smart casual laboral.

PRENDAS (indice:tipo|color|nombre):
${garmentList}

CLIMA: ${weatherDesc}
RECIENTES: ${historyDesc}

REGLAS:
- 1 top (camisa/remera), 1 bottom (pantalon/jeans), 1 calzado si hay
- Saco/buzo solo si hace frio o templado (menos de 22C)
- Cinturon solo si combina con calzado elegido
- Nunca 2 del mismo tipo
- Paleta coherente, no repetir recientes

Responde SOLO este JSON con indices numericos:
{"i":[0,1,2],"r":"explicacion en 2 oraciones"}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 200, temperature: 0.4 },
      }),
    });

    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      return { selectedIds: [], reasoning: `Error IA (${res.status}): ${e?.error?.message || ''}` };
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const raw = parts.map(p => p.text || '').join('').replace(/```json|```/g, '').trim();
    console.log('[Gemini] raw:', raw);

    // Extraer JSON — buscar el que tenga "i":
    const match = raw.match(/\{[\s\S]*"i"\s*:\s*\[[\d,\s]*\][\s\S]*\}/);
    if (!match) {
      console.error('[Gemini] no match in:', raw);
      return { selectedIds: [], reasoning: 'No se pudo procesar la respuesta. Intentá de nuevo.' };
    }

    const parsed = JSON.parse(match[0]);
    const indices = Array.isArray(parsed.i) ? parsed.i : [];
    const reasoning = parsed.r || 'Outfit seleccionado.';

    // Mapear índices → IDs reales, validando categorías únicas
    const CATEGORY = {
      camisa: 'top', remera: 'top',
      pantalon: 'bottom', jeans: 'bottom',
      saco: 'layer', buzo: 'layer',
      zapatos: 'shoes', zapatillas: 'shoes', mocasines: 'shoes',
      cinturon: 'belt',
    };
    const seen = new Set();
    const selectedIds = indices
      .filter(i => indexMap[i] !== undefined)
      .map(i => available[i])
      .filter(g => {
        if (!g) return false;
        const cat = CATEGORY[g.type] || g.type;
        if (seen.has(cat)) return false;
        seen.add(cat);
        return true;
      })
      .map(g => g.id);

    console.log('[Gemini] selectedIds:', selectedIds);
    return { selectedIds, reasoning };

  } catch (err) {
    console.error('[Gemini] err:', err);
    return { selectedIds: [], reasoning: `Error: ${err.message}` };
  }
}
