import './Menu.css';

export default function Menu() {
  const metrics = [
    { label: 'Total', value: '8' },
    { label: 'Disponíveis', value: '7', icon: '✅', highlight: 'Item do Dia' },
    { label: 'Item do Dia', value: '1', icon: '⭐' },
    { label: 'Estoque Baixo', value: '6', icon: '⚠️' }
  ];

  const menuItems = [
    {
      name: 'Bruschetta Italiana',
      description: 'Pão artesanal tostado com tomate fresco, manjericão, azeite extravirgem e queijo brie',
      category: 'Entradas',
      categoryColor: '#10b981',
      price: 'R$ 32.90',
      cost: 'R$ 12.50',
      prepTime: '8 min',
      status: true,
      orders: 256,
      isPopular: true,
      lastUpdated: '04/01/2025',
      hasImage: false
    },
    {
      name: 'Cerveja Artesanal IPA',
      description: 'Cerveja India Pale Ale, aroma cítrico, sabor intenso e amargor equilibrado - 500ml',
      category: 'Bebidas',
      categoryColor: '#3b82f6',
      price: 'R$ 18.90',
      cost: 'R$ 6.50',
      prepTime: '2 min',
      status: true,
      orders: 203,
      isPopular: true,
      lastUpdated: '03/01/2025',
      hasImage: true,
      lowStock: true
    },
    {
      name: 'Hambúrguer Artesanal',
      description: 'Carne bovina 180g, queijo cheddar, bacon, tomate, alface, cebola caramelizada e batata rústica',
      category: 'Pratos Principais',
      categoryColor: '#ef4444',
      price: 'R$ 45.90',
      cost: 'R$ 18.90',
      prepTime: '18 min',
      status: true,
      orders: 167,
      isPopular: true,
      lastUpdated: '06/01/2025',
      hasImage: true,
      lowStock: true
    },
    {
      name: 'Polvo à Lagareiro',
      description: '',
      category: 'Pratos Principais',
      categoryColor: '#9ca3af',
      price: 'R$ 95.90',
      cost: '',
      prepTime: '35 min',
      status: false,
      orders: 34,
      isPopular: false,
      lastUpdated: '05/01/2025',
      hasImage: false
    }
  ];

  return (
    <div className="menu-page">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-title">
          <h1>Gestão de Cardápio</h1>
          <p>Gerencie os itens do seu cardápio</p>
        </div>
      </div>

      {/* Métricas Superiores */}
      <div className="top-metrics">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-item">
            <span className="metric-value">{metric.value}</span>
            {metric.icon && <span className="metric-icon">{metric.icon}</span>}
            {metric.highlight && (
              <span className="metric-highlight">{metric.highlight}</span>
            )}
          </div>
        ))}
      </div>

      {/* Abas de Filtro */}
      <div className="filter-tabs">
        <button className="tab active">Todos</button>
        <button className="tab">
          <span className="tab-icon">⭐</span>
          Item do Dia
        </button>
        <button className="tab">
          <span className="tab-icon">📈</span>
          Populares
        </button>
        <button className="tab">
          <span className="tab-icon">👨‍🍳</span>
          Chef
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="filters-section">
        <div className="search-filter">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Pesquisar por nome, descrição ou tags..."
            />
          </div>
          <div className="category-filters">
            <select className="category-select">
              <option>Todas as categorias</option>
              <option>Entradas</option>
              <option>Pratos Principais</option>
              <option>Bebidas</option>
            </select>
            <select className="subcategory-select">
              <option>Todos</option>
            </select>
          </div>
        </div>
        <div className="filter-info">
          <span>8 de 8 itens</span>
          <div className="sort-controls">
            <span className="sort-label">Nome</span>
            <span className="sort-arrows">↑↓</span>
            <span className="sort-text">Crescente</span>
          </div>
          <button className="clear-filters">Limpar Filtros</button>
        </div>
      </div>

      {/* Tabela de Itens */}
      <div className="menu-table-section">
        <table className="menu-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Preparo</th>
              <th>Status</th>
              <th>Pedidos</th>
              <th>Atualizado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item, index) => (
              <tr key={index}>
                <td className="item-cell">
                  <div className="item-info">
                    {item.hasImage && (
                      <div className="item-thumbnail">
                        {item.name.includes('Cerveja') ? '🍺' : '🍔'}
                      </div>
                    )}
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      {item.description && <p>{item.description}</p>}
                    </div>
                  </div>
                </td>
                <td>
                  <span 
                    className="category-tag"
                    style={{ backgroundColor: item.categoryColor }}
                  >
                    {item.category}
                  </span>
                </td>
                <td className="price-cell">
                  <div className="price-info">
                    <span className="price">{item.price}</span>
                    {item.cost && <span className="cost">{item.cost}</span>}
                  </div>
                </td>
                <td>
                  <div className="prep-time">
                    <span className="time-icon">⏱️</span>
                    {item.prepTime}
                  </div>
                </td>
                <td>
                  <div className="status-controls">
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={item.status}
                        readOnly
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    {item.lowStock && (
                      <button className="stock-warning">Estoque</button>
                    )}
                  </div>
                </td>
                <td>
                  <div className="orders-info">
                    <span className="orders-count">{item.orders}</span>
                    {item.isPopular && (
                      <span className="popular-badge">
                        <span className="popular-icon">📈</span>
                        Popular
                      </span>
                    )}
                  </div>
                </td>
                <td>{item.lastUpdated}</td>
                <td>
                  <button className="view-btn">👁️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
