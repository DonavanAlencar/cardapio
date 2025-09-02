const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware de autorização para estoque
const authorizeStock = (req, res, next) => {
  const { role } = req.user;
  if (role !== 'admin' && role !== 'gerente' && role !== 'estoque') {
    return res.status(403).json({ message: 'Acesso negado: permissão insuficiente para estoque.' });
  }
  next();
};

// GET /api/stock/items - Listar itens do estoque com filtros
router.get('/items', auth(), authorizeStock, async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    categoria,
    status,
    sortBy = 'nome',
    sortOrder = 'ASC'
  } = req.query;

  const offset = (page - 1) * limit;
  
  try {
    let whereClause = 'WHERE i.ativo = 1';
    const params = [];
    
    if (search) {
      whereClause += ' AND (i.nome LIKE ? OR i.id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (status === 'low') {
      whereClause += ' AND i.quantidade_estoque <= i.quantidade_minima';
    } else if (status === 'ok') {
      whereClause += ' AND i.quantidade_estoque > i.quantidade_minima';
    }

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM ingredientes i 
      ${whereClause}
    `;
    
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    const query = `
      SELECT 
        i.id,
        i.nome as sku,
        i.nome,
        'Ingrediente' as categoria,
        i.unidade_medida as unidade,
        'Depósito Principal' as localizacao,
        i.quantidade_estoque as saldo_disponivel,
        0 as reservado,
        i.quantidade_minima as minimo,
        CASE 
          WHEN i.quantidade_estoque <= i.quantidade_minima THEN 'baixo'
          ELSE 'ok'
        END as status,
        i.ativo,
        i.created_at,
        i.updated_at
      FROM ingredientes i 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await pool.query(query, [...params, parseInt(limit), offset]);
    
    res.json({
      items: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar itens do estoque:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/stock/items/:id - Obter detalhes de um item
router.get('/items/:id', auth(), authorizeStock, async (req, res) => {
  const { id } = req.params;
  
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.id,
        i.nome as sku,
        i.nome,
        'Ingrediente' as categoria,
        i.unidade_medida as unidade,
        'Depósito Principal' as localizacao,
        i.quantidade_estoque as saldo_disponivel,
        0 as reservado,
        i.quantidade_minima as minimo,
        CASE 
          WHEN i.quantidade_estoque <= i.quantidade_minima THEN 'baixo'
          ELSE 'ok'
        END as status,
        i.ativo,
        i.created_at,
        i.updated_at
      FROM ingredientes i 
      WHERE i.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/stock/movements - Listar movimentações de estoque
router.get('/movements', auth(), authorizeStock, async (req, res) => {
  const {
    page = 1,
    limit = 20,
    itemId,
    tipo,
    dataInicial,
    dataFinal,
    sortBy = 'ocorrido_em',
    sortOrder = 'DESC'
  } = req.query;

  const offset = (page - 1) * limit;
  
  try {
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (itemId) {
      whereClause += ' AND em.ingrediente_id = ?';
      params.push(itemId);
    }
    
    if (tipo) {
      whereClause += ' AND em.tipo_movimento = ?';
      params.push(tipo);
    }
    
    if (dataInicial) {
      whereClause += ' AND em.ocorrido_em >= ?';
      params.push(dataInicial);
    }
    
    if (dataFinal) {
      whereClause += ' AND em.ocorrido_em <= ?';
      params.push(dataFinal);
    }

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM estoque_movimentos em
      JOIN ingredientes i ON em.ingrediente_id = i.id
      ${whereClause}
    `;
    
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    const query = `
      SELECT 
        em.id,
        em.ingrediente_id,
        i.nome as item_nome,
        em.tipo_movimento as tipo,
        em.quantidade,
        em.referencia as motivo,
        em.ocorrido_em as data_hora,
        'Sistema' as responsavel,
        CASE 
          WHEN em.tipo_movimento = 'ENTRADA' THEN 'entrada'
          WHEN em.tipo_movimento = 'SAIDA' THEN 'saida'
          ELSE 'ajuste'
        END as status
      FROM estoque_movimentos em
      JOIN ingredientes i ON em.ingrediente_id = i.id
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await pool.query(query, [...params, parseInt(limit), offset]);
    
    res.json({
      movements: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar movimentações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/stock/alerts/low-stock - Alertas de estoque baixo
router.get('/alerts/low-stock', auth(), authorizeStock, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.id,
        i.nome,
        i.unidade_medida,
        i.quantidade_estoque,
        i.quantidade_minima,
        CASE 
          WHEN i.quantidade_estoque = 0 THEN 'critical'
          WHEN i.quantidade_estoque <= i.quantidade_minima THEN 'high'
          ELSE 'normal'
        END as priority,
        (i.quantidade_minima - i.quantidade_estoque) as deficit
      FROM ingredientes i 
      WHERE i.ativo = 1 AND i.quantidade_estoque <= i.quantidade_minima
      ORDER BY 
        CASE 
          WHEN i.quantidade_estoque = 0 THEN 1
          WHEN i.quantidade_estoque <= i.quantidade_minima THEN 2
          ELSE 3
        END,
        deficit DESC
    `);
    
    res.json({
      alerts: rows,
      total: rows.length,
      critical: rows.filter(r => r.priority === 'critical').length,
      high: rows.filter(r => r.priority === 'high').length
    });
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/stock/stats - Estatísticas do estoque
router.get('/stats', auth(), authorizeStock, async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN quantidade_estoque <= quantidade_minima THEN 1 ELSE 0 END) as low_stock,
        SUM(CASE WHEN quantidade_estoque = 0 THEN 1 ELSE 0 END) as out_of_stock,
        SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) as active_items,
        SUM(quantidade_estoque) as total_quantity
      FROM ingredientes
    `);
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/stock/categories - Categorias para autocomplete
router.get('/categories', auth(), authorizeStock, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT 'Ingrediente' as categoria
      FROM ingredientes
      WHERE ativo = 1
      ORDER BY categoria
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/stock/locations - Localizações para autocomplete
router.get('/locations', auth(), authorizeStock, async (req, res) => {
  try {
    const locations = [
      { id: 1, nome: 'Depósito Principal', tipo: 'deposito' },
      { id: 2, nome: 'Geladeira', tipo: 'refrigerado' },
      { id: 3, nome: 'Freezer', tipo: 'congelado' },
      { id: 4, nome: 'Estante Seca', tipo: 'seco' }
    ];
    
    res.json(locations);
  } catch (error) {
    console.error('Erro ao buscar localizações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/stock/check-product/:productId - Verificar estoque de um produto específico
router.get('/check-product/:productId', auth(), async (req, res) => {
  const { productId } = req.params;
  const { quantity = 1 } = req.query;
  
  try {
    // Buscar ingredientes necessários para o produto
    const [ingredientsRows] = await pool.query(`
      SELECT 
        pi.ingrediente_id,
        pi.quantidade as required_quantity,
        i.nome as ingredient_name,
        i.quantidade_estoque as available_stock,
        i.quantidade_minima as minimum_stock
      FROM produto_ingredientes pi
      JOIN ingredientes i ON pi.ingrediente_id = i.id
      WHERE pi.product_id = ? AND i.ativo = 1
    `, [productId]);
    
    if (ingredientsRows.length === 0) {
      return res.json({
        hasStock: true,
        availableStock: 999, // Produto sem ingredientes = sempre disponível
        ingredients: [],
        message: 'Produto sem ingredientes controlados'
      });
    }
    
    let hasStock = true;
    let availableStock = Infinity;
    const ingredients = [];
    
    for (const ingredient of ingredientsRows) {
      const requiredQuantity = parseFloat(ingredient.required_quantity) * parseInt(quantity);
      const availableQuantity = parseFloat(ingredient.available_stock);
      
      ingredients.push({
        id: ingredient.ingrediente_id,
        name: ingredient.ingredient_name,
        required: requiredQuantity,
        available: availableQuantity,
        minimum: parseFloat(ingredient.minimum_stock)
      });
      
      if (availableQuantity < requiredQuantity) {
        hasStock = false;
      }
      
      // Calcular quantos produtos podem ser feitos com este ingrediente
      const maxProducts = Math.floor(availableQuantity / parseFloat(ingredient.required_quantity));
      availableStock = Math.min(availableStock, maxProducts);
    }
    
    res.json({
      hasStock,
      availableStock: availableStock === Infinity ? 999 : availableStock,
      ingredients,
      message: hasStock ? 'Produto disponível' : 'Produto sem estoque suficiente'
    });
    
  } catch (error) {
    console.error('Erro ao verificar estoque do produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// POST /api/stock/check-multiple-products - Verificar estoque de múltiplos produtos
router.post('/check-multiple-products', auth(), async (req, res) => {
  const { products } = req.body; // Array de {productId, quantity}
  
  try {
    const results = [];
    
    for (const product of products) {
      const [ingredientsRows] = await pool.query(`
        SELECT 
          pi.ingrediente_id,
          pi.quantidade as required_quantity,
          i.nome as ingredient_name,
          i.quantidade_estoque as available_stock,
          i.quantidade_minima as minimum_stock
        FROM produto_ingredientes pi
        JOIN ingredientes i ON pi.ingrediente_id = i.id
        WHERE pi.product_id = ? AND i.ativo = 1
      `, [product.productId]);
      
      if (ingredientsRows.length === 0) {
        results.push({
          productId: product.productId,
          hasStock: true,
          availableStock: 999,
          ingredients: [],
          message: 'Produto sem ingredientes controlados'
        });
        continue;
      }
      
      let hasStock = true;
      let availableStock = Infinity;
      const ingredients = [];
      
      for (const ingredient of ingredientsRows) {
        const requiredQuantity = parseFloat(ingredient.required_quantity) * parseInt(product.quantity);
        const availableQuantity = parseFloat(ingredient.available_stock);
        
        ingredients.push({
          id: ingredient.ingrediente_id,
          name: ingredient.ingredient_name,
          required: requiredQuantity,
          available: availableQuantity,
          minimum: parseFloat(ingredient.minimum_stock)
        });
        
        if (availableQuantity < requiredQuantity) {
          hasStock = false;
        }
        
        const maxProducts = Math.floor(availableQuantity / parseFloat(ingredient.required_quantity));
        availableStock = Math.min(availableStock, maxProducts);
      }
      
      results.push({
        productId: product.productId,
        hasStock,
        availableStock: availableStock === Infinity ? 999 : availableStock,
        ingredients,
        message: hasStock ? 'Produto disponível' : 'Produto sem estoque suficiente'
      });
    }
    
    res.json({ results });
    
  } catch (error) {
    console.error('Erro ao verificar estoque múltiplo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
