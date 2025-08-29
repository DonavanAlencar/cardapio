const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Cache simples para mesas (expira em 30 segundos)
let tablesCache = new Map();
const CACHE_TTL = 30 * 1000; // 30 segundos

// Função para limpar cache expirado
const cleanupExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of tablesCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      tablesCache.delete(key);
    }
  }
};

// Limpar cache expirado a cada minuto
setInterval(cleanupExpiredCache, 60 * 1000);

// Middleware para verificar se o usuário é admin ou gerente
const authorizeAdminOrManager = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'gerente') {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para gerenciar mesas.' });
  }
  next();
};

// Rota de teste simples (sem autenticação) para diagnóstico
router.get('/test', async (req, res) => {
  console.log('🧪 [TABLES] Rota de teste chamada');
  
  try {
    const startTime = Date.now();
    
    // Query simples para testar conexão
    const [result] = await pool.query('SELECT 1 as test, NOW() as timestamp');
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    
    console.log(`✅ [TABLES] Teste executado em ${executionTime}ms`);
    
    res.json({
      success: true,
      message: 'Rota de teste funcionando',
      execution_time: executionTime,
      result: result[0]
    });
    
  } catch (err) {
    console.error('❌ [TABLES] Erro no teste:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Rota de teste para verificar dados do banco
router.get('/debug', async (req, res) => {
  console.log('🔍 [TABLES] Rota de debug chamada');
  
  try {
    // Query para verificar todas as mesas no banco
    const [allTables] = await pool.query('SELECT id, branch_id, table_number, capacity, status FROM tables ORDER BY id');
    
    console.log('🔍 [TABLES] Todas as mesas no banco:', allTables);
    console.log('🔍 [TABLES] Total de mesas no banco:', allTables.length);
    console.log('🔍 [TABLES] IDs das mesas:', allTables.map(t => t.id));
    
    res.json({
      success: true,
      total_tables: allTables.length,
      tables: allTables,
      message: 'Debug das mesas no banco'
    });
    
  } catch (err) {
    console.error('❌ [TABLES] Erro no debug:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Rota para listar todas as mesas
router.get('/', auth, async (req, res) => {
  console.log('🔍 [TABLES] GET /api/tables chamado', { 
    user: req.user,
    timestamp: new Date().toISOString()
  });
  
  try {
    const branch_id = req.user.branch_id;
    const cacheKey = `tables_${branch_id}`;
    
    // Verificar cache primeiro
    if (tablesCache.has(cacheKey)) {
      const cached = tablesCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('✅ [TABLES] Dados retornados do cache');
        return res.json(cached.data);
      }
    }
    
    console.log('🔍 [TABLES] Executando query SQL para listar tables', { 
      branch_id: branch_id,
      user_id: req.user.id,
      user_role: req.user.role
    });
    
    const startTime = Date.now();
    
    // Filtrar mesas pela branch_id do usuário logado
    const [rows] = await pool.query('SELECT * FROM tables WHERE branch_id = ? ORDER BY table_number', [branch_id]);
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    
    console.log(`✅ [TABLES] Query executada com sucesso em ${executionTime}ms`, {
      branch_id: branch_id,
      rows_returned: rows.length,
      execution_time: executionTime
    });
    
    console.log('🔍 [TABLES] Dados retornados:', rows);
    console.log('🔍 [TABLES] IDs das mesas:', rows.map(r => r.id));
    
    // Armazenar no cache
    tablesCache.set(cacheKey, {
      data: rows,
      timestamp: Date.now()
    });
    
    res.json(rows);
    
  } catch (err) {
    console.error('❌ [TABLES] Erro ao buscar mesas:', {
      error: err.message,
      stack: err.stack,
      user: req.user,
      timestamp: new Date().toISOString()
    });
    
    // Retornar erro em vez de dados mockados
    res.status(500).json({ 
      message: 'Erro interno do servidor ao buscar mesas.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
    });
  }
});



// Rota para criar uma nova mesa (apenas admin/gerente)
router.post('/', auth, authorizeAdminOrManager, async (req, res) => {
  console.log('POST /api/tables chamado', { user: req.user, body: req.body });
  const { table_number, capacity, status } = req.body;
  const branch_id = req.user.branch_id; // Associar à branch do usuário logado

  if (!table_number || !capacity) {
    console.warn('POST /api/tables faltando campos obrigatórios', { table_number, capacity });
    return res.status(400).json({ message: 'Número da mesa e capacidade são obrigatórios.' });
  }
  try {
    console.log('Executando query SQL para inserir mesa', { branch_id, table_number, capacity, status });
    const [result] = await pool.query(
      'INSERT INTO tables (branch_id, table_number, capacity, status) VALUES (?, ?, ?, ?)',
      [branch_id, table_number, capacity, status || 'available']
    );
    
    // Invalidar cache
    const cacheKey = `tables_${branch_id}`;
    tablesCache.delete(cacheKey);
    console.log('🗑️ [TABLES] Cache invalidado após criação de mesa');
    
    res.status(201).json({ id: result.insertId, branch_id, table_number, capacity, status: status || 'available' });
  } catch (err) {
    console.error('Erro ao criar mesa:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para atualizar uma mesa (apenas admin/gerente)
router.put('/:id', auth, authorizeAdminOrManager, async (req, res) => {
  console.log('PUT /api/tables/:id chamado', { user: req.user, body: req.body, params: req.params });
  const { id } = req.params;
  const { table_number, capacity, status } = req.body;
  const branch_id = req.user.branch_id; // Garantir que a mesa pertence à branch do usuário

  if (!table_number || !capacity) {
    console.warn('PUT /api/tables/:id faltando campos obrigatórios', { table_number, capacity });
    return res.status(400).json({ message: 'Número da mesa e capacidade são obrigatórios.' });
  }
  try {
    console.log('Executando query SQL para atualizar mesa', { id, branch_id, table_number, capacity, status });
    const [result] = await pool.query(
      'UPDATE tables SET table_number = ?, capacity = ?, status = ? WHERE id = ? AND branch_id = ?',
      [table_number, capacity, status || 'available', id, branch_id]
    );
    if (result.affectedRows === 0) {
      console.warn('PUT /api/tables/:id mesa não encontrada ou não pertence à filial', { id, branch_id });
      return res.status(404).json({ message: 'Mesa não encontrada ou não pertence à sua filial.' });
    }
    
    // Invalidar cache
    const cacheKey = `tables_${branch_id}`;
    tablesCache.delete(cacheKey);
    console.log('🗑️ [TABLES] Cache invalidado após atualização de mesa');
    
    res.json({ id, branch_id, table_number, capacity, status: status || 'available' });
  } catch (err) {
    console.error('Erro ao atualizar mesa:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para deletar uma mesa (apenas admin/gerente)
router.delete('/:id', auth, authorizeAdminOrManager, async (req, res) => {
  console.log('DELETE /api/tables/:id chamado', { user: req.user, params: req.params });
  const { id } = req.params;
  const branch_id = req.user.branch_id; // Garantir que a mesa pertence à branch do usuário

  try {
    console.log('Executando query SQL para deletar mesa', { id, branch_id });
    const [result] = await pool.query('DELETE FROM tables WHERE id = ? AND branch_id = ?', [id, branch_id]);
    if (result.affectedRows === 0) {
      console.warn('DELETE /api/tables/:id mesa não encontrada ou não pertence à filial', { id, branch_id });
      return res.status(404).json({ message: 'Mesa não encontrada ou não pertence à sua filial.' });
    }
    
    // Invalidar cache
    const cacheKey = `tables_${branch_id}`;
    tablesCache.delete(cacheKey);
    console.log('🗑️ [TABLES] Cache invalidado após exclusão de mesa');
    
    res.status(204).send(); // No Content
  } catch (err) {
    console.error('Erro ao deletar mesa:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;
