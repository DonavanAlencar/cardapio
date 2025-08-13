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

// Endpoint de teste de conectividade com banco
router.get('/test-db', async (req, res) => {
  console.log('🔍 Testando conectividade com banco de dados...');
  
  try {
    // Testa conexão simples
    const [result] = await pool.query('SELECT 1 as test');
    console.log('✅ Conexão com banco OK:', result);
    
    // Testa se a tabela users existe
    const [tables] = await pool.query('SHOW TABLES LIKE "users"');
    console.log('📋 Tabela users existe:', tables.length > 0);
    
    // Conta usuários na tabela
    const [userCount] = await pool.query('SELECT COUNT(*) as total FROM users');
    console.log('👥 Total de usuários:', userCount[0].total);
    
    res.json({
      status: 'success',
      database: 'connected',
      usersTable: tables.length > 0,
      userCount: userCount[0].total,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error('❌ Erro na conexão com banco:', err);
    res.status(500).json({
      status: 'error',
      message: 'Falha na conexão com banco de dados',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/login', async (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  console.log(`🔐 [${requestId}] Requisição de login recebida`);
  console.log(`📧 [${requestId}] Email recebido:`, req.body.email);
  console.log(`🔑 [${requestId}] Senha recebida:`, req.body.password ? '***' : 'NÃO FORNECIDA');

  const { email, password } = req.body;

  // 2) Validação de entrada
  if (!email || !password) {
    console.log(`❌ [${requestId}] Validação falhou: email ou senha ausentes`);
    return res.status(400).json({ 
      message: 'Email e senha são obrigatórios.',
      requestId,
      timestamp: new Date().toISOString()
    });
  }

  try {
    console.log(`🔍 [${requestId}] Testando conexão com banco...`);
    
    // Testa conexão com banco antes de fazer a query
    try {
      await pool.query('SELECT 1');
      console.log(`✅ [${requestId}] Conexão com banco OK`);
    } catch (dbError) {
      console.error(`❌ [${requestId}] Falha na conexão com banco:`, dbError);
      return res.status(500).json({ 
        message: 'Erro de conexão com banco de dados',
        requestId,
        error: dbError.message,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔍 [${requestId}] Buscando usuário no banco...`);
    
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

    console.log(`📊 [${requestId}] Usuários encontrados:`, rows.length);

    if (rows.length === 0) {
      console.log(`❌ [${requestId}] Usuário não encontrado para email:`, email);
      return res.status(401).json({ 
        message: 'Usuário não encontrado.',
        requestId,
        email: email,
        timestamp: new Date().toISOString()
      });
    }

    const user = rows[0];
    console.log(`👤 [${requestId}] Usuário encontrado:`, {
      id: user.id,
      username: user.username,
      email: user.email,
      branch_id: user.branch_id,
      role: user.role,
      hasPasswordHash: !!user.password_hash
    });

    // 4) Compara a senha com bcrypt (de forma assíncrona)
    console.log(`🔐 [${requestId}] Validando senha...`);
    const senhaValida = await bcrypt.compare(password, user.password_hash);
    console.log(`🔐 [${requestId}] Senha válida:`, senhaValida);
    
    if (!senhaValida) {
      console.log(`❌ [${requestId}] Senha incorreta para usuário:`, email);
      return res.status(401).json({ 
        message: 'Senha incorreta.',
        requestId,
        email: email,
        timestamp: new Date().toISOString()
      });
    }

    // 5) Gera o token JWT incluindo os dados que quiser expor no payload
    console.log(`🎫 [${requestId}] Gerando token JWT...`);
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

    console.log(`✅ [${requestId}] Login bem-sucedido para usuário:`, email);

    // 6) Retorna o token e os dados do usuário (sem expor o hash)
    return res.json({
      token,
      user: {
        id:        user.id,
        username:  user.username,
        email:     user.email,
        branch_id: user.branch_id,
        role: user.role
      },
      requestId,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error(`❌ [${requestId}] Erro no /login:`, err);
    debugAuth(err);
    return res.status(500).json({ 
      message: 'Erro interno do servidor.',
      requestId,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;