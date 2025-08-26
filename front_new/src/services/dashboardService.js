import api from './api';
import { API_CONFIG, getApiUrl } from '../config/apiConfig';

class DashboardService {
  // Buscar dados principais do dashboard
  async getDashboardData() {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
  }

  // Buscar dados de reservas para o dashboard
  async getReservationsData(branchId = 1) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/reservations?branch_id=${branchId}&date=${today}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados de reservas:', error);
      return { data: [] };
    }
  }

  // Buscar dados em tempo real
  async getRealTimeData() {
    try {
      const response = await api.get('/dashboard/real-time');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados em tempo real:', error);
      throw error;
    }
  }

  // Buscar reservas do dia
  async getTodayReservations() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/reservations?date=${today}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar reservas do dia:', error);
      throw error;
    }
  }

  // Verificar disponibilidade de mesa
  async checkTableAvailability(branchId, reservationTime, durationMinutes = 90) {
    try {
      const response = await api.get('/reservations/availability/check', {
        params: {
          branch_id: branchId,
          reservation_time: reservationTime,
          duration_minutes: durationMinutes
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      throw error;
    }
  }

  // Formatar valor monetário
  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Formatar percentual
  formatPercentage(value) {
    return `${parseFloat(value).toFixed(1)}%`;
  }

  // Formatar data
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Mapear status do pedido para texto em português
  mapOrderStatus(status) {
    const statusMap = {
      'open': 'Pendente',
      'in_preparation': 'Preparando',
      'ready': 'Pronto',
      'served': 'Servido',
      'closed': 'Fechado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  // Mapear status da mesa para texto em português
  mapTableStatus(status) {
    const statusMap = {
      'available': 'Disponível',
      'occupied': 'Ocupada',
      'reserved': 'Reservada'
    };
    return statusMap[status] || status;
  }

  // Mapear cor do status da mesa
  mapTableStatusColor(status) {
    const colorMap = {
      'available': '#10b981', // Verde
      'occupied': '#3b82f6',  // Azul
      'reserved': '#f59e0b'   // Amarelo
    };
    return colorMap[status] || '#6b7280'; // Cinza padrão
  }

  // Mapear cor do status do pedido
  mapOrderStatusColor(status) {
    const colorMap = {
      'open': '#ef4444',        // Vermelho
      'in_preparation': '#8b5cf6', // Roxo
      'ready': '#f59e0b',       // Amarelo
      'served': '#10b981',      // Verde
      'closed': '#6b7280',      // Cinza
      'cancelled': '#dc2626'    // Vermelho escuro
    };
    return colorMap[status] || '#6b7280';
  }
}

export default new DashboardService();
