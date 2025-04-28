const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
router.use(auth('waiter'));

// Abrir pedido
router.post('/', async (req, res) => {
  const { mesaId } = req.body;
  const garcomId = req.user.id;
  const [result] = await pool.query(
    'INSERT INTO pedidos(mesa_id, garcom_id, status, data_abertura) VALUES (?, ?, "aberto", NOW())',
    [mesaId, garcomId]
  );
  // Marca mesa como ocupada
  await pool.query('UPDATE mesas SET status="ocupada" WHERE id=?', [mesaId]);
  res.status(201).json({ pedidoId: result.insertId });
});

// Adicionar item
router.post('/:id/itens', async (req, res) => {
  const pedidoId = req.params.id;
  const { produtoId, quantidade } = req.body;
  // Obter preço atual
  const [[prod]] = await pool.query('SELECT preco FROM produtos WHERE id = ?', [produtoId]);
  await pool.query(
    'INSERT INTO pedido_itens(pedido_id, produto_id, quantidade, preco_unit) VALUES (?,?,?,?)',
    [pedidoId, produtoId, quantidade, prod.preco]
  );
  res.sendStatus(201);
});

// Fechar pedido
router.put('/:id/fechar', async (req, res) => {
  const pedidoId = req.params.id;
  // Calcular total
  const [[sum]] = await pool.query(
    'SELECT SUM(quantidade * preco_unit) AS total FROM pedido_itens WHERE pedido_id = ?',
    [pedidoId]
  );
  await pool.query(
    'UPDATE pedidos SET status = "fechado", data_fechamento = NOW(), total = ? WHERE id = ?',
    [sum.total, pedidoId]
  );
  // Liberar mesa
  const [[ped]] = await pool.query('SELECT mesa_id FROM pedidos WHERE id = ?', [pedidoId]);
  await pool.query('UPDATE mesas SET status="livre" WHERE id = ?', [ped.mesa_id]);
  res.json({ total: sum.total });
});

// Consulta de itens de um pedido
router.get('/:id/itens', async (req, res) => {
  const pedidoId = req.params.id;
  const [rows] = await pool.query(
    'SELECT pi.quantidade, pi.preco_unit, p.nome FROM pedido_itens pi JOIN produtos p ON pi.produto_id = p.id WHERE pi.pedido_id = ?',
    [pedidoId]
  );
  res.json(rows);
});

module.exports = router;