import { useState, useEffect } from 'react';

const WEATHER_CODES = {
  0: { label: 'Despejado', icon: '☀️' },
  1: { label: 'Mayormente despejado', icon: '🌤' },
  2: { label: 'Parcialmente nublado', icon: '⛅' },
  3: { label: 'Nublado', icon: '☁️' },
  45: { label: 'Neblina', icon: '🌫' },
  48: { label: 'Neblina con escarcha', icon: '🌫' },
  51: { label: 'Llovizna leve', icon: '🌦' },
  53: { label: 'Llovizna moderada', icon: '🌦' },
  55: { label: 'Llovizna intensa', icon: '🌧' },
  61: { label: 'Lluvia leve', icon: '🌧' },
  63: { label: 'Lluvia moderada', icon: '🌧' },
  65: { label: 'Lluvia intensa', icon: '🌧' },
  71: { label: 'Nevada leve', icon: '🌨' },
  73: { label: 'Nevada moderada', icon: '🌨' },
  80: { label: 'Chaparrones', icon: '🌦' },
  81: { label: 'Chaparrones moderados', icon: '🌧' },
  95: { label: 'Tormenta', icon: '⛈' },
};

export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=-34.9214&longitude=-57.9544&current=temperature_2m,weathercode,windspeed_10m&timezone=America/Argentina/Buenos_Aires'
        );
        const data = await res.json();
        const code = data.current.weathercode;
        const info = WEATHER_CODES[code] || { label: 'Variable', icon: '🌡' };
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          windspeed: Math.round(data.current.windspeed_10m),
          code,
          icon: info.icon,
          description: info.label,
        });
      } catch (err) {
        setError(err);
        // Fallback silencioso
        setWeather({ temp: null, icon: '🌡', description: 'No disponible', code: 0 });
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  return { weather, loading, error };
}
