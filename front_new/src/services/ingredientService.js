import api from '../config/api';

class IngredientService {
  // Listar todos os ingredientes
  async listIngredients(params = {}) {
    try {
      const response = await api.get('/ingredients', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar ingredientes:', error);
      throw error;
    }
  }

  // Buscar ingrediente por ID
  async getIngredientById(id) {
    try {
      const response = await api.get(`/ingredients/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ingrediente:', error);
      throw error;
    }
  }

  // Criar novo ingrediente
  async createIngredient(ingredientData) {
    try {
      const response = await api.post('/ingredients', ingredientData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar ingrediente:', error);
      throw error;
    }
  }

  // Atualizar ingrediente
  async updateIngredient(id, ingredientData) {
    try {
      const response = await api.put(`/ingredients/${id}`, ingredientData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar ingrediente:', error);
      throw error;
    }
  }

  // Deletar ingrediente
  async deleteIngredient(id) {
    try {
      await api.delete(`/ingredients/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar ingrediente:', error);
      throw error;
    }
  }

  // Buscar ingredientes (autocomplete)
  async searchIngredients(query, limit = 10) {
    try {
      const response = await api.get('/ingredients/search', {
        params: { q: query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ingredientes:', error);
      throw error;
    }
  }

  // Obter estatísticas dos ingredientes
  async getIngredientStats() {
    try {
      const response = await api.get('/ingredients/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas dos ingredientes:', error);
      throw error;
    }
  }

  // Alterar status do ingrediente
  async toggleIngredientStatus(id, ativo) {
    try {
      const response = await api.patch(`/ingredients/${id}/status`, { ativo });
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar status do ingrediente:', error);
      throw error;
    }
  }

  // Buscar ingredientes ativos
  async getActiveIngredients() {
    try {
      const response = await api.get('/ingredients', {
        params: { status: 'active' }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ingredientes ativos:', error);
      throw error;
    }
  }

  // Buscar ingredientes com estoque baixo
  async getLowStockIngredients() {
    try {
      const response = await api.get('/ingredients', {
        params: { status: 'active', stock_status: 'low' }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ingredientes com estoque baixo:', error);
      throw error;
    }
  }

  // Buscar ingredientes com estoque em alerta
  async getWarningStockIngredients() {
    try {
      const response = await api.get('/ingredients', {
        params: { status: 'active', stock_status: 'warning' }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ingredientes com estoque em alerta:', error);
      throw error;
    }
  }

  // Validar nome único do ingrediente
  async validateIngredientName(name, ingredientId = null) {
    try {
      const params = { name };
      if (ingredientId) params.exclude_id = ingredientId;
      
      const response = await api.get('/ingredients/validate-name', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao validar nome do ingrediente:', error);
      throw error;
    }
  }

  // Buscar ingredientes por termo de busca
  async searchIngredientsByTerm(term, limit = 20) {
    try {
      const response = await api.get('/ingredients/search', {
        params: { q: term, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ingredientes por termo:', error);
      throw error;
    }
  }

  // Obter ingredientes em destaque
  async getFeaturedIngredients(limit = 10) {
    try {
      const response = await api.get('/ingredients/featured', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ingredientes em destaque:', error);
      throw error;
    }
  }

  // Marcar ingrediente como destaque
  async setIngredientFeatured(ingredientId, featured = true) {
    try {
      const response = await api.patch(`/ingredients/${ingredientId}/featured`, { featured });
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar ingrediente como destaque:', error);
      throw error;
    }
  }

  // Exportar ingredientes
  async exportIngredients(format = 'csv') {
    try {
      const response = await api.get('/ingredients/export', {
        params: { format },
        responseType: 'blob'
      });
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ingredientes.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao exportar ingredientes:', error);
      throw error;
    }
  }

  // Importar ingredientes
  async importIngredients(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));
      
      const response = await api.post('/ingredients/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao importar ingredientes:', error);
      throw error;
    }
  }

  // Obter produtos que usam um ingrediente
  async getIngredientProducts(ingredientId) {
    try {
      const response = await api.get(`/ingredients/${ingredientId}/products`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos do ingrediente:', error);
      throw error;
    }
  }

  // Obter movimentos de estoque de um ingrediente
  async getIngredientStockMovements(ingredientId, limit = 50) {
    try {
      const response = await api.get(`/ingredients/${ingredientId}/stock-movements`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar movimentos de estoque:', error);
      throw error;
    }
  }

  // Criar movimento de estoque
  async createStockMovement(ingredientId, movementData) {
    try {
      const response = await api.post(`/ingredients/${ingredientId}/stock-movements`, movementData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar movimento de estoque:', error);
      throw error;
    }
  }

  // Ajustar estoque de ingrediente
  async adjustIngredientStock(ingredientId, adjustmentData) {
    try {
      const response = await api.patch(`/ingredients/${ingredientId}/stock`, adjustmentData);
      return response.data;
    } catch (error) {
      console.error('Erro ao ajustar estoque:', error);
      throw error;
    }
  }

  // Obter histórico de preços do ingrediente
  async getIngredientPriceHistory(ingredientId) {
    try {
      const response = await api.get(`/ingredients/${ingredientId}/price-history`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico de preços:', error);
      throw error;
    }
  }

  // Atualizar preço do ingrediente
  async updateIngredientPrice(ingredientId, priceData) {
    try {
      const response = await api.patch(`/ingredients/${ingredientId}/price`, priceData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar preço do ingrediente:', error);
      throw error;
    }
  }

  // Obter ingredientes por unidade de medida
  async getIngredientsByUnit(unit) {
    try {
      const response = await api.get('/ingredients', {
        params: { unidade_medida: unit, status: 'active' }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ingredientes por unidade:', error);
      throw error;
    }
  }

  // Obter unidades de medida disponíveis
  async getAvailableUnits() {
    try {
      const response = await api.get('/ingredients/units');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar unidades de medida:', error);
      throw error;
    }
  }

  // Duplicar ingrediente
  async duplicateIngredient(ingredientId, newName) {
    try {
      const response = await api.post(`/ingredients/${ingredientId}/duplicate`, {
        new_name: newName
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao duplicar ingrediente:', error);
      throw error;
    }
  }

  // Obter ingredientes por categoria (se implementado)
  async getIngredientsByCategory(categoryId) {
    try {
      const response = await api.get(`/ingredients/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ingredientes por categoria:', error);
      throw error;
    }
  }

  // Obter ingredientes com vencimento próximo
  async getIngredientsExpiringSoon(days = 30) {
    try {
      const response = await api.get('/ingredients/expiring-soon', {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ingredientes com vencimento próximo:', error);
      throw error;
    }
  }

  // Obter ingredientes mais utilizados
  async getMostUsedIngredients(limit = 20) {
    try {
      const response = await api.get('/ingredients/most-used', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ingredientes mais utilizados:', error);
      throw error;
    }
  }

  // Obter ingredientes com custo mais alto
  async getHighestCostIngredients(limit = 20) {
    try {
      const response = await api.get('/ingredients/highest-cost', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ingredientes com custo mais alto:', error);
      throw error;
    }
  }
}

export default new IngredientService();
