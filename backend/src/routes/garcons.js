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

// Listar garçons com filtros avançados
router.get('/', async (req, res) => {
  try {
    const {
      q, // busca por nome ou ID
      status = [], // array de status
      turno = [], // array de turnos
      setor = [], // array de setores
      dataInicio,
      dataFim,
      page = 1,
      pageSize = 20,
      sort = 'full_name',
      sortOrder = 'ASC'
    } = req.query;

    let whereConditions = [];
    let params = [];
    let offset = (page - 1) * pageSize;

    // Busca por nome ou ID
    if (q) {
      whereConditions.push(`(e.full_name LIKE ? OR e.id LIKE ? OR u.username LIKE ?)`);
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    // Filtro por status
    if (status.length > 0 && !status.includes('todos')) {
      whereConditions.push(`e.status IN (${status.map(() => '?').join(',')})`);
      params.push(...status);
    }

    // Filtro por turno
    if (turno.length > 0 && !turno.includes('todos')) {
      whereConditions.push(`e.turno IN (${turno.map(() => '?').join(',')})`);
      params.push(...turno);
    }

    // Filtro por setor
    if (setor.length > 0 && !setor.includes('todos')) {
      whereConditions.push(`e.setor IN (${setor.map(() => '?').join(',')})`);
      params.push(...setor);
    }

    // Filtro por data
    if (dataInicio) {
      whereConditions.push(`e.created_at >= ?`);
      params.push(dataInicio);
    }
    if (dataFim) {
      whereConditions.push(`e.created_at <= ?`);
      params.push(dataFim);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query principal com métricas
    const query = `
      SELECT 
        e.id,
        e.full_name,
        e.position,
        e.status,
        e.turno,
        e.setor,
        e.commission_rate,
        e.created_at,
        u.username,
        u.email,
        u.branch_id,
        b.name as branch_name,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(CASE WHEN o.status = 'closed' THEN o.total_amount ELSE 0 END), 0) as total_sales,
        COALESCE(AVG(CASE WHEN o.status = 'closed' THEN o.total_amount ELSE NULL END), 0) as avg_ticket,
        0 as avg_rating
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN branches b ON e.branch_id = b.id
      LEFT JOIN waiter_sessions ws ON e.id = ws.employee_id
      LEFT JOIN orders o ON ws.id = o.waiter_session_id
      ${whereClause}
      GROUP BY e.id, e.full_name, e.position, e.status, e.turno, e.setor, e.commission_rate, e.created_at, u.username, u.email, u.branch_id, b.name
      ORDER BY ${sort} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(DISTINCT e.id) as total
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN branches b ON e.branch_id = b.id
      ${whereClause}
    `;

    const [rows] = await pool.query(query, [...params, parseInt(pageSize), offset]);
    const [[countResult]] = await pool.query(countQuery, params);

    // Calcular métricas por garçom
    const waitersWithMetrics = await Promise.all(rows.map(async (waiter) => {
      // Calcular pedidos/dia nos últimos 30 dias
      const [ordersResult] = await pool.query(`
        SELECT 
          COUNT(DISTINCT o.id) as orders_count,
          DATEDIFF(CURDATE(), DATE(o.created_at)) as days_ago
        FROM orders o
        JOIN waiter_sessions ws ON o.waiter_session_id = ws.id
        WHERE ws.employee_id = ? 
          AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          AND o.status = 'closed'
        GROUP BY DATE(o.created_at)
      `, [waiter.id]);

      const totalOrders30d = ordersResult.reduce((sum, row) => sum + row.orders_count, 0);
      const daysWithOrders = ordersResult.length;
      const ordersPerDay = daysWithOrders > 0 ? (totalOrders30d / daysWithOrders).toFixed(1) : '0.0';

      // Calcular vendas nos últimos 30 dias
      const [salesResult] = await pool.query(`
        SELECT COALESCE(SUM(o.total_amount), 0) as total_sales_30d
        FROM orders o
        JOIN waiter_sessions ws ON o.waiter_session_id = ws.id
        WHERE ws.employee_id = ? 
          AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          AND o.status = 'closed'
      `, [waiter.id]);

      return {
        ...waiter,
        orders_per_day: ordersPerDay,
        sales_30d: salesResult[0].total_sales_30d,
        total_orders: waiter.total_orders || 0,
        total_sales: waiter.total_sales || 0,
        avg_ticket: waiter.avg_ticket || 0,
        avg_rating: waiter.avg_rating || 0
      };
    }));

    res.json({
      data: waitersWithMetrics,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / pageSize)
      }
    });
  } catch (err) {
    console.error('Erro ao listar garçons:', err);
    res.status(500).json({ message: 'Erro interno ao listar garçons' });
  }
});

// Obter métricas gerais (KPIs)
router.get('/metrics/overview', async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    
    let dateFilter = '';
    let params = [];
    
    if (dataInicio && dataFim) {
      dateFilter = 'WHERE o.created_at BETWEEN ? AND ?';
      params = [dataInicio, dataFim];
    }

    // Total de garçons ativos
    const [[activeWaiters]] = await pool.query(`
      SELECT COUNT(DISTINCT e.id) as total_active
      FROM employees e
      WHERE e.status = 'ativo'
    `);

    // Média de pedidos por dia por garçom
    const [[avgOrdersPerDay]] = await pool.query(`
      SELECT 
        COALESCE(
          COUNT(DISTINCT o.id) / 
          GREATEST(COUNT(DISTINCT DATE(o.created_at)), 1) / 
          GREATEST(COUNT(DISTINCT e.id), 1), 
          0
        ) as avg_orders_per_day
      FROM employees e
      LEFT JOIN waiter_sessions ws ON e.id = ws.employee_id
      LEFT JOIN orders o ON ws.id = o.waiter_session_id
      ${dateFilter}
      AND e.status = 'ativo'
      AND o.status = 'closed'
    `, params);

    // Maior faturamento nos últimos 30 dias
    const [[topRevenue]] = await pool.query(`
      SELECT 
        e.full_name,
        COALESCE(SUM(o.total_amount), 0) as total_revenue
      FROM employees e
      LEFT JOIN waiter_sessions ws ON e.id = ws.employee_id
      LEFT JOIN orders o ON ws.id = o.waiter_session_id
      WHERE e.status = 'ativo'
        AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND o.status = 'closed'
      GROUP BY e.id, e.full_name
      ORDER BY total_revenue DESC
      LIMIT 1
    `);

    res.json({
      total_ativos: activeWaiters.total_active,
      media_pedidos_dia: parseFloat(avgOrdersPerDay.avg_orders_per_day).toFixed(1),
      maior_faturamento: {
        nome: topRevenue?.full_name || 'N/A',
        valor: topRevenue?.total_revenue || 0
      }
    });
  } catch (err) {
    console.error('Erro ao obter métricas:', err);
    res.status(500).json({ message: 'Erro interno ao obter métricas' });
  }
});

// Obter detalhes de um garçom específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [waiters] = await pool.query(`
      SELECT 
        e.*,
        u.username,
        u.email,
        b.name as branch_name
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN branches b ON e.branch_id = b.id
      WHERE e.id = ?
    `, [id]);

    if (waiters.length === 0) {
      return res.status(404).json({ message: 'Garçom não encontrado' });
    }

    const waiter = waiters[0];

    // Buscar métricas dos últimos 30 dias
    const [metrics] = await pool.query(`
      SELECT 
        COUNT(DISTINCT o.id) as total_orders_30d,
        COALESCE(SUM(o.total_amount), 0) as total_sales_30d,
        COALESCE(AVG(o.total_amount), 0) as avg_ticket_30d
      FROM orders o
      JOIN waiter_sessions ws ON o.waiter_session_id = ws.id
      WHERE ws.employee_id = ? 
        AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND o.status = 'closed'
    `, [id]);

    // Buscar histórico de pedidos
    const [orders] = await pool.query(`
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.created_at,
        t.table_number
      FROM orders o
      JOIN waiter_sessions ws ON o.waiter_session_id = ws.id
      LEFT JOIN tables t ON o.table_id = t.id
      WHERE ws.employee_id = ?
      ORDER BY o.created_at DESC
      LIMIT 50
    `, [id]);

    res.json({
      ...waiter,
      metrics: metrics[0] || {},
      recent_orders: orders
    });
  } catch (err) {
    console.error('Erro ao obter garçom:', err);
    res.status(500).json({ message: 'Erro interno ao obter garçom' });
  }
});

// Exportar relatório
router.get('/report', async (req, res) => {
  try {
    const {
      format = 'csv',
      q,
      status = [],
      turno = [],
      setor = [],
      dataInicio,
      dataFim,
      groupBy
    } = req.query;

    let whereConditions = [];
    let params = [];

    // Aplicar mesmos filtros da listagem
    if (q) {
      whereConditions.push(`(e.full_name LIKE ? OR e.id LIKE ? OR u.username LIKE ?)`);
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (status.length > 0 && !status.includes('todos')) {
      whereConditions.push(`e.status IN (${status.map(() => '?').join(',')})`);
      params.push(...status);
    }

    if (turno.length > 0 && !turno.includes('todos')) {
      whereConditions.push(`e.turno IN (${turno.map(() => '?').join(',')})`);
      params.push(...turno);
    }

    if (setor.length > 0 && !setor.includes('todos')) {
      whereConditions.push(`e.setor IN (${setor.map(() => '?').join(',')})`);
      params.push(...setor);
    }

    if (dataInicio) {
      whereConditions.push(`e.created_at >= ?`);
      params.push(dataInicio);
    }
    if (dataFim) {
      whereConditions.push(`e.created_at <= ?`);
      params.push(dataFim);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    let query;
    let filename;

    if (groupBy === 'summary') {
      // Relatório sumário agregado
      query = `
        SELECT 
          ${groupBy === 'day' ? 'DATE(o.created_at) as periodo' : 
            groupBy === 'month' ? 'DATE_FORMAT(o.created_at, "%Y-%m") as periodo' :
            groupBy === 'turno' ? 'e.turno as periodo' :
            groupBy === 'setor' ? 'e.setor as periodo' : 'e.id as periodo'},
          COUNT(DISTINCT e.id) as total_garcons,
          COUNT(DISTINCT o.id) as total_pedidos,
          COALESCE(SUM(o.total_amount), 0) as total_vendas,
          COALESCE(AVG(o.total_amount), 0) as ticket_medio
        FROM employees e
        LEFT JOIN waiter_sessions ws ON e.id = ws.employee_id
        LEFT JOIN orders o ON ws.id = o.waiter_session_id
        ${whereClause}
        AND o.status = 'closed'
        GROUP BY ${groupBy === 'day' ? 'DATE(o.created_at)' : 
                  groupBy === 'month' ? 'DATE_FORMAT(o.created_at, "%Y-%m")' :
                  groupBy === 'turno' ? 'e.turno' :
                  groupBy === 'setor' ? 'e.setor' : 'e.id'}
        ORDER BY periodo
      `;
      filename = `relatorio_garcons_sumario_${groupBy}_${new Date().toISOString().split('T')[0]}`;
    } else {
      // Relatório detalhado
      query = `
        SELECT 
          e.id,
          e.full_name as nome,
          e.status,
          e.turno,
          e.setor,
          e.commission_rate as taxa_comissao,
          e.created_at as data_contratacao,
          u.email,
          u.username,
          b.name as filial,
          COUNT(DISTINCT o.id) as total_pedidos,
          COALESCE(SUM(CASE WHEN o.status = 'closed' THEN o.total_amount ELSE 0 END), 0) as total_vendas,
          COALESCE(AVG(CASE WHEN o.status = 'closed' THEN o.total_amount ELSE NULL END), 0) as ticket_medio,
          0 as avaliacao_media
        FROM employees e
        LEFT JOIN users u ON e.user_id = u.id
        LEFT JOIN branches b ON e.branch_id = b.id
        LEFT JOIN waiter_sessions ws ON e.id = ws.employee_id
        LEFT JOIN orders o ON ws.id = o.waiter_session_id
        ${whereClause}
        GROUP BY e.id, e.full_name, e.status, e.turno, e.setor, e.commission_rate, e.created_at, u.email, u.username, b.name
        ORDER BY e.full_name
      `;
      filename = `relatorio_garcons_detalhado_${new Date().toISOString().split('T')[0]}`;
    }

    const [rows] = await pool.query(query, params);

    if (format === 'csv') {
      // Gerar CSV
      const csvContent = generateCSV(rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csvContent);
    } else if (format === 'xlsx') {
      // Gerar XLSX
      const xlsxBuffer = await generateXLSX(rows, filename);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      res.send(xlsxBuffer);
    } else if (format === 'pdf') {
      // Gerar PDF
      const pdfBuffer = await generatePDF(rows, filename);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
      res.send(pdfBuffer);
    } else {
      res.status(400).json({ message: 'Formato não suportado' });
    }
  } catch (err) {
    console.error('Erro ao gerar relatório:', err);
    res.status(500).json({ message: 'Erro interno ao gerar relatório' });
  }
});

// Função para gerar CSV
function generateCSV(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

// Função para gerar XLSX
async function generateXLSX(data, filename) {
  try {
    const XLSX = require('xlsx');
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  } catch (err) {
    console.error('Erro ao gerar XLSX:', err);
    throw new Error('Erro ao gerar arquivo XLSX');
  }
}

// Função para gerar PDF
async function generatePDF(data, filename) {
  try {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    const chunks = [];
    
    return new Promise((resolve, reject) => {
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Cabeçalho
      doc.fontSize(18).text('Relatório de Garçons', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.moveDown();
      
      if (data.length === 0) {
        doc.text('Nenhum dado encontrado');
      } else {
        // Tabela
        const headers = Object.keys(data[0]);
        const colWidth = 500 / headers.length;
        
        headers.forEach((header, i) => {
          doc.text(header, 50 + (i * colWidth), doc.y, { width: colWidth });
        });
        doc.moveDown();
        
        data.forEach(row => {
          headers.forEach((header, i) => {
            const value = row[header] || '';
            doc.text(String(value), 50 + (i * colWidth), doc.y, { width: colWidth });
          });
          doc.moveDown();
        });
      }
      
      doc.end();
    });
  } catch (err) {
    console.error('Erro ao gerar PDF:', err);
    throw new Error('Erro ao gerar arquivo PDF');
  }
}

// Criar garçom
router.post('/', async (req, res) => {
  const { username, email, password, branch_id, full_name, position, turno, setor, commission_rate } = req.body;
  if (!username || !email || !password || !branch_id || !full_name) {
    return res
      .status(400)
      .json({ message: 'Campos obrigatórios: username, email, password, branch_id, full_name' });
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

    // Inserir na tabela employees
    await conn.query(
      `INSERT INTO employees (user_id, branch_id, full_name, position, turno, setor, commission_rate, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'ativo')`,
      [userId, branch_id, full_name, position || 'Garçom', turno || 'Integral', setor || 'Salão', commission_rate || 0]
    );

    await conn.commit();
    res.status(201).json({ id: userId, username, email, branch_id, full_name });
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
  const { username, email, branch_id, password, full_name, position, turno, setor, commission_rate, status } = req.body;
  if (!username || !email || !branch_id || !full_name) {
    return res
      .status(400)
      .json({ message: 'Campos obrigatórios: username, email, branch_id, full_name' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Atualizar usuário
    let setSenha = '',
        params   = [username, email, branch_id];

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      setSenha = ', password_hash = ?';
      params.push(hash);
    }
    params.push(id);

    await conn.query(
      `UPDATE users
         SET username = ?
           , email    = ?
           , branch_id= ?
           ${setSenha}
       WHERE id = ?`,
      params
    );

    // Atualizar employee
    await conn.query(
      `UPDATE employees 
         SET full_name = ?, position = ?, turno = ?, setor = ?, commission_rate = ?, status = ?
       WHERE user_id = ?`,
      [full_name, position || 'Garçom', turno || 'Integral', setor || 'Salão', commission_rate || 0, status || 'ativo', id]
    );

    await conn.commit();
    res.json({ id, username, email, branch_id, full_name });
  } catch (err) {
    await conn.rollback();
    console.error('Erro ao atualizar garçom:', err);
    res.status(500).json({ message: 'Erro interno ao atualizar garçom' });
  } finally {
    conn.release();
  }
});

// Atualizar status do garçom
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ message: 'Status é obrigatório' });
  }

  try {
    await pool.query(
      'UPDATE employees SET status = ? WHERE user_id = ?',
      [status, id]
    );
    
    res.json({ id, status });
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    res.status(500).json({ message: 'Erro interno ao atualizar status' });
  }
});

// Deletar garçom
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM user_roles WHERE user_id = ?', [id]);
    await conn.query('DELETE FROM employees WHERE user_id = ?', [id]);
    await conn.query('DELETE FROM users WHERE id = ?', [id]);
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
