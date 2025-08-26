const pool = require('../src/config/db');

class ProductController {
  // Listar todos os produtos com filtros e paginação
  async listProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        category_id,
        status,
        sortBy = 'name',
        sortOrder = 'ASC'
      } = req.query;

      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';
      const params = [];

      // Filtro de busca
      if (search) {
        whereClause += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      // Filtro por categoria
      if (category_id) {
        whereClause += ' AND p.category_id = ?';
        params.push(category_id);
      }

      // Filtro por status
      if (status) {
        whereClause += ' AND p.status = ?';
        params.push(status);
      }

      // Validação de ordenação
      const allowedSortFields = ['name', 'price', 'created_at', 'category_name'];
      const allowedSortOrders = ['ASC', 'DESC'];
      
      if (!allowedSortFields.includes(sortBy)) sortBy = 'name';
      if (!allowedSortOrders.includes(sortOrder.toUpperCase())) sortOrder = 'ASC';

      // Query principal
      const query = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.sku,
          p.status,
          p.category_id,
          pc.name as category_name,
          pc.description as category_description,
          pp.price,
          pp.start_date as price_start_date,
          pp.end_date as price_end_date,
          p.created_at,
          p.updated_at,
          (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) as total_orders,
          (SELECT COUNT(*) FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1) as has_image
        FROM products p
        JOIN product_categories pc ON p.category_id = pc.id
        LEFT JOIN product_prices pp ON p.id = pp.product_id 
          AND (pp.end_date IS NULL OR pp.end_date >= CURDATE())
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      // Query para contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM products p
        JOIN product_categories pc ON p.category_id = pc.id
        ${whereClause}
      `;

      const [rows] = await pool.query(query, [...params, parseInt(limit), offset]);
      const [countResult] = await pool.query(countQuery, params);
      const total = countResult[0].total;

      res.json({
        products: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      console.error('Erro ao listar produtos:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Buscar produto por ID com informações completas
  async getProductById(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          p.*,
          pc.name as category_name,
          pc.description as category_description,
          pp.price,
          pp.start_date as price_start_date,
          pp.end_date as price_end_date,
          (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) as total_orders,
          (SELECT COUNT(*) FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1) as has_image
        FROM products p
        JOIN product_categories pc ON p.category_id = pc.id
        LEFT JOIN product_prices pp ON p.id = pp.product_id 
          AND (pp.end_date IS NULL OR pp.end_date >= CURDATE())
        WHERE p.id = ?
      `;

      const [rows] = await pool.query(query, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }

      // Buscar imagens do produto
      const [images] = await pool.query(
        'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, created_at ASC',
        [id]
      );

      // Buscar modificadores do produto
      const [modifiers] = await pool.query(
        'SELECT * FROM produto_modificadores WHERE product_id = ?',
        [id]
      );

      // Buscar ingredientes do produto
      const [ingredients] = await pool.query(`
        SELECT 
          i.*,
          pi.quantidade
        FROM ingredientes i
        JOIN produto_ingredientes pi ON i.id = pi.ingrediente_id
        WHERE pi.product_id = ?
      `, [id]);

      const product = {
        ...rows[0],
        images,
        modifiers,
        ingredients
      };

      res.json(product);
    } catch (err) {
      console.error('Erro ao buscar produto:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Criar novo produto
  async createProduct(req, res) {
    try {
      const { 
        category_id, 
        name, 
        description, 
        sku, 
        status = 'active',
        price,
        images = [],
        modifiers = [],
        ingredients = []
      } = req.body;

      if (!category_id || !name) {
        return res.status(400).json({ 
          message: 'ID da categoria e nome do produto são obrigatórios.' 
        });
      }

      // Verificar se categoria existe
      const [categoryCheck] = await pool.query(
        'SELECT id FROM product_categories WHERE id = ?',
        [category_id]
      );

      if (categoryCheck.length === 0) {
        return res.status(400).json({ message: 'Categoria não encontrada.' });
      }

      // Iniciar transação
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Inserir produto
        const [productResult] = await connection.query(
          'INSERT INTO products (category_id, name, description, sku, status) VALUES (?, ?, ?, ?, ?)',
          [category_id, name, description, sku, status]
        );

        const productId = productResult.insertId;

        // Inserir preço se fornecido
        if (price) {
          await connection.query(
            'INSERT INTO product_prices (product_id, price, start_date) VALUES (?, ?, CURDATE())',
            [productId, price]
          );
        }

        // Inserir imagens se fornecidas
        if (images.length > 0) {
          for (const image of images) {
            await connection.query(
              'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
              [productId, image.url, image.is_primary || false]
            );
          }
        }

        // Inserir modificadores se fornecidos
        if (modifiers.length > 0) {
          for (const modifier of modifiers) {
            await connection.query(
              'INSERT INTO produto_modificadores (product_id, nome, tipo, ingrediente_id, fator_consumo, ajuste_preco) VALUES (?, ?, ?, ?, ?, ?)',
              [productId, modifier.nome, modifier.tipo, modifier.ingrediente_id, modifier.fator_consumo || 1.00, modifier.ajuste_preco || 0.00]
            );
          }
        }

        // Inserir ingredientes se fornecidos
        if (ingredients.length > 0) {
          for (const ingredient of ingredients) {
            await connection.query(
              'INSERT INTO produto_ingredientes (product_id, ingrediente_id, quantidade) VALUES (?, ?, ?)',
              [productId, ingredient.ingrediente_id, ingredient.quantidade]
            );
          }
        }

        await connection.commit();

        // Buscar produto criado
        const [newProduct] = await pool.query(
          'SELECT * FROM products WHERE id = ?',
          [productId]
        );

        res.status(201).json({
          message: 'Produto criado com sucesso.',
          product: newProduct[0]
        });

      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }

    } catch (err) {
      console.error('Erro ao criar produto:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Atualizar produto
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { 
        category_id, 
        name, 
        description, 
        sku, 
        status,
        price,
        images = [],
        modifiers = [],
        ingredients = []
      } = req.body;

      if (!category_id || !name) {
        return res.status(400).json({ 
          message: 'ID da categoria e nome do produto são obrigatórios.' 
        });
      }

      // Verificar se produto existe
      const [productCheck] = await pool.query(
        'SELECT id FROM products WHERE id = ?',
        [id]
      );

      if (productCheck.length === 0) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }

      // Verificar se categoria existe
      const [categoryCheck] = await pool.query(
        'SELECT id FROM product_categories WHERE id = ?',
        [category_id]
      );

      if (categoryCheck.length === 0) {
        return res.status(400).json({ message: 'Categoria não encontrada.' });
      }

      // Iniciar transação
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Atualizar produto
        await connection.query(
          'UPDATE products SET category_id = ?, name = ?, description = ?, sku = ?, status = ? WHERE id = ?',
          [category_id, name, description, sku, status || 'active', id]
        );

        // Atualizar preço se fornecido
        if (price !== undefined) {
          // Desativar preços anteriores
          await connection.query(
            'UPDATE product_prices SET end_date = CURDATE() WHERE product_id = ? AND end_date IS NULL',
            [id]
          );

          // Inserir novo preço
          await connection.query(
            'INSERT INTO product_prices (product_id, price, start_date) VALUES (?, ?, CURDATE())',
            [id, price]
          );
        }

        // Atualizar imagens se fornecidas
        if (images.length > 0) {
          // Remover imagens existentes
          await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);

          // Inserir novas imagens
          for (const image of images) {
            await connection.query(
              'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
              [id, image.url, image.is_primary || false]
            );
          }
        }

        // Atualizar modificadores se fornecidos
        if (modifiers.length > 0) {
          // Remover modificadores existentes
          await connection.query('DELETE FROM produto_modificadores WHERE product_id = ?', [id]);

          // Inserir novos modificadores
          for (const modifier of modifiers) {
            await connection.query(
              'INSERT INTO produto_modificadores (product_id, nome, tipo, ingrediente_id, fator_consumo, ajuste_preco) VALUES (?, ?, ?, ?, ?, ?)',
              [id, modifier.nome, modifier.tipo, modifier.ingrediente_id, modifier.fator_consumo || 1.00, modifier.ajuste_preco || 0.00]
            );
          }
        }

        // Atualizar ingredientes se fornecidos
        if (ingredients.length > 0) {
          // Remover ingredientes existentes
          await connection.query('DELETE FROM produto_ingredientes WHERE product_id = ?', [id]);

          // Inserir novos ingredientes
          for (const ingredient of ingredients) {
            await connection.query(
              'INSERT INTO produto_ingredientes (product_id, ingrediente_id, quantidade) VALUES (?, ?, ?)',
              [id, ingredient.ingrediente_id, ingredient.quantidade]
            );
          }
        }

        await connection.commit();

        res.json({
          message: 'Produto atualizado com sucesso.',
          product: { id, category_id, name, description, sku, status: status || 'active' }
        });

      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }

    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Deletar produto
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      // Verificar se produto existe
      const [productCheck] = await pool.query(
        'SELECT id FROM products WHERE id = ?',
        [id]
      );

      if (productCheck.length === 0) {
        return res.status(404).json({ message: 'Produto não encontrado.' });
      }

      // Verificar se produto tem pedidos
      const [orderCheck] = await pool.query(
        'SELECT COUNT(*) as count FROM order_items WHERE product_id = ?',
        [id]
      );

      if (orderCheck[0].count > 0) {
        return res.status(400).json({ 
          message: 'Não é possível deletar um produto que possui pedidos associados.' 
        });
      }

      // Iniciar transação
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Remover relacionamentos
        await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
        await connection.query('DELETE FROM produto_modificadores WHERE product_id = ?', [id]);
        await connection.query('DELETE FROM produto_ingredientes WHERE product_id = ?', [id]);
        await connection.query('DELETE FROM product_prices WHERE product_id = ?', [id]);

        // Remover produto
        await connection.query('DELETE FROM products WHERE id = ?', [id]);

        await connection.commit();

        res.status(204).send();

      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }

    } catch (err) {
      console.error('Erro ao deletar produto:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Buscar produtos por categoria
  async getProductsByCategory(req, res) {
    try {
      const { category_id } = req.params;
      const { status = 'active' } = req.query;

      const query = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.sku,
          p.status,
          pc.name as category_name,
          pp.price,
          (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) as total_orders,
          (SELECT COUNT(*) FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1) as has_image
        FROM products p
        JOIN product_categories pc ON p.category_id = pc.id
        LEFT JOIN product_prices pp ON p.id = pp.product_id 
          AND (pp.end_date IS NULL OR pp.end_date >= CURDATE())
        WHERE p.category_id = ? AND p.status = ?
        ORDER BY p.name
      `;

      const [rows] = await pool.query(query, [category_id, status]);
      res.json(rows);

    } catch (err) {
      console.error('Erro ao buscar produtos por categoria:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Buscar produtos populares
  async getPopularProducts(req, res) {
    try {
      const { limit = 10, days = 30 } = req.query;

      const query = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.sku,
          p.status,
          pc.name as category_name,
          pp.price,
          COUNT(oi.id) as order_count,
          (SELECT COUNT(*) FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1) as has_image
        FROM products p
        JOIN product_categories pc ON p.category_id = pc.id
        LEFT JOIN product_prices pp ON p.id = pp.product_id 
          AND (pp.end_date IS NULL OR pp.end_date >= CURDATE())
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id
        WHERE p.status = 'active'
          AND (o.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY) OR o.created_at IS NULL)
        GROUP BY p.id
        HAVING order_count > 0
        ORDER BY order_count DESC
        LIMIT ?
      `;

      const [rows] = await pool.query(query, [parseInt(days), parseInt(limit)]);
      res.json(rows);

    } catch (err) {
      console.error('Erro ao buscar produtos populares:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Buscar produtos com estoque baixo
  async getLowStockProducts(req, res) {
    try {
      const query = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.sku,
          p.status,
          pc.name as category_name,
          pp.price,
          i.nome as ingrediente_nome,
          i.quantidade_estoque,
          i.quantidade_minima,
          (i.quantidade_estoque - i.quantidade_minima) as estoque_disponivel
        FROM products p
        JOIN product_categories pc ON p.category_id = pc.id
        LEFT JOIN product_prices pp ON p.id = pp.product_id 
          AND (pp.end_date IS NULL OR pp.end_date >= CURDATE())
        JOIN produto_ingredientes pi ON p.id = pi.product_id
        JOIN ingredientes i ON pi.ingrediente_id = i.id
        WHERE i.quantidade_estoque <= i.quantidade_minima
          AND p.status = 'active'
        ORDER BY estoque_disponivel ASC
      `;

      const [rows] = await pool.query(query);
      res.json(rows);

    } catch (err) {
      console.error('Erro ao buscar produtos com estoque baixo:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Buscar produtos por termo (autocomplete)
  async searchProducts(req, res) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || q.length < 2) {
        return res.json([]);
      }

      const query = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.sku,
          pc.name as category_name,
          pp.price
        FROM products p
        JOIN product_categories pc ON p.category_id = pc.id
        LEFT JOIN product_prices pp ON p.id = pp.product_id 
          AND (pp.end_date IS NULL OR pp.end_date >= CURDATE())
        WHERE p.status = 'active'
          AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)
        ORDER BY 
          CASE 
            WHEN p.name LIKE ? THEN 1
            WHEN p.name LIKE ? THEN 2
            ELSE 3
          END,
          p.name
        LIMIT ?
      `;

      const searchTerm = `%${q}%`;
      const exactStart = `${q}%`;
      const exactContains = `%${q}%`;

      const [rows] = await pool.query(query, [
        searchTerm, searchTerm, searchTerm,
        exactStart, exactContains, parseInt(limit)
      ]);

      res.json(rows);

    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Obter estatísticas dos produtos
  async getProductStats(req, res) {
    try {
      const [totalProducts] = await pool.query('SELECT COUNT(*) as total FROM products');
      const [activeProducts] = await pool.query("SELECT COUNT(*) as total FROM products WHERE status = 'active'");
      const [inactiveProducts] = await pool.query("SELECT COUNT(*) as total FROM products WHERE status = 'inactive'");
      const [productsWithImages] = await pool.query(`
        SELECT COUNT(DISTINCT p.id) as total 
        FROM products p 
        JOIN product_images pi ON p.id = pi.product_id 
        WHERE pi.is_primary = 1
      `);
      const [lowStockProducts] = await pool.query(`
        SELECT COUNT(DISTINCT p.id) as total
        FROM products p
        JOIN produto_ingredientes pi ON p.id = pi.product_id
        JOIN ingredientes i ON pi.ingrediente_id = i.id
        WHERE i.quantidade_estoque <= i.quantidade_minima
          AND p.status = 'active'
      `);

      res.json({
        total: totalProducts[0].total,
        active: activeProducts[0].total,
        inactive: inactiveProducts[0].total,
        withImages: productsWithImages[0].total,
        lowStock: lowStockProducts[0].total
      });

    } catch (err) {
      console.error('Erro ao buscar estatísticas dos produtos:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
}

module.exports = new ProductController();
