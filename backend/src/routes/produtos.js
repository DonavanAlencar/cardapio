const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Listar produtos (público)
router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT id, nome, descricao, preco, categoria, imagem_url FROM produtos');
  res.json(rows);
});

// Operações protegidas (admin)
router.use(auth('admin'));

// Criar produto
router.post('/', async (req, res) => {
  const { nome, descricao, preco, categoria, imagem_url } = req.body;
  const [result] = await pool.query(
    'INSERT INTO produtos(nome, descricao, preco, categoria, imagem_url) VALUES (?,?,?,?,?)',
    [nome, descricao, preco, categoria, imagem_url]
  );
  res.status(201).json({ id: result.insertId, nome, descricao, preco, categoria, imagem_url });
});

// Atualizar produto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, categoria, imagem_url } = req.body;
  await pool.query(
    'UPDATE produtos SET nome=?, descricao=?, preco=?, categoria=?, imagem_url=? WHERE id=?',
    [nome, descricao, preco, categoria, imagem_url, id]
  );
  res.json({ id, nome, descricao, preco, categoria, imagem_url });
});

// Deletar produto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM produtos WHERE id = ?', [id]);
  res.sendStatus(204);
});

module.exports = router;