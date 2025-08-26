const pool = require('../src/config/db');

class ProductCategoryController {
  // Listar todas as categorias
  async listCategories(req, res) {
    try {
      const { status, include_products = false } = req.query;
      
      let whereClause = '';
      const params = [];
      
      if (status) {
        whereClause = 'WHERE pc.status = ?';
        params.push(status);
      }

      let query = `
        SELECT 
          pc.*,
          COUNT(p.id) as product_count,
          COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_products
        FROM product_categories pc
        LEFT JOIN products p ON pc.id = p.category_id
        ${whereClause}
        GROUP BY pc.id
        ORDER BY pc.display_order, pc.name
      `;

      const [rows] = await pool.query(query, params);

      // Se solicitado, incluir produtos de cada categoria
      if (include_products === 'true') {
        for (let category of rows) {
          const [products] = await pool.query(`
            SELECT 
              p.id,
              p.name,
              p.description,
              p.sku,
              p.status,
              pp.price
            FROM products p
            LEFT JOIN product_prices pp ON p.id = pp.product_id 
              AND (pp.end_date IS NULL OR pp.end_date >= CURDATE())
            WHERE p.category_id = ?
            ORDER BY p.name
          `, [category.id]);
          
          category.products = products;
        }
      }

      res.json(rows);
    } catch (err) {
      console.error('Erro ao listar categorias:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Buscar categoria por ID
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const { include_products = false } = req.query;

      const [rows] = await pool.query(
        'SELECT * FROM product_categories WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Categoria não encontrada.' });
      }

      const category = rows[0];

      // Se solicitado, incluir produtos da categoria
      if (include_products === 'true') {
        const [products] = await pool.query(`
          SELECT 
            p.id,
            p.name,
            p.description,
            p.sku,
            p.status,
            pp.price,
            (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) as total_orders
          FROM products p
          LEFT JOIN product_prices pp ON p.id = pp.product_id 
            AND (pp.end_date IS NULL OR pp.end_date >= CURDATE())
          WHERE p.category_id = ?
          ORDER BY p.name
        `, [id]);
        
        category.products = products;
      }

      res.json(category);
    } catch (err) {
      console.error('Erro ao buscar categoria:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Criar nova categoria
  async createCategory(req, res) {
    try {
      const { name, description, display_order = 0, status = 'active' } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Nome da categoria é obrigatório.' });
      }

      // Verificar se já existe categoria com o mesmo nome
      const [existingCategory] = await pool.query(
        'SELECT id FROM product_categories WHERE name = ?',
        [name]
      );

      if (existingCategory.length > 0) {
        return res.status(400).json({ message: 'Já existe uma categoria com este nome.' });
      }

      const [result] = await pool.query(
        'INSERT INTO product_categories (name, description, display_order, status) VALUES (?, ?, ?, ?)',
        [name, description, display_order, status]
      );

      const newCategory = {
        id: result.insertId,
        name,
        description,
        display_order,
        status,
        created_at: new Date(),
        updated_at: new Date()
      };

      res.status(201).json({
        message: 'Categoria criada com sucesso.',
        category: newCategory
      });
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Atualizar categoria
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, description, display_order, status } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Nome da categoria é obrigatório.' });
      }

      // Verificar se categoria existe
      const [categoryCheck] = await pool.query(
        'SELECT id FROM product_categories WHERE id = ?',
        [id]
      );

      if (categoryCheck.length === 0) {
        return res.status(404).json({ message: 'Categoria não encontrada.' });
      }

      // Verificar se já existe outra categoria com o mesmo nome
      const [existingCategory] = await pool.query(
        'SELECT id FROM product_categories WHERE name = ? AND id != ?',
        [name, id]
      );

      if (existingCategory.length > 0) {
        return res.status(400).json({ message: 'Já existe outra categoria com este nome.' });
      }

      const [result] = await pool.query(
        'UPDATE product_categories SET name = ?, description = ?, display_order = ?, status = ? WHERE id = ?',
        [name, description, display_order || 0, status || 'active', id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Categoria não encontrada.' });
      }

      res.json({
        message: 'Categoria atualizada com sucesso.',
        category: { id, name, description, display_order: display_order || 0, status: status || 'active' }
      });
    } catch (err) {
      console.error('Erro ao atualizar categoria:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Deletar categoria
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      // Verificar se categoria existe
      const [categoryCheck] = await pool.query(
        'SELECT id FROM product_categories WHERE id = ?',
        [id]
      );

      if (categoryCheck.length === 0) {
        return res.status(404).json({ message: 'Categoria não encontrada.' });
      }

      // Verificar se categoria tem produtos
      const [productCheck] = await pool.query(
        'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
        [id]
      );

      if (productCheck[0].count > 0) {
        return res.status(400).json({ 
          message: 'Não é possível deletar uma categoria que possui produtos associados.' 
        });
      }

      const [result] = await pool.query(
        'DELETE FROM product_categories WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Categoria não encontrada.' });
      }

      res.status(204).send();
    } catch (err) {
      console.error('Erro ao deletar categoria:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Reordenar categorias
  async reorderCategories(req, res) {
    try {
      const { categories } = req.body;

      if (!Array.isArray(categories)) {
        return res.status(400).json({ message: 'Lista de categorias é obrigatória.' });
      }

      // Iniciar transação
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        for (let i = 0; i < categories.length; i++) {
          const { id, display_order } = categories[i];
          
          await connection.query(
            'UPDATE product_categories SET display_order = ? WHERE id = ?',
            [i + 1, id]
          );
        }

        await connection.commit();

        res.json({
          message: 'Ordem das categorias atualizada com sucesso.',
          categories: categories.map((cat, index) => ({ ...cat, display_order: index + 1 }))
        });

      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }

    } catch (err) {
      console.error('Erro ao reordenar categorias:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Buscar categorias por termo (autocomplete)
  async searchCategories(req, res) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || q.length < 2) {
        return res.json([]);
      }

      const query = `
        SELECT 
          id,
          name,
          description,
          display_order
        FROM product_categories
        WHERE status = 'active'
          AND (name LIKE ? OR description LIKE ?)
        ORDER BY 
          CASE 
            WHEN name LIKE ? THEN 1
            WHEN name LIKE ? THEN 2
            ELSE 3
          END,
          display_order,
          name
        LIMIT ?
      `;

      const searchTerm = `%${q}%`;
      const exactStart = `${q}%`;
      const exactContains = `%${q}%`;

      const [rows] = await pool.query(query, [
        searchTerm, searchTerm,
        exactStart, exactContains, parseInt(limit)
      ]);

      res.json(rows);

    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Obter estatísticas das categorias
  async getCategoryStats(req, res) {
    try {
      const [totalCategories] = await pool.query('SELECT COUNT(*) as total FROM product_categories');
      const [activeCategories] = await pool.query("SELECT COUNT(*) as total FROM product_categories WHERE status = 'active'");
      const [categoriesWithProducts] = await pool.query(`
        SELECT COUNT(DISTINCT pc.id) as total
        FROM product_categories pc
        JOIN products p ON pc.id = p.category_id
      `);
      const [topCategories] = await pool.query(`
        SELECT 
          pc.id,
          pc.name,
          COUNT(p.id) as product_count,
          COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_products
        FROM product_categories pc
        LEFT JOIN products p ON pc.id = p.category_id
        GROUP BY pc.id
        ORDER BY product_count DESC
        LIMIT 5
      `);

      res.json({
        total: totalCategories[0].total,
        active: activeCategories[0].total,
        withProducts: categoriesWithProducts[0].total,
        topCategories
      });

    } catch (err) {
      console.error('Erro ao buscar estatísticas das categorias:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Ativar/desativar categoria
  async toggleCategoryStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['active', 'inactive'].includes(status)) {
        return res.status(400).json({ message: 'Status deve ser "active" ou "inactive".' });
      }

      // Verificar se categoria existe
      const [categoryCheck] = await pool.query(
        'SELECT id FROM product_categories WHERE id = ?',
        [id]
      );

      if (categoryCheck.length === 0) {
        return res.status(404).json({ message: 'Categoria não encontrada.' });
      }

      const [result] = await pool.query(
        'UPDATE product_categories SET status = ? WHERE id = ?',
        [status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Categoria não encontrada.' });
      }

      res.json({
        message: `Categoria ${status === 'active' ? 'ativada' : 'desativada'} com sucesso.`,
        category: { id, status }
      });
    } catch (err) {
      console.error('Erro ao alterar status da categoria:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
}

module.exports = new ProductCategoryController();
