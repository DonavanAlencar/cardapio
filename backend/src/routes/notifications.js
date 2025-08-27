const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Lista notificações simples derivadas do banco (exemplos):
// - Pedidos abertos
// - Tickets de cozinha pendentes
// - Reservas futuras do dia
router.get('/', auth(), async (req, res) => {
  try {
    const branchId = req.user.branch_id;
    const {
      type, // order|kitchen|reservation
      status, // status do domínio (ex: open, ready, pending, in_progress, booked)
      color, // green|orange|blue|red|purple
      startDate, // ISO date/datetime
      endDate,   // ISO date/datetime
      q,         // busca textual no title
      limit = 50 // limite de itens agregados
    } = req.query;

    // Pedidos em aberto por filial do usuário (via tables.branch_id)
    const [openOrders] = await pool.query(
      `SELECT o.id, o.status, o.created_at
       FROM orders o
       LEFT JOIN tables t ON t.id = o.table_id
       WHERE o.status IN ('open','in_preparation','ready')
         AND (t.branch_id = ? OR t.branch_id IS NULL)
         ${startDate ? 'AND o.created_at >= ?' : ''}
         ${endDate ? 'AND o.created_at <= ?' : ''}
       ORDER BY o.created_at DESC
       LIMIT 200`,
      [branchId, ...(startDate ? [startDate] : []), ...(endDate ? [endDate] : [])]
    );

    // Tickets de cozinha pendentes
    const [pendingTickets] = await pool.query(
      `SELECT kt.id, kt.status, kt.created_at
       FROM kitchen_tickets kt
       WHERE kt.status IN ('pending','in_progress')
         ${startDate ? 'AND kt.created_at >= ?' : ''}
         ${endDate ? 'AND kt.created_at <= ?' : ''}
       ORDER BY kt.created_at DESC
       LIMIT 200`,
      [...(startDate ? [startDate] : []), ...(endDate ? [endDate] : [])]
    );

    // Reservas futuras próximas 24h
    const [upcomingReservations] = await pool.query(
      `SELECT tr.id, tr.reservation_time, tr.status
       FROM table_reservations tr
       WHERE 1=1
         ${startDate ? 'AND tr.reservation_time >= ?' : ''}
         ${endDate ? 'AND tr.reservation_time <= ?' : ''}
       ORDER BY tr.reservation_time ASC
       LIMIT 200`,
      [...(startDate ? [startDate] : []), ...(endDate ? [endDate] : [])]
    );

    const items = [];

    openOrders.forEach(o => items.push({
      type: 'order',
      id: o.id,
      title: `Pedido #${o.id} ${o.status}`,
      date: o.created_at,
      color: o.status === 'ready' ? 'green' : o.status === 'in_preparation' ? 'orange' : 'blue'
    }));

    pendingTickets.forEach(t => items.push({
      type: 'kitchen',
      id: t.id,
      title: `Ticket Cozinha #${t.id} ${t.status}`,
      date: t.created_at,
      color: t.status === 'in_progress' ? 'orange' : 'red'
    }));

    upcomingReservations.forEach(r => items.push({
      type: 'reservation',
      id: r.id,
      title: `Reserva ${r.status} #${r.id}`,
      date: r.reservation_time,
      color: 'purple'
    }));

    // Filtros em memória
    let filtered = items;
    if (type) {
      const arrType = Array.isArray(type) ? type : String(type).split(',');
      filtered = filtered.filter(i => arrType.includes(i.type));
    }
    if (status) {
      const arrStatus = Array.isArray(status) ? status : String(status).split(',');
      filtered = filtered.filter(i => arrStatus.some(s => i.title.toLowerCase().includes(s.toLowerCase())));
    }
    if (color) {
      const arrColor = Array.isArray(color) ? color : String(color).split(',');
      filtered = filtered.filter(i => arrColor.includes(i.color));
    }
    if (q) {
      const needle = String(q).toLowerCase();
      filtered = filtered.filter(i => i.title.toLowerCase().includes(needle));
    }

    // Ordenar por data desc
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      count: filtered.length,
      items: filtered.slice(0, Math.max(1, Math.min(Number(limit) || 50, 200)))
    });
  } catch (err) {
    console.error('❌ Erro ao obter notificações:', err);
    res.status(500).json({ message: 'Erro ao obter notificações' });
  }
});

// Meta endpoint para autocomplete de filtros
router.get('/meta', auth(), async (req, res) => {
  try {
    res.json({
      types: [
        { value: 'order', label: 'Pedidos' },
        { value: 'kitchen', label: 'Cozinha' },
        { value: 'reservation', label: 'Reservas' }
      ],
      colors: [
        { value: 'green', label: 'Verde' },
        { value: 'orange', label: 'Laranja' },
        { value: 'blue', label: 'Azul' },
        { value: 'red', label: 'Vermelho' },
        { value: 'purple', label: 'Roxo' }
      ],
      statuses: [
        'open','in_preparation','ready',
        'pending','in_progress',
        'booked','seated','completed','cancelled'
      ]
    });
  } catch (err) {
    console.error('❌ Erro em /notifications/meta:', err);
    res.status(500).json({ message: 'Erro ao carregar metadados' });
  }
});

module.exports = router;


