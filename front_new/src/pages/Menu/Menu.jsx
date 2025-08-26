import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import SearchInput from '../../components/SearchInput';
import './Menu.css';

export default function Menu() {
  const {
    products,
    loading,
    error,
    stats,
    filters,
    pagination,
    loadInitialData,
    updateFilters,
    updatePagination,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    clearFilters
  } = useProducts();

  const {
    categories,
    loadCategories
  } = useCategories();

  // Estados para modais
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
    loadCategories();
  }, [loadInitialData, loadCategories]);

  const handleSearch = useCallback((searchTerm) => {
    updateFilters({ search: searchTerm });
  }, [updateFilters]);

  const handleCategoryFilter = useCallback((categoryId) => {
    updateFilters({ category_id: categoryId });
  }, [updateFilters]);

  const handleStatusFilter = useCallback((status) => {
    updateFilters({ status });
  }, [updateFilters]);

  const handleSort = useCallback((sortBy, sortOrder) => {
    updateFilters({ sortBy, sortOrder });
  }, [updateFilters]);

  const handlePageChange = useCallback((newPage) => {
    updatePagination({ page: newPage });
  }, [updatePagination]);

  const handleProductAction = async (action, productId, data = null) => {
    try {
      switch (action) {
        case 'view':
          const product = await getProductById(productId);
          setSelectedProduct(product);
          setShowProductModal(true);
          break;
          
        case 'edit':
          const productToEdit = await getProductById(productId);
          setEditingProduct(productToEdit);
          setShowProductModal(true);
          break;
          
        case 'delete':
          if (window.confirm('Tem certeza que deseja deletar este produto?')) {
            await deleteProduct(productId);
          }
          break;
          
        case 'toggle_status':
          const currentProduct = products.find(p => p.id === productId);
          const newStatus = currentProduct.status === 'active' ? 'inactive' : 'active';
          await toggleProductStatus(productId, newStatus);
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Erro ao executar ação:', error);
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      
      setShowProductModal(false);
      setEditingProduct(null);
      setSelectedProduct(null);
      
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const getCategoryColor = (categoryName) => {
    const colors = {
      'Bebidas': '#3b82f6',
      'Comidas': '#ef4444',
      'Sobremesas': '#8b5cf6',
      'Entradas': '#10b981',
      'Pratos Principais': '#f59e0b'
    };
    return colors[categoryName] || '#6b7280';
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `R$ ${parseFloat(price).toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading && products.length === 0) {
    return (
      <div className="menu-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-page">
        <div className="error-container">
          <h2>Erro ao carregar cardápio</h2>
          <p>{error}</p>
          <button onClick={loadInitialData} className="btn-primary">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      {/* Header da Página */}
      <div className="page-header">
        <div className="page-title">
          <h1>Gestão de Cardápio</h1>
          <p>Gerencie os itens do seu cardápio</p>
        </div>
        <div className="page-actions">
          <button 
            className="btn-primary"
            onClick={() => {
              setEditingProduct(null);
              setSelectedProduct(null);
              setShowProductModal(true);
            }}
          >
            + Novo Produto
          </button>
        </div>
      </div>

      {/* Métricas Superiores */}
      <div className="top-metrics">
        <div className="metric-item">
          <span className="metric-value">{stats.total}</span>
          <span className="metric-label">Total</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{stats.active}</span>
          <span className="metric-label">Disponíveis</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{stats.withImages}</span>
          <span className="metric-label">Com Imagem</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{stats.lowStock}</span>
          <span className="metric-label">Estoque Baixo</span>
        </div>
      </div>

      {/* Abas de Filtro */}
      <div className="filter-tabs">
        <button 
          className={`tab ${filters.status === 'active' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('active')}
        >
          <span className="tab-icon">✅</span>
          Ativos
        </button>
        <button 
          className={`tab ${filters.status === 'inactive' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('inactive')}
        >
          <span className="tab-icon">❌</span>
          Inativos
        </button>
        <button 
          className={`tab ${filters.status === 'all' ? 'active' : ''}`}
          onClick={() => handleStatusFilter('all')}
        >
          <span className="tab-icon">📋</span>
          Todos
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="filters-section">
        <div className="search-filter">
          <SearchInput
            placeholder="Pesquisar por nome, descrição ou SKU..."
            onSearch={handleSearch}
            className="search-bar"
          />
          <div className="category-filters">
            <select 
              className="category-select"
              value={filters.category_id}
              onChange={(e) => handleCategoryFilter(e.target.value)}
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-info">
          <span>{products.length} de {pagination.total} itens</span>
          <div className="sort-controls">
            <select 
              value={filters.sortBy}
              onChange={(e) => handleSort(e.target.value, filters.sortOrder)}
              className="sort-select"
            >
              <option value="name">Nome</option>
              <option value="price">Preço</option>
              <option value="created_at">Data de Criação</option>
              <option value="category_name">Categoria</option>
            </select>
            <button 
              className="sort-order-btn"
              onClick={() => handleSort(filters.sortBy, filters.sortOrder === 'ASC' ? 'DESC' : 'ASC')}
            >
              {filters.sortOrder === 'ASC' ? '↑' : '↓'}
            </button>
          </div>
          <button className="clear-filters" onClick={clearFilters}>
            Limpar Filtros
          </button>
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
              <th>SKU</th>
              <th>Status</th>
              <th>Pedidos</th>
              <th>Atualizado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="item-cell">
                  <div className="item-info">
                    {product.has_image && (
                      <div className="item-thumbnail">
                        🖼️
                      </div>
                    )}
                    <div className="item-details">
                      <h4>{product.name}</h4>
                      {product.description && <p>{product.description}</p>}
                    </div>
                  </div>
                </td>
                <td>
                  <span 
                    className="category-tag"
                    style={{ backgroundColor: getCategoryColor(product.category_name) }}
                  >
                    {product.category_name}
                  </span>
                </td>
                <td className="price-cell">
                  <div className="price-info">
                    <span className="price">{formatPrice(product.price)}</span>
                  </div>
                </td>
                <td>{product.sku || 'N/A'}</td>
                <td>
                  <div className="status-controls">
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={product.status === 'active'}
                        onChange={() => handleProductAction('toggle_status', product.id)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className={`status-badge ${product.status}`}>
                      {product.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="orders-info">
                    <span className="orders-count">{product.total_orders || 0}</span>
                  </div>
                </td>
                <td>{formatDate(product.updated_at)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => handleProductAction('view', product.id)}
                      title="Visualizar"
                    >
                      👁️
                    </button>
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => handleProductAction('edit', product.id)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleProductAction('delete', product.id)}
                      title="Deletar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-btn"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              ← Anterior
            </button>
            
            <div className="pagination-info">
              Página {pagination.page} de {pagination.totalPages}
            </div>
            
            <button 
              className="pagination-btn"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Próxima →
            </button>
          </div>
        )}
      </div>

      {/* Modal de Produto */}
      {showProductModal && (
        <ProductModal
          product={editingProduct || selectedProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
            setSelectedProduct(null);
          }}
          isEditing={!!editingProduct}
        />
      )}
    </div>
  );
}

// Componente Modal de Produto (simplificado)
function ProductModal({ product, categories, onSave, onClose, isEditing }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    sku: product?.sku || '',
    category_id: product?.category_id || '',
    price: product?.price || '',
    status: product?.status || 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{isEditing ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              />
            </div>
            
            <div className="form-group">
              <label>Preço</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Categoria *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
