import React, { useState, useEffect } from 'react';
import './ReservationModal.css';
import reservationsService from '../services/reservationsService';

export default function ReservationModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  reservation = null, 
  tables = [], 
  customers = [],
  branchId = 1 
}) {
  const [formData, setFormData] = useState({
    customer_id: '',
    table_id: '',
    reservation_time: '',
    duration_minutes: 90,
    buffer_after_minutes: 10,
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableTables, setAvailableTables] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  // Inicializar formulário
  useEffect(() => {
    if (reservation) {
      setFormData({
        customer_id: reservation.customer_id || '',
        table_id: reservation.table_id || '',
        reservation_time: reservation.reservation_time ? 
          new Date(reservation.reservation_time).toISOString().slice(0, 16) : '',
        duration_minutes: reservation.duration_minutes || 90,
        buffer_after_minutes: reservation.buffer_after_minutes || 10,
        notes: reservation.notes || ''
      });
      setSelectedDate(reservation.reservation_time ? 
        new Date(reservation.reservation_time).toISOString().split('T')[0] : '');
    } else {
      setFormData({
        customer_id: '',
        table_id: '',
        reservation_time: '',
        duration_minutes: 90,
        buffer_after_minutes: 10,
        notes: ''
      });
      setSelectedDate(new Date().toISOString().split('T')[0]);
    }
  }, [reservation]);

  // Gerar horários disponíveis quando a data mudar
  useEffect(() => {
    if (selectedDate) {
      const slots = reservationsService.generateAvailableTimeSlots(branchId, selectedDate);
      setTimeSlots(slots);
      
      // Definir primeiro horário disponível como padrão
      if (slots.length > 0 && !formData.reservation_time) {
        setFormData(prev => ({
          ...prev,
          reservation_time: slots[0].time
        }));
      }
    }
  }, [selectedDate, branchId]);

  // Verificar disponibilidade quando mesa ou horário mudar
  useEffect(() => {
    if (formData.table_id && formData.reservation_time && selectedDate) {
      checkAvailability();
    }
  }, [formData.table_id, formData.reservation_time, selectedDate]);

  const checkAvailability = async () => {
    try {
      const availability = await reservationsService.checkTableAvailability(
        branchId,
        formData.reservation_time,
        formData.duration_minutes,
        formData.table_id
      );
      
      setAvailableTables(availability.data.available_tables);
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    
    // Atualizar horário da reserva se a data mudar
    if (timeSlots.length > 0) {
      const newDateTime = new Date(newDate + 'T' + timeSlots[0].display);
      setFormData(prev => ({
        ...prev,
        reservation_time: newDateTime.toISOString()
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customer_id) {
      newErrors.customer_id = 'Cliente é obrigatório';
    }
    
    if (!formData.table_id) {
      newErrors.table_id = 'Mesa é obrigatória';
    }
    
    if (!formData.reservation_time) {
      newErrors.reservation_time = 'Data e hora da reserva é obrigatória';
    }
    
    if (formData.duration_minutes < 30 || formData.duration_minutes > 480) {
      newErrors.duration_minutes = 'Duração deve ser entre 30 e 480 minutos';
    }
    
    if (formData.buffer_after_minutes < 0 || formData.buffer_after_minutes > 60) {
      newErrors.buffer_after_minutes = 'Buffer deve ser entre 0 e 60 minutos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (reservation) {
        // Atualizar reserva existente
        await reservationsService.updateReservation(reservation.id, formData);
      } else {
        // Criar nova reserva
        await reservationsService.createReservation(formData);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      
      if (error.response?.data?.error === 'Conflito de horário') {
        setErrors({
          reservation_time: 'A mesa já está reservada para este horário'
        });
      } else {
        setErrors({
          general: error.response?.data?.error || 'Erro ao salvar reserva'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (reservation) {
      // Se for edição, perguntar se quer cancelar
      if (window.confirm('Deseja cancelar as alterações?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="reservation-modal-overlay">
      <div className="reservation-modal">
        <div className="reservation-modal-header">
          <h2>{reservation ? 'Editar Reserva' : 'Nova Reserva'}</h2>
          <button 
            className="reservation-modal-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="reservation-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="customer_id">Cliente *</label>
              <select
                id="customer_id"
                name="customer_id"
                value={formData.customer_id}
                onChange={handleInputChange}
                className={errors.customer_id ? 'error' : ''}
                required
              >
                <option value="">Selecione um cliente</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.full_name} - {customer.phone || customer.email}
                  </option>
                ))}
              </select>
              {errors.customer_id && (
                <span className="error-text">{errors.customer_id}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="table_id">Mesa *</label>
              <select
                id="table_id"
                name="table_id"
                value={formData.table_id}
                onChange={handleInputChange}
                className={errors.table_id ? 'error' : ''}
                required
              >
                <option value="">Selecione uma mesa</option>
                {tables.map(table => (
                  <option key={table.id} value={table.id}>
                    {table.table_number} - {table.capacity} pessoas
                  </option>
                ))}
              </select>
              {errors.table_id && (
                <span className="error-text">{errors.table_id}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="selectedDate">Data *</label>
              <input
                type="date"
                id="selectedDate"
                value={selectedDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reservation_time">Horário *</label>
              <select
                id="reservation_time"
                name="reservation_time"
                value={formData.reservation_time}
                onChange={handleInputChange}
                className={errors.reservation_time ? 'error' : ''}
                required
              >
                <option value="">Selecione um horário</option>
                {timeSlots.map(slot => (
                  <option key={slot.time} value={slot.time}>
                    {slot.display}
                  </option>
                ))}
              </select>
              {errors.reservation_time && (
                <span className="error-text">{errors.reservation_time}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration_minutes">Duração (minutos) *</label>
              <input
                type="number"
                id="duration_minutes"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleInputChange}
                min="30"
                max="480"
                step="30"
                className={errors.duration_minutes ? 'error' : ''}
                required
              />
              <small>Mín: 30min, Máx: 8h</small>
              {errors.duration_minutes && (
                <span className="error-text">{errors.duration_minutes}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="buffer_after_minutes">Buffer após reserva (minutos)</label>
              <input
                type="number"
                id="buffer_after_minutes"
                name="buffer_after_minutes"
                value={formData.buffer_after_minutes}
                onChange={handleInputChange}
                min="0"
                max="60"
                step="5"
                className={errors.buffer_after_minutes ? 'error' : ''}
              />
              <small>Mín: 0min, Máx: 60min</small>
              {errors.buffer_after_minutes && (
                <span className="error-text">{errors.buffer_after_minutes}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Observações</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Observações adicionais sobre a reserva..."
            />
          </div>

          {availableTables.length > 0 && (
            <div className="availability-info">
              <h4>Mesas Disponíveis:</h4>
              <div className="available-tables">
                {availableTables.map(table => (
                  <span key={table.id} className="available-table">
                    {table.table_number}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : (reservation ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
