const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Listar tickets e itens por status (para cozinha e garçom)
router.get('/tickets', auth(), async (req, res) => {
  try {
    // Tickets com itens e status
    const [tickets] = await pool.query(
      `SELECT kt.id as ticket_id, kt.order_id, kt.status as ticket_status, kt.sent_at,
              kti.id as ticket_item_id, kti.order_item_id, kti.preparation_status, kti.prepared_at,
              oi.product_id, oi.quantity, p.name as product_name
       FROM kitchen_tickets kt
       JOIN kitchen_ticket_items kti ON kti.kitchen_ticket_id = kt.id
       JOIN order_items oi ON kti.order_item_id = oi.id
       JOIN products p ON oi.product_id = p.id
       ORDER BY kt.sent_at DESC, kti.id`);
    res.json(tickets);
  } catch (err) {
    console.error('Erro ao buscar kitchen tickets:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Atualizar status do item (pendente → preparo → pronto → entregue)
router.put('/tickets/:ticketId/items/:itemId/status', auth, async (req, res) => {
  const { ticketId, itemId } = req.params;
  const { preparation_status } = req.body; // 'pending', 'preparing', 'done', 'served'
  if (!['pending', 'preparing', 'done', 'served'].includes(preparation_status)) {
    return res.status(400).json({ message: 'Status inválido.' });
  }
  try {
    await pool.query(
      'UPDATE kitchen_ticket_items SET preparation_status = ?, prepared_at = IF(? = "done", NOW(), prepared_at) WHERE id = ? AND kitchen_ticket_id = ?',
      [preparation_status, preparation_status, itemId, ticketId]
    );
    res.json({ message: 'Status atualizado.' });
  } catch (err) {
    console.error('Erro ao atualizar status do item:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router; 