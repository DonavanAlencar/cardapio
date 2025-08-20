import './Dashboard.css';

export default function Dashboard() {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const metrics = [
    {
      title: 'Vendas Hoje',
      value: 'R$ 335.20',
      change: '+12.5%',
      changeType: 'positive',
      icon: '💰'
    },
    {
      title: 'Ticket Médio',
      value: 'R$ 111.73',
      change: '+5.2%',
      changeType: 'positive',
      icon: '📈'
    },
    {
      title: 'Taxa de Ocupação',
      value: '33.3%',
      progress: 33.3,
      icon: '👥'
    },
    {
      title: 'Pedidos Ativos',
      value: '3',
      details: '1 pendentes, 1 preparando',
      icon: '🛒'
    }
  ];

  const tableStatuses = [
    { number: 1, status: 'occupied', color: '#3b82f6' },
    { number: 2, status: 'occupied', color: '#3b82f6' },
    { number: 3, status: 'available', color: '#10b981' },
    { number: 4, status: 'payment', color: '#ef4444' },
    { number: 5, status: 'available', color: '#10b981' },
    { number: 6, status: 'reserved', color: '#f59e0b' }
  ];

  const recentOrders = [
    {
      id: 'M1',
      items: 2,
      total: 'R$ 87.80',
      status: 'Pendente',
      statusColor: '#ef4444'
    },
    {
      id: 'M2',
      items: 3,
      total: 'R$ 172.60',
      status: 'Preparando',
      statusColor: '#8b5cf6'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="user-date">Carlos Silva • {currentDate}</p>
      </div>

      {/* Cards de Métricas */}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-header">
              <h3>{metric.title}</h3>
              <span className="metric-icon">{metric.icon}</span>
            </div>
            <div className="metric-value">{metric.value}</div>
            {metric.change && (
              <div className={`metric-change ${metric.changeType}`}>
                {metric.change} desde ontem
              </div>
            )}
            {metric.progress && (
              <div className="metric-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${metric.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            {metric.details && (
              <div className="metric-details">{metric.details}</div>
            )}
          </div>
        ))}
      </div>

      {/* Conteúdo Inferior */}
      <div className="dashboard-bottom">
        {/* Status das Mesas */}
        <div className="table-status-section">
          <h2>Status das Mesas</h2>
          <p className="section-subtitle">Visualização em tempo real</p>
          
          <div className="table-legend">
            <div className="legend-item">
              <span className="legend-color available"></span>
              <span>Disponível: 2</span>
            </div>
            <div className="legend-item">
              <span className="legend-color occupied"></span>
              <span>Ocupada: 2</span>
            </div>
            <div className="legend-item">
              <span className="legend-color reserved"></span>
              <span>Reservada: 1</span>
            </div>
            <div className="legend-item">
              <span className="legend-color payment"></span>
              <span>Aguarda pagto: 1</span>
            </div>
          </div>

          <div className="table-grid">
            {tableStatuses.map((table) => (
              <div 
                key={table.number} 
                className="table-button"
                style={{ backgroundColor: table.color }}
              >
                {table.number}
              </div>
            ))}
          </div>
        </div>

        {/* Pedidos Recentes */}
        <div className="recent-orders-section">
          <h2>Pedidos Recentes</h2>
          <p className="section-subtitle">Últimos pedidos em andamento</p>
          
          <div className="orders-list">
            {recentOrders.map((order) => (
              <div key={order.id} className="order-item">
                <div className="order-header">
                  <div className="order-id">{order.id}</div>
                  <span 
                    className="order-status"
                    style={{ backgroundColor: order.statusColor }}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="order-details">
                  {order.items} item(s) - {order.total}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
