const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export async function selectOutfitWithAI({ availableGarments, recentOutfits, weather }) {
  if (!GEMINI_API_KEY) {
    return { selectedIds: [], reasoning: 'API key de Gemini no configurada.' };
  }

  const available = availableGarments.filter(g => g.status === 'available');
  if (!available.length) {
    return { selectedIds: [], reasoning: 'No hay prendas disponibles.' };
  }

  const indexMap = {};
  available.forEach((g, i) => { indexMap[i] = g; });

  const garmentList = available
    .map((g, i) => `${i}=${g.type},${g.colorName}`)
    .join(';');

  const historyDesc = recentOutfits.slice(0, 2)
    .map(o => o.pieces?.map(p => p.name).join('+'))
    .filter(Boolean).join('/') || 'ninguno';

  const weatherDesc = weather?.temp ? `${weather.temp}C` : '18C';

  // Prompt ultra-compacto para minimizar output
  const prompt = `Asesor moda masculina smart casual laboral.
Prendas: ${garmentList}
Clima: ${weatherDesc}. Recientes: ${historyDesc}
Reglas: 1 top(camisa/remera)+1 bottom(pantalon/jeans)+1 calzado si hay. Saco solo si <22C. Sin duplicados. Paleta coherente.
Responde SOLO: INDICES:n,n,n RAZON:texto corto`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.3,
        },
      }),
    });

    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      return { selectedIds: [], reasoning: `Error IA (${res.status}): ${e?.error?.message || ''}` };
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const raw = parts.map(p => p.text || '').join('').replace(/```/g, '').trim();
    console.log('[Gemini] raw:', raw);

    // Parsear formato: INDICES:0,2,5 RAZON:texto
    const idxMatch  = raw.match(/INDICES?\s*:\s*([\d,\s]+)/i);
    const razonMatch = raw.match(/RAZ[OÓ]N?\s*:\s*(.+)/i);

    if (!idxMatch) {
      console.error('[Gemini] no indices found in:', raw);
      return { selectedIds: [], reasoning: raw || 'No se pudo procesar la respuesta.' };
    }

    const indices = idxMatch[1].split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    const reasoning = razonMatch ? razonMatch[1].trim() : 'Outfit seleccionado por el asesor.';

    const CATEGORY = {
      camisa: 'top', remera: 'top',
      pantalon: 'bottom', jeans: 'bottom',
      saco: 'layer', buzo: 'layer',
      zapatos: 'shoes', zapatillas: 'shoes', mocasines: 'shoes',
      cinturon: 'belt',
    };
    const seen = new Set();
    const selectedIds = indices
      .map(i => indexMap[i])
      .filter(g => {
        if (!g) return false;
        const cat = CATEGORY[g.type] || g.type;
        if (seen.has(cat)) return false;
        seen.add(cat);
        return true;
      })
      .map(g => g.id);

    console.log('[Gemini] selectedIds:', selectedIds, 'reasoning:', reasoning);
    return { selectedIds, reasoning };

  } catch (err) {
    console.error('[Gemini] err:', err);
    return { selectedIds: [], reasoning: `Error: ${err.message}` };
  }
}
