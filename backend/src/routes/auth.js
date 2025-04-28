// backend/src/routes/auth.js
const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');
require('dotenv').config();

const router = express.Router();

// 1) Garante que a chave JWT_SECRET exista
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: variável JWT_SECRET não está definida.');
  process.exit(1);
}

// 2) Rota de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // 2.1) Validação básica de entrada
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    // 2.2) Consulta o usuário na tabela correta e colunas ajustadas
    const [rows] = await pool.query(
      'SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const user = rows[0];

    // 2.3) Compara a senha enviada com o hash armazenado
    const senhaValida = await bcrypt.compare(password, user.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Senha incorreta.' });
    }

    // 2.4) Gera o token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // 2.5) Retorna token e dados básicos do usuário
    return res.json({
      token,
      user: {
        id:    user.id,
        nome:  user.nome,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Erro ao processar login:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;
