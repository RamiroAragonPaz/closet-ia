import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { getGarments, getOutfitHistory } from './lib/firestore';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import TodayTab from './pages/TodayTab';
import WardrobeTab from './pages/WardrobeTab';
import HistoryTab from './pages/HistoryTab';
import './index.css';

const TABS = [
  { id: 'today',    label: 'Outfit del día' },
  { id: 'wardrobe', label: 'Guardarropa' },
  { id: 'history',  label: 'Historial' },
];

function AppInner() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('today');
  const [garments, setGarments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [g, h] = await Promise.all([
        getGarments(user.uid),
        getOutfitHistory(user.uid),
      ]);
      setGarments(g);
      setHistory(h);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!user) return <LoginPage />;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px',
      }}>
        <span className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }} />
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Cargando tu guardarropa...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Nav */}
      <nav style={{
        display: 'flex',
        padding: '0 20px',
        borderBottom: '0.5px solid var(--border)',
        background: 'var(--bg)',
        position: 'sticky', top: '57px', zIndex: 90,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === t.id ? 'var(--accent)' : 'transparent'}`,
              color: activeTab === t.id ? 'var(--accent)' : 'var(--muted)',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.02em',
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ flex: 1 }}>
        {activeTab === 'today' && (
          <TodayTab
            garments={garments}
            history={history}
            userId={user.uid}
            onOutfitSaved={loadData}
          />
        )}
        {activeTab === 'wardrobe' && (
          <WardrobeTab
            garments={garments}
            userId={user.uid}
            onGarmentsChanged={loadData}
          />
        )}
        {activeTab === 'history' && (
          <HistoryTab history={history} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
