const pool = require('../config/db');

const mapCategory = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  display_order: row.display_order,
  is_active: row.is_active === undefined ? true : !!row.is_active,
  created_at: row.created_at,
  updated_at: row.updated_at,
  products_count: row.products_count !== undefined ? Number(row.products_count) : undefined,
});

exports.listCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT pc.*, 
              (SELECT COUNT(1) FROM products p WHERE p.category_id = pc.id) AS products_count
         FROM product_categories pc
         ORDER BY pc.display_order ASC, pc.id ASC`
    );
    res.json(rows.map(mapCategory));
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar categorias', error: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM product_categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Categoria não encontrada' });
    res.json(mapCategory(rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar categoria', error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, display_order } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Nome é obrigatório' });

    const [result] = await pool.query(
      'INSERT INTO product_categories (name, description, display_order) VALUES (?, ?, ?)',
      [name.trim(), description || null, Number(display_order) || 0]
    );

    const [rows] = await pool.query('SELECT * FROM product_categories WHERE id = ?', [result.insertId]);
    res.status(201).json(mapCategory(rows[0]));
  } catch (err) {
    console.error('❌ [Categories] createCategory error:', err);
    res.status(500).json({ message: 'Erro ao criar categoria', error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description, display_order } = req.body;
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM product_categories WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Categoria não encontrada' });

    await pool.query(
      'UPDATE product_categories SET name = ?, description = ?, display_order = ? WHERE id = ?',
      [name ?? rows[0].name, description ?? rows[0].description, display_order ?? rows[0].display_order, id]
    );

    const [updated] = await pool.query('SELECT * FROM product_categories WHERE id = ?', [id]);
    res.json(mapCategory(updated[0]));
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar categoria', error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    // Verifica vínculos com produtos
    const [cnt] = await pool.query('SELECT COUNT(1) as c FROM products WHERE category_id = ?', [id]);
    if (cnt[0].c > 0) return res.status(400).json({ message: 'Não é possível excluir. Existem produtos vinculados.' });

    const [result] = await pool.query('DELETE FROM product_categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Categoria não encontrada' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir categoria', error: err.message });
  }
};

exports.reorderCategories = async (req, res) => {
  try {
    const { order } = req.body; // [{id, display_order}]
    if (!Array.isArray(order)) return res.status(400).json({ message: 'Formato inválido' });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const item of order) {
        await conn.query('UPDATE product_categories SET display_order = ? WHERE id = ?', [item.display_order, item.id]);
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao reordenar categorias', error: err.message });
  }
};

exports.searchCategories = async (req, res) => {
  try {
    const q = `%${(req.query.q || '').trim()}%`;
    const [rows] = await pool.query(
      'SELECT id, name, description FROM product_categories WHERE name LIKE ? OR description LIKE ? ORDER BY name ASC LIMIT 20',
      [q, q]
    );
    res.json(rows.map(mapCategory));
  } catch (err) {
    res.status(500).json({ message: 'Erro na busca de categorias', error: err.message });
  }
};

exports.toggleCategoryStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM product_categories WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Categoria não encontrada' });
    const current = rows[0].is_active ?? 1;
    await pool.query('UPDATE product_categories SET is_active = ? WHERE id = ?', [current ? 0 : 1, id]);
    const [updated] = await pool.query('SELECT * FROM product_categories WHERE id = ?', [id]);
    res.json(mapCategory(updated[0]));
  } catch (err) {
    res.status(500).json({ message: 'Erro ao alterar status', error: err.message });
  }
};


