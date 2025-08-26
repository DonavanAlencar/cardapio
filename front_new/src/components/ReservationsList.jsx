import React, { useState, useEffect } from 'react';
import './ReservationsList.css';
import reservationsService from '../services/reservationsService';
import ReservationModal from './ReservationModal';

export default function ReservationsList({ 
  branchId = 1, 
  refreshTrigger = 0,
  onRefresh 
}) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // Buscar reservas
  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { branch_id: branchId };
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      if (filterDate) {
        params.date = filterDate;
      }
      
      const response = await reservationsService.listReservations(params);
      setReservations(response.data || []);
    } catch (err) {
      setError('Erro ao carregar reservas');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para buscar reservas
  useEffect(() => {
    fetchReservations();
  }, [branchId, filterStatus, filterDate, refreshTrigger]);

  // Abrir modal para criar nova reserva
  const handleCreateReservation = () => {
    setEditingReservation(null);
    setShowModal(true);
  };

  // Abrir modal para editar reserva
  const handleEditReservation = (reservation) => {
    setEditingReservation(reservation);
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReservation(null);
  };

  // Reserva criada/atualizada com sucesso
  const handleReservationSuccess = () => {
    fetchReservations();
    if (onRefresh) {
      onRefresh();
    }
  };

  // Cancelar reserva
  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return;
    }

    try {
      await reservationsService.cancelReservation(reservationId);
      fetchReservations();
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Erro ao cancelar reserva:', err);
      alert('Erro ao cancelar reserva');
    }
  };

  // Formatar data e hora
  const formatDateTime = (dateTimeString) => {
    return reservationsService.formatReservationDateTime(dateTimeString);
  };

  // Formatar duração
  const formatDuration = (minutes) => {
    return reservationsService.formatDuration(minutes);
  };

  // Mapear status
  const mapStatus = (status) => {
    return reservationsService.mapReservationStatus(status);
  };

  // Mapear cor do status
  const mapStatusColor = (status) => {
    return reservationsService.mapReservationStatusColor(status);
  };

  // Loading state
  if (loading) {
    return (
      <div className="reservations-list">
        <div className="reservations-header">
          <h3>Reservas</h3>
          <button 
            className="btn btn-primary"
            onClick={handleCreateReservation}
          >
            + Nova Reserva
          </button>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando reservas...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="reservations-list">
        <div className="reservations-header">
          <h3>Reservas</h3>
          <button 
            className="btn btn-primary"
            onClick={handleCreateReservation}
          >
            + Nova Reserva
          </button>
        </div>
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={fetchReservations} className="retry-button">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reservations-list">
      <div className="reservations-header">
        <h3>Reservas</h3>
        <button 
          className="btn btn-primary"
          onClick={handleCreateReservation}
        >
          + Nova Reserva
        </button>
      </div>

      {/* Filtros */}
      <div className="reservations-filters">
        <div className="filter-group">
          <label htmlFor="filterStatus">Status:</label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="booked">Reservada</option>
            <option value="seated">Ocupada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filterDate">Data:</label>
          <input
            type="date"
            id="filterDate"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <button 
          className="btn btn-secondary"
          onClick={() => {
            setFilterStatus('all');
            setFilterDate('');
          }}
        >
          Limpar Filtros
        </button>
      </div>

      {/* Lista de reservas */}
      <div className="reservations-content">
        {reservations.length === 0 ? (
          <div className="no-reservations">
            <p>Nenhuma reserva encontrada</p>
            {filterStatus !== 'all' || filterDate ? (
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setFilterStatus('all');
                  setFilterDate('');
                }}
              >
                Ver todas as reservas
              </button>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={handleCreateReservation}
              >
                Criar primeira reserva
              </button>
            )}
          </div>
        ) : (
          <div className="reservations-grid">
            {reservations.map((reservation) => (
              <div 
                key={reservation.id} 
                className="reservation-card"
                style={{ borderLeftColor: mapStatusColor(reservation.status) }}
              >
                <div className="reservation-header">
                  <div className="reservation-info">
                    <h4>Mesa {reservation.table_number}</h4>
                    <span 
                      className="reservation-status"
                      style={{ backgroundColor: mapStatusColor(reservation.status) }}
                    >
                      {mapStatus(reservation.status)}
                    </span>
                  </div>
                  <div className="reservation-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEditReservation(reservation)}
                      title="Editar reserva"
                    >
                      ✏️
                    </button>
                    {reservation.status === 'booked' && (
                      <button
                        className="btn-icon"
                        onClick={() => handleCancelReservation(reservation.id)}
                        title="Cancelar reserva"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                </div>

                <div className="reservation-details">
                  <div className="detail-row">
                    <span className="detail-label">Cliente:</span>
                    <span className="detail-value">{reservation.customer_name}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Data/Hora:</span>
                    <span className="detail-value">{formatDateTime(reservation.reservation_time)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Duração:</span>
                    <span className="detail-value">{formatDuration(reservation.duration_minutes)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Capacidade:</span>
                    <span className="detail-value">{reservation.capacity} pessoas</span>
                  </div>
                  
                  {reservation.customer_phone && (
                    <div className="detail-row">
                      <span className="detail-label">Telefone:</span>
                      <span className="detail-value">{reservation.customer_phone}</span>
                    </div>
                  )}
                  
                  {reservation.customer_email && (
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{reservation.customer_email}</span>
                    </div>
                  )}
                  
                  {reservation.notes && (
                    <div className="detail-row">
                      <span className="detail-label">Observações:</span>
                      <span className="detail-value notes">{reservation.notes}</span>
                    </div>
                  )}
                </div>

                <div className="reservation-footer">
                  <small>
                    Criada em: {formatDateTime(reservation.created_at)}
                  </small>
                  {reservation.updated_at !== reservation.created_at && (
                    <small>
                      Atualizada em: {formatDateTime(reservation.updated_at)}
                    </small>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de reserva */}
      <ReservationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={handleReservationSuccess}
        reservation={editingReservation}
        branchId={branchId}
      />
    </div>
  );
}
