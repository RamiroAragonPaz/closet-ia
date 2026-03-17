const ANTHROPIC_API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `Sos un asesor de imagen masculino experto en moda smart casual para el ámbito laboral. 
Tu rol es justificar combinaciones de ropa de manera concisa, sofisticada y útil.
Cuando des tu análisis incluí:
1. Por qué los colores funcionan juntos (teoría del color, contraste, paletas)
2. La coherencia de estilo y formalidad
3. Cómo el clima del día influye en la elección
4. Si corresponde, qué podría mejorar el outfit
Respondé en español rioplatense, de manera directa. Máximo 4 oraciones. Sin saludos ni intro.`;

export async function getOutfitReasoning({ outfit, availableGarments, recentOutfits, weather }) {
  if (!ANTHROPIC_API_KEY) {
    return 'API key de Anthropic no configurada. Agregá REACT_APP_ANTHROPIC_API_KEY en las variables de entorno de Vercel.';
  }

  const outfitDesc = outfit.map(g => `${g.type} ${g.colorName} (${g.name})`).join(', ');
  const availableDesc = availableGarments
    .filter(g => g.status === 'available')
    .map(g => `${g.type} ${g.colorName}`)
    .join(', ');
  const historyDesc = recentOutfits.slice(0, 5).map(o =>
    o.pieces.map(p => p.name).join(' + ')
  ).join(' | ') || 'ninguno reciente';

  const weatherDesc = weather
    ? `${weather.temp}°C, ${weather.description}`
    : 'clima no disponible';

  const userMessage = `Outfit propuesto: ${outfitDesc}
Clima hoy en La Plata: ${weatherDesc}
Guardarropa disponible: ${availableDesc}
Últimos outfits usados: ${historyDesc}

Justificá este outfit como asesor de imagen.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('[Anthropic] Error', response.status, errData);
      return `Error IA (${response.status}): ${errData?.error?.message || 'revisá la consola para más detalles'}`;
    }

    const data = await response.json();
    return data.content?.[0]?.text || 'Combinación seleccionada por coherencia de estilo y paleta de colores.';
  } catch (err) {
    console.error('[Anthropic] Fetch error:', err);
    return `Error de red al conectar con la IA: ${err.message}`;
  }
}
