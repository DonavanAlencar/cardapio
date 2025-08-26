const express = require('express');
const router = express.Router();
const reservationsController = require('../controllers/reservationsController');
const authenticateToken = require('../middleware/authMiddleware');

// Middleware de autenticação (reutilizando o existente)
const requireAuth = authenticateToken();

// ===== ROTAS DE RESERVAS =====

// GET /api/reservations - Listar todas as reservas
router.get('/', requireAuth, reservationsController.listReservations);

// GET /api/reservations/:id - Buscar reserva por ID
router.get('/:id', requireAuth, reservationsController.getReservation);

// POST /api/reservations - Criar nova reserva
router.post('/', requireAuth, reservationsController.createReservation);

// PUT /api/reservations/:id - Atualizar reserva
router.put('/:id', requireAuth, reservationsController.updateReservation);

// DELETE /api/reservations/:id - Cancelar reserva
router.delete('/:id', requireAuth, reservationsController.cancelReservation);

// ===== FUNCIONALIDADES ESPECIAIS =====

// GET /api/reservations/availability/check - Verificar disponibilidade de mesa
router.get('/availability/check', requireAuth, reservationsController.checkTableAvailability);

// GET /api/reservations/customer/:customer_id - Buscar reservas por cliente
router.get('/customer/:customer_id', requireAuth, reservationsController.getReservationsByCustomer);

// GET /api/reservations/stats - Estatísticas de reservas
router.get('/stats/summary', requireAuth, reservationsController.getReservationStats);

module.exports = router;
