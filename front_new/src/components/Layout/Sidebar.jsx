import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationCounts } from '../../hooks/useNotificationCounts';
import './Sidebar.css';

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { counts, loading, error } = useNotificationCounts();
  
  // Debug logs
  console.log('🔍 [Sidebar] User:', user);
  console.log('🔍 [Sidebar] IsAuthenticated:', isAuthenticated);
  console.log('🔍 [Sidebar] Counts:', counts);
  console.log('🔍 [Sidebar] Loading:', loading);
  console.log('🔍 [Sidebar] Error:', error);
  
  const menuItems = [
    { 
      to: '/', 
      label: 'Dashboard', 
      icon: '📊',
      active: pathname === '/'
    },
    { 
      to: '/menu', 
      label: 'Cardápio', 
      icon: '🍽️',
      active: pathname === '/menu'
    },
    { 
      to: '/cozinha', 
      label: 'Cozinha', 
      icon: '👨‍🍳',
      badge: counts.kitchen,
      active: pathname === '/cozinha'
    },
    { 
      to: '/stock', 
      label: 'Estoque', 
      icon: '📦',
      active: pathname === '/stock'
    },
    { 
      to: '/categories', 
      label: 'Categorias de Produtos', 
      icon: '🏷️',
      active: pathname === '/categories'
    }
  ];

  // Menu administrativo (apenas para usuários admin)
  const adminMenuItems = [
    { 
      to: '/admin/pedidos', 
      label: 'Pedidos', 
      icon: '📋',
      badge: counts.orders,
      active: pathname === '/admin/pedidos'
    },
    { 
      to: '/admin/gestao-garcons', 
      label: 'Gestão de Garçons', 
      icon: '👥',
      active: pathname === '/admin/gestao-garcons'
    },

  ];

  return (
    <aside className="sidebar">
      {/* Logo e Nome da Aplicação */}
      <div className="app-header">
        <div className="logo-container">
          <div className="logo-icon">🍴</div>
          <div className="logo-text">
            <h1>RestaurantPro</h1>
            <p>Sistema de Gestão</p>
          </div>
        </div>
      </div>

      {/* Perfil do Usuário */}
      <div className="user-profile">
        <div className="user-avatar">{(user?.username || 'US').slice(0,2).toUpperCase()}</div>
        <div className="user-info">
          <h3>{user?.username || 'Usuário'}</h3>
          <p>{user?.role || '—'}</p>
        </div>
      </div>

      {/* Menu de Navegação */}
      <nav className="nav-menu">
        {menuItems.map((item) => (
          <Link 
            key={item.to} 
            to={item.to} 
            className={`nav-item ${item.active ? 'active' : ''}`}
          >
            <div className="nav-item-content">
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
            {item.badge > 0 && (
              <span className="badge">{item.badge}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Menu Administrativo */}
      {user?.role === 'admin' && (
        <>
          <div className="admin-section-header">
            <span>Administração</span>
          </div>
          <nav className="nav-menu admin-menu">
            {adminMenuItems.map((item) => (
              <Link 
                key={item.to} 
                to={item.to} 
                className={`nav-item ${item.active ? 'active' : ''}`}
              >
                <div className="nav-item-content">
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="badge">{item.badge}</span>
                )}
              </Link>
            ))}
          </nav>
        </>
      )}
    </aside>
  );
}
