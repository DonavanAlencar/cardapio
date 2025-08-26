const pool = require('../config/db');

class ReservationsController {
  // Listar todas as reservas
  async listReservations(req, res) {
    try {
      const { branch_id, status, date, table_id } = req.query;
      
      let query = `
        SELECT 
          r.id,
          r.customer_id,
          r.table_id,
          r.reservation_time,
          r.duration_minutes,
          r.buffer_after_minutes,
          r.ends_at,
          r.status,
          r.created_at,
          r.updated_at,
          c.full_name as customer_name,
          c.email as customer_email,
          c.phone as customer_phone,
          t.table_number,
          t.capacity,
          b.name as branch_name
        FROM table_reservations r
        INNER JOIN customers c ON r.customer_id = c.id
        INNER JOIN tables t ON r.table_id = t.id
        INNER JOIN branches b ON t.branch_id = b.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (branch_id) {
        query += ' AND t.branch_id = ?';
        params.push(branch_id);
      }
      
      if (status) {
        query += ' AND r.status = ?';
        params.push(status);
      }
      
      if (date) {
        query += ' AND DATE(r.reservation_time) = ?';
        params.push(date);
      }
      
      if (table_id) {
        query += ' AND r.table_id = ?';
        params.push(table_id);
      }
      
      query += ' ORDER BY r.reservation_time DESC';
      
      const [reservations] = await pool.query(query, params);
      
      res.json({
        success: true,
        data: reservations,
        count: reservations.length
      });
      
    } catch (error) {
      console.error('Erro ao listar reservas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Buscar reserva por ID
  async getReservation(req, res) {
    try {
      const { id } = req.params;
      
      const [reservations] = await pool.query(`
        SELECT 
          r.*,
          c.full_name as customer_name,
          c.email as customer_email,
          c.phone as customer_phone,
          t.table_number,
          t.capacity,
          b.name as branch_name
        FROM table_reservations r
        INNER JOIN customers c ON r.customer_id = c.id
        INNER JOIN tables t ON r.table_id = t.id
        INNER JOIN branches b ON t.branch_id = b.id
        WHERE r.id = ?
      `, [id]);
      
      if (reservations.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Reserva não encontrada'
        });
      }
      
      res.json({
        success: true,
        data: reservations[0]
      });
      
    } catch (error) {
      console.error('Erro ao buscar reserva:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Criar nova reserva
  async createReservation(req, res) {
    try {
      const {
        customer_id,
        table_id,
        reservation_time,
        duration_minutes = 90,
        buffer_after_minutes = 10,
        notes
      } = req.body;
      
      // Validações básicas
      if (!customer_id || !table_id || !reservation_time) {
        return res.status(400).json({
          success: false,
          error: 'Dados obrigatórios não fornecidos',
          required: ['customer_id', 'table_id', 'reservation_time']
        });
      }
      
      // Verificar se a mesa existe e está disponível
      const [tables] = await pool.query(
        'SELECT * FROM tables WHERE id = ?',
        [table_id]
      );
      
      if (tables.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Mesa não encontrada'
        });
      }
      
      // Verificar se o cliente existe
      const [customers] = await pool.query(
        'SELECT * FROM customers WHERE id = ?',
        [customer_id]
      );
      
      if (customers.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Cliente não encontrado'
        });
      }
      
      // Calcular horário de término
      const reservationDateTime = new Date(reservation_time);
      const endsAt = new Date(reservationDateTime.getTime() + (duration_minutes * 60000));
      
      // Inserir reserva
      const [result] = await pool.query(`
        INSERT INTO table_reservations (
          customer_id, table_id, reservation_time, duration_minutes, 
          buffer_after_minutes, ends_at, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'booked', NOW(), NOW())
      `, [
        customer_id, table_id, reservation_time, duration_minutes,
        buffer_after_minutes, endsAt
      ]);
      
      // Atualizar status da mesa
      await pool.query(
        'UPDATE tables SET status = "reserved" WHERE id = ?',
        [table_id]
      );
      
      // Buscar reserva criada
      const [newReservation] = await pool.query(`
        SELECT 
          r.*,
          c.full_name as customer_name,
          c.email as customer_email,
          c.phone as customer_phone,
          t.table_number,
          t.capacity,
          b.name as branch_name
        FROM table_reservations r
        INNER JOIN customers c ON r.customer_id = c.id
        INNER JOIN tables t ON r.table_id = t.id
        INNER JOIN branches b ON t.branch_id = b.id
        WHERE r.id = ?
      `, [result.insertId]);
      
      res.status(201).json({
        success: true,
        message: 'Reserva criada com sucesso',
        data: newReservation[0]
      });
      
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      
      // Tratamento específico para conflito de horário
      if (error.code === 'ER_SIGNAL_EXCEPTION' && error.message.includes('Conflito')) {
        return res.status(409).json({
          success: false,
          error: 'Conflito de horário',
          details: 'A mesa já está reservada para este horário'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Atualizar reserva
  async updateReservation(req, res) {
    try {
      const { id } = req.params;
      const {
        customer_id,
        table_id,
        reservation_time,
        duration_minutes,
        buffer_after_minutes,
        status,
        notes
      } = req.body;
      
      // Verificar se a reserva existe
      const [existingReservation] = await pool.query(
        'SELECT * FROM table_reservations WHERE id = ?',
        [id]
      );
      
      if (existingReservation.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Reserva não encontrada'
        });
      }
      
      const currentReservation = existingReservation[0];
      
      // Preparar dados para atualização
      const updateData = {
        customer_id: customer_id || currentReservation.customer_id,
        table_id: table_id || currentReservation.table_id,
        reservation_time: reservation_time || currentReservation.reservation_time,
        duration_minutes: duration_minutes || currentReservation.duration_minutes,
        buffer_after_minutes: buffer_after_minutes || currentReservation.buffer_after_minutes,
        status: status || currentReservation.status,
        updated_at: new Date()
      };
      
      // Se mudou a mesa, atualizar status da mesa antiga
      if (table_id && table_id !== currentReservation.table_id) {
        await pool.query(
          'UPDATE tables SET status = "available" WHERE id = ?',
          [currentReservation.table_id]
        );
        
        // Atualizar status da nova mesa
        await pool.query(
          'UPDATE tables SET status = "reserved" WHERE id = ?',
          [table_id]
        );
      }
      
      // Atualizar reserva
      await pool.query(`
        UPDATE table_reservations SET
          customer_id = ?,
          table_id = ?,
          reservation_time = ?,
          duration_minutes = ?,
          buffer_after_minutes = ?,
          status = ?,
          updated_at = ?
        WHERE id = ?
      `, [
        updateData.customer_id,
        updateData.table_id,
        updateData.reservation_time,
        updateData.duration_minutes,
        updateData.buffer_after_minutes,
        updateData.status,
        updateData.updated_at,
        id
      ]);
      
      // Buscar reserva atualizada
      const [updatedReservation] = await pool.query(`
        SELECT 
          r.*,
          c.full_name as customer_name,
          c.email as customer_email,
          c.phone as customer_phone,
          t.table_number,
          t.capacity,
          b.name as branch_name
        FROM table_reservations r
        INNER JOIN customers c ON r.customer_id = c.id
        INNER JOIN tables t ON r.table_id = t.id
        INNER JOIN branches b ON t.branch_id = b.id
        WHERE r.id = ?
      `, [id]);
      
      res.json({
        success: true,
        message: 'Reserva atualizada com sucesso',
        data: updatedReservation[0]
      });
      
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error);
      
      // Tratamento específico para conflito de horário
      if (error.code === 'ER_SIGNAL_EXCEPTION' && error.message.includes('Conflito')) {
        return res.status(409).json({
          success: false,
          error: 'Conflito de horário',
          details: 'A mesa já está reservada para este horário'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Cancelar reserva
  async cancelReservation(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar se a reserva existe
      const [reservation] = await pool.query(
        'SELECT * FROM table_reservations WHERE id = ?',
        [id]
      );
      
      if (reservation.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Reserva não encontrada'
        });
      }
      
      // Atualizar status para cancelado
      await pool.query(
        'UPDATE table_reservations SET status = "cancelled", updated_at = NOW() WHERE id = ?',
        [id]
      );
      
      // Liberar a mesa se não houver outras reservas ativas
      const [activeReservations] = await pool.query(`
        SELECT COUNT(*) as count FROM table_reservations 
        WHERE table_id = ? AND status IN ('booked', 'seated')
      `, [reservation[0].table_id]);
      
      if (activeReservations[0].count === 0) {
        await pool.query(
          'UPDATE tables SET status = "available" WHERE id = ?',
          [reservation[0].table_id]
        );
      }
      
      res.json({
        success: true,
        message: 'Reserva cancelada com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Verificar disponibilidade de mesa
  async checkTableAvailability(req, res) {
    try {
      const { branch_id, reservation_time, duration_minutes = 90, table_id } = req.query;
      
      if (!branch_id || !reservation_time) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetros obrigatórios não fornecidos',
          required: ['branch_id', 'reservation_time']
        });
      }
      
      const starts = new Date(reservation_time);
      const ends = new Date(starts.getTime() + (duration_minutes * 60000));
      
      // Buscar mesas disponíveis
      let query = `
        SELECT t.*
        FROM tables t
        WHERE t.branch_id = ?
          AND t.id NOT IN (
            SELECT r.table_id
            FROM table_reservations r
            WHERE r.status IN ('booked','seated')
              AND ? < TIMESTAMPADD(MINUTE, r.buffer_after_minutes, r.ends_at)
              AND r.reservation_time < ?
          )
      `;
      
      const params = [branch_id, starts, ends];
      
      if (table_id) {
        query += ' AND t.id = ?';
        params.push(table_id);
      }
      
      const [availableTables] = await pool.query(query, params);
      
      res.json({
        success: true,
        data: {
          available_tables: availableTables,
          count: availableTables.length,
          requested_time: starts,
          requested_duration: duration_minutes,
          requested_end: ends
        }
      });
      
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Buscar reservas por cliente
  async getReservationsByCustomer(req, res) {
    try {
      const { customer_id } = req.params;
      
      const [reservations] = await pool.query(`
        SELECT 
          r.*,
          t.table_number,
          t.capacity,
          b.name as branch_name
        FROM table_reservations r
        INNER JOIN tables t ON r.table_id = t.id
        INNER JOIN branches b ON t.branch_id = b.id
        WHERE r.customer_id = ?
        ORDER BY r.reservation_time DESC
      `, [customer_id]);
      
      res.json({
        success: true,
        data: reservations,
        count: reservations.length
      });
      
    } catch (error) {
      console.error('Erro ao buscar reservas do cliente:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Estatísticas de reservas
  async getReservationStats(req, res) {
    try {
      const { branch_id, date } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (branch_id) {
        whereClause += ' AND t.branch_id = ?';
        params.push(branch_id);
      }
      
      if (date) {
        whereClause += ' AND DATE(r.reservation_time) = ?';
        params.push(date);
      }
      
      // Contar reservas por status
      const [statusStats] = await pool.query(`
        SELECT 
          r.status,
          COUNT(*) as count
        FROM table_reservations r
        INNER JOIN tables t ON r.table_id = t.id
        ${whereClause}
        GROUP BY r.status
      `, params);
      
      // Contar reservas por hora do dia
      const [hourlyStats] = await pool.query(`
        SELECT 
          HOUR(r.reservation_time) as hour,
          COUNT(*) as count
        FROM table_reservations r
        INNER JOIN tables t ON r.table_id = t.id
        ${whereClause}
        GROUP BY HOUR(r.reservation_time)
        ORDER BY hour
      `, params);
      
      // Total de reservas
      const [totalReservations] = await pool.query(`
        SELECT COUNT(*) as total
        FROM table_reservations r
        INNER JOIN tables t ON r.table_id = t.id
        ${whereClause}
      `, params);
      
      res.json({
        success: true,
        data: {
          total: totalReservations[0].total,
          by_status: statusStats,
          by_hour: hourlyStats
        }
      });
      
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }
}

module.exports = new ReservationsController();
