import api from '../config/api';

class StockService {
  // Listar itens do estoque com filtros
  async listStockItems(params = {}) {
    try {
      const response = await api.get('/stock/items', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar itens do estoque:', error);
      throw error;
    }
  }

  // Buscar item por ID
  async getStockItemById(id) {
    try {
      const response = await api.get(`/stock/items/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar item do estoque:', error);
      throw error;
    }
  }

  // Listar movimentações de estoque
  async listStockMovements(params = {}) {
    try {
      const response = await api.get('/stock/movements', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar movimentações:', error);
      throw error;
    }
  }

  // Buscar alertas de estoque baixo
  async getLowStockAlerts() {
    try {
      const response = await api.get('/stock/alerts/low-stock');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      throw error;
    }
  }

  // Buscar estatísticas do estoque
  async getStockStats() {
    try {
      const response = await api.get('/stock/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // Buscar categorias para autocomplete
  async getStockCategories() {
    try {
      const response = await api.get('/stock/categories');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }

  // Buscar localizações para autocomplete
  async getStockLocations() {
    try {
      const response = await api.get('/stock/locations');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar localizações:', error);
      throw error;
    }
  }

  // Buscar itens para autocomplete
  async searchStockItems(query, limit = 10) {
    try {
      const response = await api.get('/stock/items', {
        params: { search: query, limit }
      });
      return response.data.items;
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      throw error;
    }
  }
}

export default new StockService();
