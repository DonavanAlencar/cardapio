// backend/src/routes/auth.js
const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');
require('dotenv').config();

const router = express.Router();
const debugAuth = require('debug')('app:auth');

// 1) Verifica se a secret do JWT está definida
if (!process.env.JWT_SECRET) {
  console.error('FATAL: variável JWT_SECRET não definida.');
  process.exit(1);
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // 2) Validação de entrada
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    // 3) Busca o usuário na tabela `users`
    const [rows] = await pool.query(
      `SELECT 
         a.id,
         a.username,
         a.email,
         a.branch_id,
         a.password_hash,
		     c.name role
            FROM users a
		        INNER JOIN user_roles b ON b.user_id = a.id
		        INNER JOIN roles c ON c.id = b.role_id
       WHERE email = ?`,
      [email]
    );

    // console.log(rows);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuário não encontrado.' });
    }

    const user = rows[0];

    // 4) Compara a senha com bcrypt (de forma assíncrona)
    const senhaValida = await bcrypt.compare(password, user.password_hash);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Senha incorreta.' });
    }

    // 5) Gera o token JWT incluindo os dados que quiser expor no payload
    const token = jwt.sign(
      {
        id:        user.id,
        username:  user.username,
        email:     user.email,
        branch_id: user.branch_id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // 6) Retorna o token e os dados do usuário (sem expor o hash)
    return res.json({
      token,
      user: {
        id:        user.id,
        username:  user.username,
        email:     user.email,
        branch_id: user.branch_id,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Erro no /login:', err);
    debugAuth(err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;