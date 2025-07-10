const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware para verificar se o usuário é admin ou gerente
const authorizeAdminOrManager = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'gerente') {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para gerenciar ingredientes.' });
  }
  next();
};

// Rota para listar todos os ingredientes
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ingredientes ORDER BY nome');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar ingredientes:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para criar um novo ingrediente (apenas admin/gerente)
router.post('/', auth, authorizeAdminOrManager, async (req, res) => {
  const { nome, unidade_medida, quantidade_estoque, quantidade_minima, ativo } = req.body;
  if (!nome || !unidade_medida || quantidade_estoque === undefined || quantidade_minima === undefined) {
    return res.status(400).json({ message: 'Nome, unidade de medida, quantidade em estoque e quantidade mínima são obrigatórios.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO ingredientes (nome, unidade_medida, quantidade_estoque, quantidade_minima, ativo) VALUES (?, ?, ?, ?, ?)',
      [nome, unidade_medida, quantidade_estoque, quantidade_minima, ativo === undefined ? 1 : ativo]
    );
    res.status(201).json({ id: result.insertId, nome, unidade_medida, quantidade_estoque, quantidade_minima, ativo: ativo === undefined ? 1 : ativo });
  } catch (err) {
    console.error('Erro ao criar ingrediente:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para atualizar um ingrediente (apenas admin/gerente)
router.put('/:id', auth, authorizeAdminOrManager, async (req, res) => {
  const { id } = req.params;
  const { nome, unidade_medida, quantidade_estoque, quantidade_minima, ativo } = req.body;
  if (!nome || !unidade_medida || quantidade_estoque === undefined || quantidade_minima === undefined) {
    return res.status(400).json({ message: 'Nome, unidade de medida, quantidade em estoque e quantidade mínima são obrigatórios.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE ingredientes SET nome = ?, unidade_medida = ?, quantidade_estoque = ?, quantidade_minima = ?, ativo = ? WHERE id = ?',
      [nome, unidade_medida, quantidade_estoque, quantidade_minima, ativo === undefined ? 1 : ativo, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ingrediente não encontrado.' });
    }
    res.json({ id, nome, unidade_medida, quantidade_estoque, quantidade_minima, ativo: ativo === undefined ? 1 : ativo });

    // Verificar estoque e desativar produtos se necessário
    if (quantidade_estoque <= quantidade_minima) {
      const [productsToDeactivate] = await pool.query(
        `SELECT DISTINCT pi.product_id
         FROM produto_ingredientes pi
         JOIN products p ON pi.product_id = p.id
         WHERE pi.ingrediente_id = ? AND p.status = 'active'`,
        [id]
      );

      for (const product of productsToDeactivate) {
        await pool.query(
          'UPDATE products SET status = "inactive" WHERE id = ?',
          [product.product_id]
        );
        console.log(`Produto ${product.product_id} desativado devido a baixo estoque do ingrediente ${nome}`);
      }
    }

  } catch (err) {
    console.error('Erro ao atualizar ingrediente:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para deletar um ingrediente (apenas admin/gerente)
router.delete('/:id', auth, authorizeAdminOrManager, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM ingredientes WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ingrediente não encontrado.' });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    console.error('Erro ao deletar ingrediente:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;
