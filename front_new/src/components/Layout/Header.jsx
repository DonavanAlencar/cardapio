import './Header.css';
import { useAuth } from '../../contexts/AuthContext';
import useNotifications from '../../hooks/useNotifications';

export default function Header({ pageTitle }) {
  const { user } = useAuth();
  const { count } = useNotifications();
  return (
    <header className="header">
      <div className="header-left">
        <div className="breadcrumb">
          <span className="current-page">{pageTitle}</span>
          <span className="separator">•</span>
          <span className="user-name">{user?.username || 'Usuário'}</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="notifications">
          <div className="notification-icon">🔔</div>
          {count > 0 && <span className="notification-badge">{count}</span>}
        </div>
        
        <div className="user-profile-header">
          <div className="user-avatar-header">{(user?.username || 'US').slice(0,2).toUpperCase()}</div>
        </div>
      </div>
    </header>
  );
}
