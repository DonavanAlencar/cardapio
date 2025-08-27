import './Header.css';
import { useAuth } from '../../contexts/AuthContext';
// import useNotifications from '../../hooks/useNotifications';
import { useEffect, useState } from 'react';
import { subscribeLoading } from '../../utils/loadingBus';

export default function Header({ pageTitle }) {
  const { user } = useAuth();
  // const { count, loading, disabled } = useNotifications();
  const count = 0;
  const loading = false;
  const disabled = true;
  const [anyLoading, setAnyLoading] = useState(false);
  useEffect(() => {
    return subscribeLoading((c) => setAnyLoading(c > 0));
  }, []);
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
          <div className="notification-icon" title={disabled ? 'Notificações indisponíveis' : (loading ? 'Carregando notificações...' : 'Notificações')}>
            {disabled ? '🔕' : (loading ? '⏳' : '🔔')}
          </div>
          {count > 0 && !loading && !disabled && <span className="notification-badge">{count}</span>}
        </div>
        
        <div className="user-profile-header">
          <div className="user-avatar-header" title={anyLoading ? 'Processando...' : user?.username}>
            {(user?.username || 'US').slice(0,2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
