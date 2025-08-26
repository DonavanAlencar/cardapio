import api from './api';
import { API_CONFIG } from '../config/apiConfig';

class ReservationsService {
  // Listar todas as reservas
  async listReservations(params = {}) {
    try {
      const response = await api.get(API_CONFIG.RESERVATIONS.LIST, { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar reservas:', error);
      throw error;
    }
  }

  // Buscar reserva por ID
  async getReservation(id) {
    try {
      const response = await api.get(API_CONFIG.RESERVATIONS.GET.replace(':id', id));
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar reserva:', error);
      throw error;
    }
  }

  // Criar nova reserva
  async createReservation(reservationData) {
    try {
      const response = await api.post(API_CONFIG.RESERVATIONS.CREATE, reservationData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      throw error;
    }
  }

  // Atualizar reserva
  async updateReservation(id, reservationData) {
    try {
      const response = await api.put(API_CONFIG.RESERVATIONS.UPDATE.replace(':id', id), reservationData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error);
      throw error;
    }
  }

  // Cancelar reserva
  async cancelReservation(id) {
    try {
      const response = await api.delete(API_CONFIG.RESERVATIONS.DELETE.replace(':id', id));
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      throw error;
    }
  }

  // Verificar disponibilidade de mesa
  async checkTableAvailability(branchId, reservationTime, durationMinutes = 90, tableId = null) {
    try {
      const params = {
        branch_id: branchId,
        reservation_time: reservationTime,
        duration_minutes: durationMinutes
      };
      
      if (tableId) {
        params.table_id = tableId;
      }
      
      const response = await api.get(API_CONFIG.RESERVATIONS.AVAILABILITY, { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      throw error;
    }
  }

  // Buscar reservas por cliente
  async getReservationsByCustomer(customerId) {
    try {
      const response = await api.get(API_CONFIG.RESERVATIONS.BY_CUSTOMER.replace(':customer_id', customerId));
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar reservas do cliente:', error);
      throw error;
    }
  }

  // Buscar estatísticas de reservas
  async getReservationStats(params = {}) {
    try {
      const response = await api.get(API_CONFIG.RESERVATIONS.STATS, { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // Formatar data e hora da reserva
  formatReservationDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Formatar duração da reserva
  formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}min`;
    }
  }

  // Mapear status da reserva para texto em português
  mapReservationStatus(status) {
    const statusMap = {
      'booked': 'Reservada',
      'seated': 'Ocupada',
      'cancelled': 'Cancelada'
    };
    return statusMap[status] || status;
  }

  // Mapear cor do status da reserva
  mapReservationStatusColor(status) {
    const colorMap = {
      'booked': '#f59e0b',    // Amarelo
      'seated': '#3b82f6',    // Azul
      'cancelled': '#ef4444'  // Vermelho
    };
    return colorMap[status] || '#6b7280'; // Cinza padrão
  }

  // Validar dados da reserva
  validateReservationData(data) {
    const errors = [];
    
    if (!data.customer_id) {
      errors.push('Cliente é obrigatório');
    }
    
    if (!data.table_id) {
      errors.push('Mesa é obrigatória');
    }
    
    if (!data.reservation_time) {
      errors.push('Data e hora da reserva é obrigatória');
    }
    
    if (data.duration_minutes && (data.duration_minutes < 30 || data.duration_minutes > 480)) {
      errors.push('Duração deve ser entre 30 e 480 minutos');
    }
    
    if (data.buffer_after_minutes && (data.buffer_after_minutes < 0 || data.buffer_after_minutes > 60)) {
      errors.push('Buffer deve ser entre 0 e 60 minutos');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Gerar horários disponíveis para reserva
  generateAvailableTimeSlots(branchId, date, durationMinutes = 90) {
    const slots = [];
    const startHour = 11; // 11:00
    const endHour = 23;   // 23:00
    const interval = 30;  // 30 minutos
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const time = new Date(date);
        time.setHours(hour, minute, 0, 0);
        
        // Verificar se o horário não é no passado
        if (time > new Date()) {
          slots.push({
            time: time.toISOString(),
            display: time.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })
          });
        }
      }
    }
    
    return slots;
  }
}

export default new ReservationsService();
