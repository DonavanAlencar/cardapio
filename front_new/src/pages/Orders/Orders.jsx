import { useState } from 'react';
import './Orders.css';

export default function Orders() {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos os Status');

  const summaryCards = [
    {
      title: 'Total de Pedidos',
      value: '3',
      icon: '🛒'
    },
    {
      title: 'Pendentes',
      value: '1',
      icon: '⏰'
    },
    {
      title: 'Prontos',
      value: '1',
      icon: '✅'
    },
    {
      title: 'Valor Total',
      value: 'R$ 335.20',
      icon: '💰'
    }
  ];

  const orders = [
    {
      id: 1,
      client: 'João Silva',
      table: 1,
      total: 'R$ 87.80',
      status: 'Pendente',
      statusColor: '#ef4444',
      date: '08/01/2025 às 20:52'
    },
    {
      id: 2,
      client: 'Maria Santos',
      table: 2,
      total: 'R$ 172.60',
      status: 'Preparando',
      statusColor: '#8b1538',
      date: '08/01/2025 às 19:30'
    },
    {
      id: 3,
      client: 'Carlos Oliveira',
      table: 4,
      total: 'R$ 74.80',
      status: 'Pronto',
      statusColor: '#f59e0b',
      date: '08/01/2025 às 18:45'
    }
  ];

  return (
    <div className="orders-page">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-title">
          <h1>Gerenciar Pedidos</h1>
          <p>Controle completo dos pedidos do restaurante</p>
        </div>
        <button 
          className="add-order-btn"
          onClick={() => setShowModal(true)}
        >
          + ADICIONAR PEDIDO
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="summary-cards">
        {summaryCards.map((card, index) => (
          <div key={index} className="summary-card">
            <div className="card-icon">{card.icon}</div>
            <div className="card-content">
              <h3>{card.title}</h3>
              <span className="card-value">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros e Busca */}
      <div className="filters-section">
        <div className="search-filter">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Filtrar por Cliente"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="status-filter">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>Todos os Status</option>
              <option>Pendente</option>
              <option>Preparando</option>
              <option>Pronto</option>
            </select>
          </div>
        </div>
        <div className="filter-info">
          <span>{orders.length} de {orders.length} pedidos</span>
        </div>
      </div>

      {/* Tabela de Pedidos */}
      <div className="orders-table-section">
        <div className="section-header">
          <h2>Lista de Pedidos</h2>
          <p>Todos os pedidos registrados no sistema</p>
        </div>
        
        <div className="table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>CLIENTE</th>
                <th>MESA</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>DATA</th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.client}</td>
                  <td>{order.table}</td>
                  <td>{order.total}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: order.statusColor }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{order.date}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit">✏️</button>
                      <button className="action-btn view">👁️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Novo Pedido */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Pedido</h2>
              <p>Adicione um novo pedido ao sistema</p>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Mesa</label>
                <select className="form-select">
                  <option>Selecione a mesa</option>
                  <option>Mesa 1</option>
                  <option>Mesa 2</option>
                  <option>Mesa 3</option>
                  <option>Mesa 4</option>
                  <option>Mesa 5</option>
                  <option>Mesa 6</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Cliente</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Nome do cliente"
                />
              </div>
              
              <div className="form-group">
                <label>Itens do Pedido</label>
                <button className="add-item-btn">+ Adicionar Item</button>
                <p className="empty-state">Nenhum item adicionado ainda</p>
              </div>
              
              <div className="form-group">
                <label>Observações</label>
                <textarea 
                  className="form-textarea"
                  placeholder="Observações especiais para a cozinha..."
                ></textarea>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-primary">
                Criar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
