// backend/src/routes/garcons.js
const express = require('express');
const bcrypt  = require('bcrypt');
const pool    = require('../config/db');
const auth    = require('../middleware/authMiddleware');

const router = express.Router();
router.use(auth('admin')); // apenas admins podem usar essas rotas

// Helper para obter o role_id de ‘waiter’
async function getWaiterRoleId() {
  const [[role]] = await pool.query(
    'SELECT id FROM roles WHERE name = ? LIMIT 1',
    ['waiter']
  );
  if (!role) throw new Error('Role "waiter" não existe no banco');
  return role.id;
}

// Listar garçons (usuários com role = waiter)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         u.id,
         u.username,
         u.email,
         u.branch_id
       FROM users u
       INNER JOIN user_roles ur ON ur.user_id = u.id
       INNER JOIN roles r       ON r.id       = ur.role_id
       WHERE r.name = ?`,
      ['waiter']
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar garçons:', err);
    res.status(500).json({ message: 'Erro interno ao listar garçons' });
  }
});

// Criar garçom
router.post('/', async (req, res) => {
  const { username, email, password, branch_id } = req.body;
  if (!username || !email || !password || !branch_id) {
    return res.status(400).json({ message: 'Campos obrigatórios: username, email, password, branch_id' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Insere o usuário
    const hash = await bcrypt.hash(password, 10);
    const [userResult] = await conn.query(
      `INSERT INTO users (username, password_hash, email, branch_id)
       VALUES (?, ?, ?, ?)`,
      [username, hash, email, branch_id]
    );
    const userId = userResult.insertId;

    // 2) Associa o role 'waiter'
    const waiterRoleId = await getWaiterRoleId();
    await conn.query(
      `INSERT INTO user_roles (user_id, role_id)
       VALUES (?, ?)`,
      [userId, waiterRoleId]
    );

    await conn.commit();
    res.status(201).json({ id: userId, username, email, branch_id });
  } catch (err) {
    await conn.rollback();
    console.error('Erro ao criar garçom:', err);
    res.status(500).json({ message: 'Erro interno ao criar garçom' });
  } finally {
    conn.release();
  }
});

// Atualizar garçom
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, branch_id, password } = req.body;
  if (!username || !email || !branch_id) {
    return res.status(400).json({ message: 'Campos obrigatórios: username, email, branch_id' });
  }

  try {
    // Se forneceu nova senha, gera o hash; senão mantém existente
    let passwordSql = '';
    let params = [username, email, branch_id];
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      passwordSql = ', password_hash = ?';
      params.push(hash);
    }
    params.push(id);

    await pool.query(
      `UPDATE users
         SET username = ?,
             email    = ?,
             branch_id= ?
             ${passwordSql}
       WHERE id = ?`,
      params
    );

    res.json({ id, username, email, branch_id });
  } catch (err) {
    console.error('Erro ao atualizar garçom:', err);
    res.status(500).json({ message: 'Erro interno ao atualizar garçom' });
  }
});

// Deletar garçom
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Remove associação de role
    await conn.query(
      'DELETE FROM user_roles WHERE user_id = ?',
      [id]
    );
    // 2) Remove usuário
    await conn.query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    await conn.commit();
    res.sendStatus(204);
  } catch (err) {
    await conn.rollback();
    console.error('Erro ao deletar garçom:', err);
    res.status(500).json({ message: 'Erro interno ao deletar garçom' });
  } finally {
    conn.release();
  }
});

module.exports = router;