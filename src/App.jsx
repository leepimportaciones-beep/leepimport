import React, { useEffect, useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import Home from './pages/Home';
import Admin from './pages/Admin';

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
          <div className="logoPulse">L</div>
          <h1>LEEP Import</h1>
          <p>Iniciando sucursal digital...</p>
        </div>
      )}
      {ready && (location.pathname.startsWith('/admin') ? <Admin /> : <Home />)}
    </AppProvider>
  );
}
