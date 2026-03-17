import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWeather } from '../hooks/useWeather';

export default function Header({ activeTab, onTabChange }) {
  const { logout } = useAuth();
  const { weather } = useWeather();

  return (
    <header style={{
      padding: '16px 20px',
      borderBottom: '0.5px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      background: 'var(--bg)',
      zIndex: 100,
    }}>
      <h1 style={{ fontSize: '22px' }}>
        <span style={{ color: 'var(--accent)' }}>Closet</span> IA
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {weather && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px',
            background: 'var(--surface)',
            border: '0.5px solid var(--border2)',
            borderRadius: '20px',
            fontSize: '12px',
            color: 'var(--muted)',
          }}>
            <span>{weather.icon}</span>
            <span>La Plata</span>
            {weather.temp !== null && (
              <span style={{ color: 'var(--info)', fontWeight: 500 }}>{weather.temp}°C</span>
            )}
          </div>
        )}

        <button
          className="btn"
          onClick={logout}
          style={{ padding: '5px 10px', fontSize: '12px' }}
          title="Cerrar sesión"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
