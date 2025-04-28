const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id, nome, role, senha_hash FROM usuarios WHERE email = ?',
      [email]
    );
    if (!rows.length) return res.status(401).json({ message: 'Usuário não encontrado' });
    const user = rows[0];
    if (!bcrypt.compareSync(password, user.senha_hash)) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, nome: user.nome, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

module.exports = router;