import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const { pathname } = useLocation();
  
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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header pageTitle={getPageTitle()} />
        <main style={{ flex: 1, padding: 24, background: '#f8f9fa' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
