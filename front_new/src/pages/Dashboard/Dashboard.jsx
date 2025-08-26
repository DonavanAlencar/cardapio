import { useState, useEffect } from 'react';
import './Dashboard.css';
import dashboardService from '../../services/dashboardService';
import DashboardDebug from '../../components/DashboardDebug';
import ReservationsList from '../../components/ReservationsList';
import ReservationModal from '../../components/ReservationModal';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [showReservations, setShowReservations] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [currentDate] = useState(new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  // Buscar dados do dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboardData();
      
      // Buscar dados de reservas se disponível
      if (data.user?.branch_id) {
        try {
          const reservationsData = await dashboardService.getReservationsData(data.user.branch_id);
          data.reservations = reservationsData.data || [];
        } catch (err) {
          console.error('Erro ao buscar reservas:', err);
          data.reservations = [];
        }
      }
      
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar dados em tempo real
  const updateRealTimeData = async () => {
    try {
      const realTimeData = await dashboardService.getRealTimeData();
      setDashboardData(prev => ({
        ...prev,
        tables: realTimeData.tables,
        recentOrders: realTimeData.activeOrders
      }));
    } catch (err) {
      console.error('Erro ao atualizar dados em tempo real:', err);
    }
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Efeito para atualização em tempo real (a cada 30 segundos)
  useEffect(() => {
    const interval = setInterval(updateRealTimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Funções para gerenciar reservas
  const handleShowReservations = () => {
    setShowReservations(!showReservations);
  };

  const handleCreateReservation = () => {
    setEditingReservation(null);
    setShowReservationModal(true);
  };

  const handleEditReservation = (reservation) => {
    setEditingReservation(reservation);
    setShowReservationModal(true);
  };

  const handleCloseReservationModal = () => {
    setShowReservationModal(false);
    setEditingReservation(null);
  };

  const handleReservationSuccess = () => {
    fetchDashboardData();
    updateRealTimeData();
  };

  // Loading state
  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="user-date">Carregando...</p>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="user-date">{currentDate}</p>
        </div>
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={fetchDashboardData} className="retry-button">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Se não há dados
  if (!dashboardData) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="user-date">{currentDate}</p>
        </div>
        <div className="no-data-state">
          <p>Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  const { user, metrics, tables, recentOrders, lowStock, summary } = dashboardData;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="user-date">{user?.name || 'Usuário'} • {user?.branch || 'Filial'} • {currentDate}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleShowReservations}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: showReservations ? '#10b981' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {showReservations ? '📋 Ocultar Reservas' : '📋 Ver Reservas'}
          </button>
          <button 
            onClick={() => setShowDebug(!showDebug)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: showDebug ? '#ef4444' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {showDebug ? '🔒 Ocultar Debug' : '🔍 Debug'}
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <h3>Vendas Hoje</h3>
            <span className="metric-icon">💰</span>
          </div>
          <div className="metric-value">
            {dashboardService.formatCurrency(metrics.salesToday.value)}
          </div>
          {metrics.salesToday.change && (
            <div className={`metric-change ${metrics.salesToday.changeType}`}>
              {metrics.salesToday.changeType === 'positive' ? '+' : ''}{metrics.salesToday.change}% desde ontem
            </div>
          )}
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Ticket Médio</h3>
            <span className="metric-icon">📈</span>
          </div>
          <div className="metric-value">
            {dashboardService.formatCurrency(metrics.avgTicket.value)}
          </div>
          {metrics.avgTicket.change && (
            <div className={`metric-change ${metrics.avgTicket.changeType}`}>
              {metrics.avgTicket.changeType === 'positive' ? '+' : ''}{metrics.avgTicket.change}% desde ontem
            </div>
          )}
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Taxa de Ocupação</h3>
            <span className="metric-icon">👥</span>
          </div>
          <div className="metric-value">{metrics.occupancyRate.value}%</div>
          <div className="metric-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${metrics.occupancyRate.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Pedidos Ativos</h3>
            <span className="metric-icon">🛒</span>
          </div>
          <div className="metric-value">{metrics.activeOrders.value}</div>
          {metrics.activeOrders.details && (
            <div className="metric-details">{metrics.activeOrders.details}</div>
          )}
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Reservas Hoje</h3>
            <span className="metric-icon">📋</span>
          </div>
          <div className="metric-value">
            {dashboardData.reservations ? dashboardData.reservations.length : 0}
          </div>
          <div className="metric-details">
            {dashboardData.reservations ? 
              `${dashboardData.reservations.filter(r => r.status === 'booked').length} ativas` : 
              '0 ativas'
            }
          </div>
        </div>
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
              <span>Disponível: {summary.availableTables}</span>
            </div>
            <div className="legend-item">
              <span className="legend-color occupied"></span>
              <span>Ocupada: {summary.occupiedTables}</span>
            </div>
            <div className="legend-item">
              <span className="legend-color reserved"></span>
              <span>Reservada: {summary.totalTables - summary.occupiedTables - summary.availableTables}</span>
            </div>
            {dashboardData.reservations && dashboardData.reservations.length > 0 && (
              <div className="legend-item">
                <span className="legend-color reservations"></span>
                <span>Reservas hoje: {dashboardData.reservations.length}</span>
              </div>
            )}
          </div>

          <div className="table-grid">
            {tables.map((table) => (
              <div 
                key={table.id} 
                className="table-button"
                style={{ backgroundColor: dashboardService.mapTableStatusColor(table.status) }}
                title={`Mesa ${table.number} - ${dashboardService.mapTableStatus(table.status)}${table.hasOrder ? ` - Pedido: ${dashboardService.formatCurrency(table.orderTotal)}` : ''}`}
              >
                {table.number}
                {table.hasOrder && <div className="table-order-indicator">📋</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Pedidos Recentes */}
        <div className="recent-orders-section">
          <h2>Pedidos Recentes</h2>
          <p className="section-subtitle">Últimos pedidos em andamento</p>
          
          <div className="orders-list">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="order-item">
                  <div className="order-header">
                    <div className="order-id">M{order.table || order.id}</div>
                    <span 
                      className="order-status"
                      style={{ backgroundColor: dashboardService.mapOrderStatusColor(order.status) }}
                    >
                      {dashboardService.mapOrderStatus(order.status)}
                    </span>
                  </div>
                  <div className="order-details">
                    {order.items} item(s) - {dashboardService.formatCurrency(order.total)}
                  </div>
                  <div className="order-time">
                    {dashboardService.formatDate(order.createdAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-orders">
                <p>Nenhum pedido ativo no momento</p>
              </div>
            )}
          </div>
        </div>

        {/* Estoque Baixo */}
        {lowStock.length > 0 && (
          <div className="low-stock-section">
            <h2>Estoque Baixo</h2>
            <p className="section-subtitle">Ingredientes que precisam de reposição</p>
            
            <div className="stock-list">
              {lowStock.map((item, index) => (
                <div key={index} className="stock-item">
                  <div className="stock-name">{item.name}</div>
                  <div className="stock-levels">
                    <span className="current-stock">Atual: {item.current}</span>
                    <span className="min-stock">Mín: {item.minimum}</span>
                    <span className="stock-percentage">{item.percentage}%</span>
                  </div>
                  <div className="stock-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill warning" 
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seção de Reservas */}
      {showReservations && (
        <div style={{ marginTop: '2rem', borderTop: '2px solid #e5e7eb', paddingTop: '2rem' }}>
          <ReservationsList 
            branchId={user?.branch_id || 1}
            onRefresh={handleReservationSuccess}
          />
        </div>
      )}

      {/* Componente de Debug */}
      {showDebug && (
        <div style={{ marginTop: '2rem', borderTop: '2px solid #e5e7eb', paddingTop: '2rem' }}>
          <DashboardDebug />
        </div>
      )}

      {/* Modal de Reserva */}
      <ReservationModal
        isOpen={showReservationModal}
        onClose={handleCloseReservationModal}
        onSuccess={handleReservationSuccess}
        reservation={editingReservation}
        branchId={user?.branch_id || 1}
      />
    </div>
  );
}
