import './Header.css';

export default function Header({ pageTitle }) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="breadcrumb">
          <span className="current-page">{pageTitle}</span>
          <span className="separator">•</span>
          <span className="user-name">Carlos Silva</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="notifications">
          <div className="notification-icon">🔔</div>
          <span className="notification-badge">6</span>
        </div>
        
        <div className="user-profile-header">
          <div className="user-avatar-header">CS</div>
        </div>
      </div>
    </header>
  );
}
