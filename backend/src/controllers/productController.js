const pool = require('../config/db');

const mapProduct = (row) => ({
  id: row.id,
  category_id: row.category_id,
  name: row.name,
  description: row.description,
  sku: row.sku,
  status: row.status,
  price: row.price !== undefined ? Number(row.price) : undefined,
  image_url: row.image_url,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

exports.listProducts = async (req, res) => {
  try {
    const { category_id, status, q } = req.query;
    const conditions = [];
    const params = [];
    if (category_id) { conditions.push('p.category_id = ?'); params.push(category_id); }
    if (status) { conditions.push('p.status = ?'); params.push(status); }
    if (q) { conditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT 
          p.*, 
          c.name AS category_name,
          (SELECT price FROM product_prices pp WHERE pp.product_id = p.id ORDER BY pp.start_date DESC, pp.id DESC LIMIT 1) AS price,
          (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 ORDER BY pi.id DESC LIMIT 1) AS image_url,
          EXISTS(SELECT 1 FROM product_images pi2 WHERE pi2.product_id = p.id) AS has_image,
          (SELECT COUNT(1) FROM order_items oi WHERE oi.product_id = p.id) AS total_orders
        FROM products p
        JOIN product_categories c ON c.id = p.category_id
        ${where}
        ORDER BY p.created_at DESC`,
      params
    );
    
    // Contar total de produtos para paginação
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM products');
    const total = countResult[0].total;
    
    res.json({
      products: rows.map(mapProduct),
      pagination: {
        total: total,
        page: 1,
        limit: 100,
        totalPages: Math.ceil(total / 100)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar produtos', error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
          p.*, 
          c.name AS category_name,
          (SELECT price FROM product_prices pp WHERE pp.product_id = p.id ORDER BY pp.start_date DESC, pp.id DESC LIMIT 1) AS price,
          (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 ORDER BY pi.id DESC LIMIT 1) AS image_url,
          EXISTS(SELECT 1 FROM product_images pi2 WHERE pi2.product_id = p.id) AS has_image,
          (SELECT COUNT(1) FROM order_items oi WHERE oi.product_id = p.id) AS total_orders
        FROM products p
        JOIN product_categories c ON c.id = p.category_id
        WHERE p.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Produto não encontrado' });
    res.json(mapProduct(rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produto', error: err.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  req.query.category_id = req.params.category_id;
  return exports.listProducts(req, res);
};

exports.searchProducts = async (req, res) => {
  req.query.q = req.query.q || '';
  return exports.listProducts(req, res);
};

exports.createProduct = async (req, res) => {
  try {
    const { category_id, name, description, sku, status = 'active', price } = req.body;
    if (!category_id || !name) return res.status(400).json({ message: 'category_id e name são obrigatórios' });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        'INSERT INTO products (category_id, name, description, sku, status) VALUES (?, ?, ?, ?, ?)',
        [category_id, name, description || null, sku || null, status]
      );

      if (price !== undefined) {
        await conn.query(
          'INSERT INTO product_prices (product_id, price, start_date) VALUES (?, ?, CURDATE())',
          [result.insertId, price]
        );
      }
      await conn.commit();
      const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
      res.status(201).json(mapProduct(rows[0]));
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar produto', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { category_id, name, description, sku, status, price } = req.body;
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Produto não encontrado' });

    await pool.query(
      'UPDATE products SET category_id = ?, name = ?, description = ?, sku = ?, status = ? WHERE id = ?',
      [category_id ?? rows[0].category_id, name ?? rows[0].name, description ?? rows[0].description, sku ?? rows[0].sku, status ?? rows[0].status, id]
    );

    if (price !== undefined) {
      await pool.query('INSERT INTO product_prices (product_id, price, start_date) VALUES (?, ?, CURDATE())', [id, price]);
    }

    const [updated] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json(mapProduct(updated[0]));
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar produto', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    // Verificar vínculos com order_items
    const [cnt] = await pool.query('SELECT COUNT(1) as c FROM order_items WHERE product_id = ?', [id]);
    if (cnt[0].c > 0) return res.status(400).json({ message: 'Não é possível excluir. Produto utilizado em pedidos.' });

    await pool.query('DELETE FROM product_images WHERE product_id = ?', [id]);
    await pool.query('DELETE FROM product_prices WHERE product_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Produto não encontrado' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir produto', error: err.message });
  }
};

exports.getProductStats = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        (SELECT COUNT(1) FROM products) AS total,
        (SELECT COUNT(1) FROM products WHERE status='active') AS active,
        (SELECT COUNT(1) FROM products WHERE status='inactive') AS inactive,
        (SELECT COUNT(1) FROM products p JOIN product_images pi ON pi.product_id = p.id) AS withImages,
        (SELECT COUNT(1) FROM products WHERE status='active') AS lowStock`);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao obter estatísticas', error: err.message });
  }
};

exports.getPopularProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, COUNT(oi.id) as ordered_times
         FROM products p
         JOIN order_items oi ON oi.product_id = p.id
        GROUP BY p.id
        ORDER BY ordered_times DESC
        LIMIT 10`);
    res.json(rows.map(mapProduct));
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar populares', error: err.message });
  }
};

exports.getLowStockProducts = async (_req, res) => {
  try {
    // Placeholder: sem tabela de estoque por produto, retorna vazio
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar baixo estoque', error: err.message });
  }
};


