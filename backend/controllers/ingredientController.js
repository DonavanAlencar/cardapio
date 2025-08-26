const pool = require('../src/config/db');

class IngredientController {
  // Listar todos os ingredientes
  async listIngredients(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        status = 'active',
        sortBy = 'nome',
        sortOrder = 'ASC'
      } = req.query;

      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';
      const params = [];

      // Filtro de busca
      if (search) {
        whereClause += ' AND (nome LIKE ? OR unidade_medida LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      // Filtro por status
      if (status) {
        whereClause += ' AND ativo = ?';
        params.push(status === 'active' ? 1 : 0);
      }

      // Validação de ordenação
      const allowedSortFields = ['nome', 'quantidade_estoque', 'quantidade_minima', 'created_at'];
      const allowedSortOrders = ['ASC', 'DESC'];
      
      if (!allowedSortFields.includes(sortBy)) sortBy = 'nome';
      if (!allowedSortOrders.includes(sortOrder.toUpperCase())) sortOrder = 'ASC';

      // Query principal
      const query = `
        SELECT 
          *,
          CASE 
            WHEN quantidade_estoque <= quantidade_minima THEN 'low'
            WHEN quantidade_estoque <= (quantidade_minima * 1.5) THEN 'warning'
            ELSE 'ok'
          END as stock_status
        FROM ingredientes
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      // Query para contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM ingredientes
        ${whereClause}
      `;

      const [rows] = await pool.query(query, [...params, parseInt(limit), offset]);
      const [countResult] = await pool.query(countQuery, params);
      const total = countResult[0].total;

      res.json({
        ingredients: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      console.error('Erro ao listar ingredientes:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Buscar ingrediente por ID
  async getIngredientById(req, res) {
    try {
      const { id } = req.params;

      const [rows] = await pool.query(
        'SELECT * FROM ingredientes WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Ingrediente não encontrado.' });
      }

      // Buscar produtos que usam este ingrediente
      const [products] = await pool.query(`
        SELECT 
          p.id,
          p.name,
          p.sku,
          pi.quantidade
        FROM products p
        JOIN produto_ingredientes pi ON p.id = pi.product_id
        WHERE pi.ingrediente_id = ?
        ORDER BY p.name
      `, [id]);

      // Buscar movimentos de estoque
      const [movements] = await pool.query(`
        SELECT *
        FROM estoque_movimentos
        WHERE ingrediente_id = ?
        ORDER BY ocorrido_em DESC
        LIMIT 10
      `, [id]);

      const ingredient = {
        ...rows[0],
        products,
        movements
      };

      res.json(ingredient);
    } catch (err) {
      console.error('Erro ao buscar ingrediente:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Criar novo ingrediente
  async createIngredient(req, res) {
    try {
      const { 
        nome, 
        unidade_medida, 
        quantidade_estoque = 0, 
        quantidade_minima = 0,
        ativo = 1
      } = req.body;

      if (!nome || !unidade_medida) {
        return res.status(400).json({ 
          message: 'Nome e unidade de medida são obrigatórios.' 
        });
      }

      // Verificar se já existe ingrediente com o mesmo nome
      const [existingIngredient] = await pool.query(
        'SELECT id FROM ingredientes WHERE nome = ?',
        [nome]
      );

      if (existingIngredient.length > 0) {
        return res.status(400).json({ message: 'Já existe um ingrediente com este nome.' });
      }

      const [result] = await pool.query(
        'INSERT INTO ingredientes (nome, unidade_medida, quantidade_estoque, quantidade_minima, ativo) VALUES (?, ?, ?, ?, ?)',
        [nome, unidade_medida, quantidade_estoque, quantidade_minima, ativo]
      );

      const newIngredient = {
        id: result.insertId,
        nome,
        unidade_medida,
        quantidade_estoque,
        quantidade_minima,
        ativo,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Se quantidade inicial > 0, criar movimento de entrada
      if (quantidade_estoque > 0) {
        await pool.query(
          'INSERT INTO estoque_movimentos (ingrediente_id, tipo_movimento, quantidade, referencia) VALUES (?, ?, ?, ?)',
          [result.insertId, 'ENTRADA', quantidade_estoque, 'Estoque inicial']
        );
      }

      res.status(201).json({
        message: 'Ingrediente criado com sucesso.',
        ingredient: newIngredient
      });
    } catch (err) {
      console.error('Erro ao criar ingrediente:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Atualizar ingrediente
  async updateIngredient(req, res) {
    try {
      const { id } = req.params;
      const { 
        nome, 
        unidade_medida, 
        quantidade_estoque, 
        quantidade_minima,
        ativo
      } = req.body;

      if (!nome || !unidade_medida) {
        return res.status(400).json({ 
          message: 'Nome e unidade de medida são obrigatórios.' 
        });
      }

      // Verificar se ingrediente existe
      const [ingredientCheck] = await pool.query(
        'SELECT * FROM ingredientes WHERE id = ?',
        [id]
      );

      if (ingredientCheck.length === 0) {
        return res.status(404).json({ message: 'Ingrediente não encontrado.' });
      }

      // Verificar se já existe outro ingrediente com o mesmo nome
      const [existingIngredient] = await pool.query(
        'SELECT id FROM ingredientes WHERE nome = ? AND id != ?',
        [nome, id]
      );

      if (existingIngredient.length > 0) {
        return res.status(400).json({ message: 'Já existe outro ingrediente com este nome.' });
      }

      const oldStock = ingredientCheck[0].quantidade_estoque;
      const newStock = quantidade_estoque || oldStock;

      // Iniciar transação
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Atualizar ingrediente
        await connection.query(
          'UPDATE ingredientes SET nome = ?, unidade_medida = ?, quantidade_estoque = ?, quantidade_minima = ?, ativo = ? WHERE id = ?',
          [nome, unidade_medida, newStock, quantidade_minima || 0, ativo !== undefined ? ativo : 1, id]
        );

        // Se quantidade mudou, criar movimento de estoque
        if (newStock !== oldStock) {
          const movementType = newStock > oldStock ? 'ENTRADA' : 'SAIDA';
          const quantity = Math.abs(newStock - oldStock);
          const reference = newStock > oldStock ? 'Ajuste de estoque' : 'Ajuste de estoque';

          await connection.query(
            'INSERT INTO estoque_movimentos (ingrediente_id, tipo_movimento, quantidade, referencia) VALUES (?, ?, ?, ?)',
            [id, movementType, quantity, reference]
          );
        }

        await connection.commit();

        res.json({
          message: 'Ingrediente atualizado com sucesso.',
          ingredient: { id, nome, unidade_medida, quantidade_estoque: newStock, quantidade_minima: quantidade_minima || 0, ativo: ativo !== undefined ? ativo : 1 }
        });

      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }

    } catch (err) {
      console.error('Erro ao atualizar ingrediente:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Deletar ingrediente
  async deleteIngredient(req, res) {
    try {
      const { id } = req.params;

      // Verificar se ingrediente existe
      const [ingredientCheck] = await pool.query(
        'SELECT id FROM ingredientes WHERE id = ?',
        [id]
      );

      if (ingredientCheck.length === 0) {
        return res.status(404).json({ message: 'Ingrediente não encontrado.' });
      }

      // Verificar se ingrediente é usado em produtos
      const [productCheck] = await pool.query(
        'SELECT COUNT(*) as count FROM produto_ingredientes WHERE ingrediente_id = ?',
        [id]
      );

      if (productCheck[0].count > 0) {
        return res.status(400).json({ 
          message: 'Não é possível deletar um ingrediente que é usado em produtos.' 
        });
      }

      // Verificar se ingrediente tem movimentos de estoque
      const [movementCheck] = await pool.query(
        'SELECT COUNT(*) as count FROM estoque_movimentos WHERE ingrediente_id = ?',
        [id]
      );

      if (movementCheck[0].count > 0) {
        return res.status(400).json({ 
          message: 'Não é possível deletar um ingrediente que possui movimentos de estoque.' 
        });
      }

      const [result] = await pool.query(
        'DELETE FROM ingredientes WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Ingrediente não encontrado.' });
      }

      res.status(204).send();
    } catch (err) {
      console.error('Erro ao deletar ingrediente:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Buscar ingredientes por termo (autocomplete)
  async searchIngredients(req, res) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || q.length < 2) {
        return res.json([]);
      }

      const query = `
        SELECT 
          id,
          nome,
          unidade_medida,
          quantidade_estoque,
          quantidade_minima
        FROM ingredientes
        WHERE ativo = 1
          AND (nome LIKE ? OR unidade_medida LIKE ?)
        ORDER BY 
          CASE 
            WHEN nome LIKE ? THEN 1
            WHEN nome LIKE ? THEN 2
            ELSE 3
          END,
          nome
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
      console.error('Erro ao buscar ingredientes:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Obter estatísticas dos ingredientes
  async getIngredientStats(req, res) {
    try {
      const [totalIngredients] = await pool.query('SELECT COUNT(*) as total FROM ingredientes');
      const [activeIngredients] = await pool.query("SELECT COUNT(*) as total FROM ingredientes WHERE ativo = 1");
      const [lowStockIngredients] = await pool.query(`
        SELECT COUNT(*) as total
        FROM ingredientes
        WHERE quantidade_estoque <= quantidade_minima
          AND ativo = 1
      `);
      const [warningStockIngredients] = await pool.query(`
        SELECT COUNT(*) as total
        FROM ingredientes
        WHERE quantidade_estoque <= (quantidade_minima * 1.5)
          AND quantidade_estoque > quantidade_minima
          AND ativo = 1
      `);

      res.json({
        total: totalIngredients[0].total,
        active: activeIngredients[0].total,
        lowStock: lowStockIngredients[0].total,
        warningStock: warningStockIngredients[0].total
      });

    } catch (err) {
      console.error('Erro ao buscar estatísticas dos ingredientes:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  // Ativar/desativar ingrediente
  async toggleIngredientStatus(req, res) {
    try {
      const { id } = req.params;
      const { ativo } = req.body;

      if (ativo === undefined || ![0, 1].includes(ativo)) {
        return res.status(400).json({ message: 'Status deve ser 0 (inativo) ou 1 (ativo).' });
      }

      // Verificar se ingrediente existe
      const [ingredientCheck] = await pool.query(
        'SELECT id FROM ingredientes WHERE id = ?',
        [id]
      );

      if (ingredientCheck.length === 0) {
        return res.status(404).json({ message: 'Ingrediente não encontrado.' });
      }

      const [result] = await pool.query(
        'UPDATE ingredientes SET ativo = ? WHERE id = ?',
        [ativo, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Ingrediente não encontrado.' });
      }

      res.json({
        message: `Ingrediente ${ativo ? 'ativado' : 'desativado'} com sucesso.`,
        ingredient: { id, ativo }
      });
    } catch (err) {
      console.error('Erro ao alterar status do ingrediente:', err);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
}

module.exports = new IngredientController();
