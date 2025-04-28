const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
router.use(auth('admin'));

// Listar garçons
router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT id, nome, email, role FROM usuarios WHERE role = "waiter"');
  res.json(rows);
});

// Criar garçom
router.post('/', async (req, res) => {
  const { nome, email, senha, percentual_comissao } = req.body;
  const hash = require('bcrypt').hashSync(senha, 10);
  const role = 'waiter';
  const [result] = await pool.query(
    'INSERT INTO usuarios(nome, email, senha_hash, role, percentual_comissao) VALUES (?, ?, ?, ?, ?)',
    [nome, email, hash, role, percentual_comissao]
  );
  res.status(201).json({ id: result.insertId, nome, email, role, percentual_comissao });
});

// Atualizar garçom
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, percentual_comissao } = req.body;
  await pool.query(
    'UPDATE usuarios SET nome=?, email=?, percentual_comissao=? WHERE id=? AND role="waiter"',
    [nome, email, percentual_comissao, id]
  );
  res.json({ id, nome, email, percentual_comissao });
});

// Deletar garçom
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM usuarios WHERE id = ? AND role = "waiter"', [id]);
  res.sendStatus(204);
});

module.exports = router;