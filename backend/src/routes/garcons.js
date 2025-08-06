const express = require('express');
const bcrypt  = require('bcrypt');
const pool    = require('../config/db');
const auth    = require('../middleware/authMiddleware');

const router = express.Router();
router.use(auth('admin')); // apenas admins podem usar

// Busca o ID do role "waiter"
async function getWaiterRoleId() {
  const [[role]] = await pool.query(
    'SELECT id FROM roles WHERE name = ? LIMIT 1',
    ['waiter']
  );
  if (!role) throw new Error('Role "waiter" não existe');
  return role.id;
}

// Listar garçons
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         u.id,
         u.username,
         u.email,
         u.branch_id
       FROM users u
       JOIN user_roles ur ON ur.user_id = u.id
       JOIN roles r       ON r.id       = ur.role_id
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
    return res
      .status(400)
      .json({ message: 'Campos obrigatórios: username, email, password, branch_id' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const hash = await bcrypt.hash(password, 10);
    const [userResult] = await conn.query(
      `INSERT INTO users (username, password_hash, email, branch_id)
       VALUES (?, ?, ?, ?)`,
      [username, hash, email, branch_id]
    );
    const userId = userResult.insertId;

    const waiterRoleId = await getWaiterRoleId();
    await conn.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
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
    return res
      .status(400)
      .json({ message: 'Campos obrigatórios: username, email, branch_id' });
  }

  try {
    // monta a parte da senha só se veio no body
    let setSenha = '',
        params   = [username, email, branch_id];

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      setSenha = ', password_hash = ?';
      params.push(hash);
    }
    params.push(id);

    await pool.query(
      `UPDATE users
         SET username = ?
           , email    = ?
           , branch_id= ?
           ${setSenha}
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
    await conn.query('DELETE FROM user_roles WHERE user_id = ?', [id]);
    await conn.query('DELETE FROM users      WHERE id       = ?', [id]);
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

// Calcular comissão de um garçom específico
router.get('/:id/comissao', auth('waiter'), async (req, res) => {
  const { id } = req.params;
  
  // Verificar se o usuário está tentando acessar sua própria comissão
  // ou se é um admin
  if (req.user.role !== 'admin' && req.user.id != id) {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  
  try {
    // Garantir que a tabela de configurações existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracoes (
        id bigint unsigned NOT NULL AUTO_INCREMENT,
        percentual_comissao decimal(5,2) NOT NULL DEFAULT '10.00',
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    
    // Inserir configuração padrão se não existir
    await pool.query(`
      INSERT INTO configuracoes (id, percentual_comissao) 
      VALUES (1, 10.00) 
      ON DUPLICATE KEY UPDATE percentual_comissao = VALUES(percentual_comissao)
    `);
    
    // Primeiro, obter o percentual de comissão das configurações
    const [[config]] = await pool.query('SELECT percentual_comissao FROM configuracoes LIMIT 1');
    const percentualComissao = config.percentual_comissao;
    
    // Buscar o employee_id do garçom
    const [[employee]] = await pool.query(
      'SELECT id FROM employees WHERE user_id = ? LIMIT 1',
      [id]
    );
    
    if (!employee) {
      return res.status(404).json({ message: 'Garçom não encontrado' });
    }
    
    // Calcular comissão baseada nos pedidos fechados (status = 'closed')
    // que foram atendidos por este garçom através das waiter_sessions
    const [orders] = await pool.query(`
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.created_at
      FROM orders o
      JOIN waiter_sessions ws ON o.waiter_session_id = ws.id
      WHERE ws.employee_id = ? 
        AND o.status = 'closed'
        AND o.total_amount > 0
    `, [employee.id]);
    
    // Calcular comissão total
    const comissaoTotal = orders.reduce((total, order) => {
      return total + (order.total_amount * percentualComissao / 100);
    }, 0);
    
    res.json({ 
      comissao: comissaoTotal,
      percentual: percentualComissao,
      pedidos_contabilizados: orders.length,
      detalhes_pedidos: orders
    });
    
  } catch (err) {
    console.error('Erro ao calcular comissão:', err);
    res.status(500).json({ message: 'Erro interno ao calcular comissão' });
  }
});

module.exports = router;
