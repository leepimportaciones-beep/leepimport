import React, { useEffect, useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { LeepLogo } from './components/LeepLogo';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppProvider>
      {!ready && (
        <div className="splash">
          <div className="logoPulse">
            <LeepLogo width={56} height={56} />
          </div>
          <h1 style={{ marginTop: '16px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>LEEP Import</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-purple)' }}>Iniciando sucursal digital...</p>
        </div>
      )}
      {ready && (location.pathname.startsWith('/admin') ? <Admin /> : <Home />)}
    </AppProvider>
  );
}
