import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  const { pathname } = useLocation();
  
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
      to: '/kitchen', 
      label: 'Cozinha', 
      icon: '👨‍🍳',
      badge: 3,
      active: pathname === '/kitchen'
    },
    { 
      to: '/orders', 
      label: 'Pedidos (Admin)', 
      icon: '📋',
      badge: 2,
      active: pathname === '/orders',
      expandable: true
    },
    { 
      to: '/stock', 
      label: 'Estoque', 
      icon: '📦',
      active: pathname === '/stock'
    },
    { 
      to: '/categories', 
      label: 'Categorias', 
      icon: '🏷️',
      active: pathname === '/categories'
    }
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
        <div className="user-avatar">CS</div>
        <div className="user-info">
          <h3>Carlos Silva</h3>
          <p>Manager</p>
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
              {item.expandable && <span className="expand-icon">⌄</span>}
            </div>
            {item.badge && (
              <span className="badge">{item.badge}</span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
