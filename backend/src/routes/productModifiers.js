const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware para verificar se o usuário é admin ou gerente
const authorizeAdminOrManager = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'gerente') {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para gerenciar modificadores de produtos.' });
  }
  next();
};

// Rota para listar todos os modificadores de produtos
router.get('/', async (req, res) => {
  const { product_id } = req.query;
  let query = 'SELECT pm.*, i.nome as ingrediente_nome FROM produto_modificadores pm LEFT JOIN ingredientes i ON pm.ingrediente_id = i.id';
  const params = [];

  if (product_id) {
    query += ' WHERE product_id = ?';
    params.push(product_id);
  }
  query += ' ORDER BY pm.nome';

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar modificadores de produtos:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para criar um novo modificador de produto (apenas admin/gerente)
router.post('/', auth, authorizeAdminOrManager, async (req, res) => {
  const { product_id, nome, tipo, ingrediente_id, fator_consumo, ajuste_preco } = req.body;
  if (!product_id || !nome || !tipo) {
    return res.status(400).json({ message: 'ID do produto, nome e tipo do modificador são obrigatórios.' });
  }
  if (!['ADICAO', 'REMOCAO', 'SUBSTITUICAO'].includes(tipo.toUpperCase())) {
    return res.status(400).json({ message: 'Tipo de modificador inválido. Use ADICAO, REMOCAO ou SUBSTITUICAO.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO produto_modificadores (product_id, nome, tipo, ingrediente_id, fator_consumo, ajuste_preco) VALUES (?, ?, ?, ?, ?, ?)',
      [product_id, nome, tipo.toUpperCase(), ingrediente_id || null, fator_consumo || 1.0, ajuste_preco || 0.00]
    );
    res.status(201).json({ id: result.insertId, product_id, nome, tipo, ingrediente_id, fator_consumo, ajuste_preco });
  } catch (err) {
    console.error('Erro ao criar modificador de produto:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para atualizar um modificador de produto (apenas admin/gerente)
router.put('/:id', auth, authorizeAdminOrManager, async (req, res) => {
  const { id } = req.params;
  const { product_id, nome, tipo, ingrediente_id, fator_consumo, ajuste_preco } = req.body;
  if (!product_id || !nome || !tipo) {
    return res.status(400).json({ message: 'ID do produto, nome e tipo do modificador são obrigatórios.' });
  }
  if (!['ADICAO', 'REMOCAO', 'SUBSTITUICAO'].includes(tipo.toUpperCase())) {
    return res.status(400).json({ message: 'Tipo de modificador inválido. Use ADICAO, REMOCAO ou SUBSTITUICAO.' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE produto_modificadores SET product_id = ?, nome = ?, tipo = ?, ingrediente_id = ?, fator_consumo = ?, ajuste_preco = ? WHERE id = ?',
      [product_id, nome, tipo.toUpperCase(), ingrediente_id || null, fator_consumo || 1.0, ajuste_preco || 0.00, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Modificador não encontrado.' });
    }
    res.json({ id, product_id, nome, tipo, ingrediente_id, fator_consumo, ajuste_preco });
  } catch (err) {
    console.error('Erro ao atualizar modificador de produto:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para deletar um modificador de produto (apenas admin/gerente)
router.delete('/:id', auth, authorizeAdminOrManager, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM produto_modificadores WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Modificador não encontrado.' });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    console.error('Erro ao deletar modificador de produto:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;
