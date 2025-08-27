import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useEffect, useState } from 'react';
import { subscribeLoading } from '../../utils/loadingBus';

export default function Layout() {
  const { pathname } = useLocation();
  const [globalLoading, setGlobalLoading] = useState(false);

  useEffect(() => {
    return subscribeLoading((count) => setGlobalLoading(count > 0));
  }, []);
  
  // Mapear rotas para títulos das páginas
  const getPageTitle = () => {
    switch (pathname) {
      case '/': return 'Dashboard';
      case '/kitchen': return 'Cozinha';
      case '/menu': return 'Cardápio';
      case '/orders': return 'Pedidos (Admin)';
      case '/stock': return 'Estoque';
      case '/categories': return 'Categorias';
      default: return 'Dashboard';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header pageTitle={getPageTitle()} />
        <main style={{ flex: 1, padding: 24, background: '#f8f9fa' }}>
          <Outlet />
        </main>
      </div>
      {globalLoading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(255,255,255,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '4px solid #1976d2',
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
        </div>
      )}
    </div>
  );
}
