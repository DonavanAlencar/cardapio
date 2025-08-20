import './Kitchen.css';

export default function Kitchen() {
  const columns = [
    {
      status: 'Pendente',
      count: 1,
      icon: '⚠️',
      color: '#ef4444',
      orders: [
        {
          id: 1,
          customer: 'João Silva',
          table: 'Mesa 1',
          items: [
            { name: 'Risotto de Camarão', quantity: 1 },
            { name: 'Cerveja Artesanal IPA', quantity: 1 }
          ],
          timer: '5235h 56min',
          observations: null
        }
      ]
    },
    {
      status: 'Em Preparo',
      count: 1,
      icon: '👨‍🍳',
      color: '#f59e0b',
      orders: [
        {
          id: 2,
          customer: 'Maria Santos',
          table: 'Mesa 2',
          items: [
            { name: 'Bruschetta Italiana', quantity: 1 },
            { name: 'Salmão Grelhado', quantity: 1 },
            { name: 'Vinho Tinto Reserva', quantity: 2 }
          ],
          timer: '5237h 18min',
          observations: 'Cliente alérgico a frutos do mar - substituir camarão por cogumelos'
        }
      ]
    },
    {
      status: 'Pronto',
      count: 1,
      icon: '✅',
      color: '#8b1538',
      orders: [
        {
          id: 3,
          customer: 'Carlos Oliveira',
          table: 'Mesa 4',
          items: [
            { name: 'Hambúrguer Artesanal', quantity: 1 },
            { name: 'Tiramisu da Casa', quantity: 1 }
          ],
          timer: '5238h 3min',
          observations: null
        }
      ]
    },
    {
      status: 'Entregue',
      count: 0,
      icon: '🚚',
      color: '#10b981',
      orders: []
    }
  ];

  return (
    <div className="kitchen-page">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-title">
          <h1>Painel da Cozinha</h1>
          <p>Controle de produção em tempo real</p>
        </div>
      </div>

      {/* Painel Kanban */}
      <div className="kitchen-board">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="kanban-column">
            {/* Cabeçalho da Coluna */}
            <div className="column-header" style={{ borderTopColor: column.color }}>
              <div className="column-info">
                <span className="column-icon">{column.icon}</span>
                <h3>{column.status}</h3>
                <span className="column-count">{column.count}</span>
              </div>
            </div>

            {/* Cards dos Pedidos */}
            <div className="column-content">
              {column.orders.length > 0 ? (
                column.orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header" style={{ backgroundColor: column.color }}>
                      <span className="order-status">{column.status}</span>
                    </div>
                    
                    <div className="order-body">
                      <div className="customer-info">
                        <h4>{order.customer}</h4>
                        <p className="table-info">{order.table}</p>
                      </div>
                      
                      <div className="order-items">
                        {order.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="item-row">
                            <span className="item-name">{item.name}</span>
                            <span className="item-quantity">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      
                      {order.observations && (
                        <div className="observations">
                          <h5>Observações:</h5>
                          <p>{order.observations}</p>
                        </div>
                      )}
                      
                      <div className="order-timer">
                        <span className="timer-icon">⏱️</span>
                        {order.timer}
                      </div>
                      
                      <div className="order-actions">
                        <button className="action-btn details">Detalhes</button>
                        {column.status === 'Pendente' && (
                          <button className="action-btn advance">AVANÇAR →</button>
                        )}
                        {column.status === 'Em Preparo' && (
                          <button className="action-btn finish">FINALIZAR →</button>
                        )}
                        {column.status === 'Pronto' && (
                          <button className="action-btn deliver">ENTREGAR →</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-column">
                  <p>Nenhum pedido</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
