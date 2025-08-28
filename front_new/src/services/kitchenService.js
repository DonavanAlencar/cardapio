import api from './api';

class KitchenService {
  // Buscar todos os pedidos da cozinha com status e detalhes
  async getKitchenOrders(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.branch_id) params.append('branch_id', filters.branch_id);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.search) params.append('search', filters.search);
      
      const response = await api.get(`/kitchen/orders?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedidos da cozinha:', error);
      throw error;
    }
  }

  // Buscar pedidos por status específico
  async getOrdersByStatus(status) {
    try {
      const response = await api.get(`/kitchen/orders/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar pedidos com status ${status}:`, error);
      throw error;
    }
  }

  // Buscar detalhes de um pedido específico
  async getOrderDetails(orderId) {
    try {
      const response = await api.get(`/kitchen/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar detalhes do pedido ${orderId}:`, error);
      throw error;
    }
  }

  // Atualizar status de um pedido
  async updateOrderStatus(orderId, status, notes = null) {
    try {
      const response = await api.patch(`/kitchen/orders/${orderId}/status`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar status do pedido ${orderId}:`, error);
      throw error;
    }
  }

  // Atualizar status de um item específico
  async updateItemStatus(orderId, itemId, status) {
    try {
      const response = await api.patch(`/kitchen/orders/${orderId}/items/${itemId}/status`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar status do item ${itemId}:`, error);
      throw error;
    }
  }

  // Marcar pedido como pronto
  async markOrderAsReady(orderId) {
    try {
      const response = await api.patch(`/kitchen/orders/${orderId}/ready`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao marcar pedido ${orderId} como pronto:`, error);
      throw error;
    }
  }

  // Marcar pedido como entregue
  async markOrderAsDelivered(orderId) {
    try {
      const response = await api.patch(`/kitchen/orders/${orderId}/delivered`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao marcar pedido ${orderId} como entregue:`, error);
      throw error;
    }
  }

  // Adicionar observações ao pedido
  async addOrderNotes(orderId, notes) {
    try {
      const response = await api.post(`/kitchen/orders/${orderId}/notes`, {
        notes
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao adicionar observações ao pedido ${orderId}:`, error);
      throw error;
    }
  }

  // Buscar estatísticas da cozinha
  async getKitchenStats(branchId = null) {
    try {
      const params = branchId ? `?branch_id=${branchId}` : '';
      const response = await api.get(`/kitchen/stats${params}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas da cozinha:', error);
      throw error;
    }
  }

  // Buscar histórico de pedidos
  async getOrderHistory(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.status) params.append('status', filters.status);
      if (filters.branch_id) params.append('branch_id', filters.branch_id);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/kitchen/orders/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico de pedidos:', error);
      throw error;
    }
  }

  // Buscar pedidos urgentes (com prioridade alta)
  async getUrgentOrders() {
    try {
      const response = await api.get('/kitchen/orders/urgent');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pedidos urgentes:', error);
      throw error;
    }
  }

  // Buscar pedidos por mesa
  async getOrdersByTable(tableId) {
    try {
      const response = await api.get(`/kitchen/orders/table/${tableId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar pedidos da mesa ${tableId}:`, error);
      throw error;
    }
  }

  // Buscar pedidos por cliente
  async getOrdersByCustomer(customerId) {
    try {
      const response = await api.get(`/kitchen/orders/customer/${customerId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar pedidos do cliente ${customerId}:`, error);
      throw error;
    }
  }

  // Cancelar pedido
  async cancelOrder(orderId, reason) {
    try {
      const response = await api.patch(`/kitchen/orders/${orderId}/cancel`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao cancelar pedido ${orderId}:`, error);
      throw error;
    }
  }

  // Reativar pedido cancelado
  async reactivateOrder(orderId) {
    try {
      const response = await api.patch(`/kitchen/orders/${orderId}/reactivate`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao reativar pedido ${orderId}:`, error);
      throw error;
    }
  }

  // Buscar produtos com estoque baixo
  async getLowStockProducts() {
    try {
      const response = await api.get('/kitchen/stock/low');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error);
      throw error;
    }
  }

  // Buscar ingredientes com estoque baixo
  async getLowStockIngredients() {
    try {
      const response = await api.get('/kitchen/ingredients/low-stock');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ingredientes com estoque baixo:', error);
      throw error;
    }
  }
}

export default new KitchenService();
