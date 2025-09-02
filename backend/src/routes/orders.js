const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware para verificar se o usuário é garçom, admin ou gerente
const authorizeWaiterAdminOrManager = (req, res, next) => {
  if (req.user.role !== 'waiter' && req.user.role !== 'admin' && req.user.role !== 'gerente') {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para gerenciar pedidos.' });
  }
  next();
};

// Rota para listar todos os pedidos
router.get('/', auth(), authorizeWaiterAdminOrManager, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Contar pedidos pendentes para badge
router.get('/pending-count', auth(), authorizeWaiterAdminOrManager, async (req, res) => {
  try {
    const [result] = await pool.query(`
      SELECT COUNT(*) as count
      FROM orders
      WHERE status IN ('open', 'in_preparation')
    `);
    
    res.json({ count: result[0].count });
  } catch (err) {
    console.error('Erro ao contar pedidos pendentes:', err);
    res.status(500).json({ message: 'Erro interno ao contar pedidos pendentes' });
  }
});

// Rota para buscar um pedido específico com seus itens
router.get('/:id', auth(), authorizeWaiterAdminOrManager, async (req, res) => {
  const { id } = req.params;
  try {
    const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orderRows.length === 0) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }
    const order = orderRows[0];

    const [itemRows] = await pool.query(
      `SELECT oi.*, p.name as product_name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );
    order.items = itemRows;

    res.json(order);
  } catch (err) {
    console.error('Erro ao buscar pedido:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para criar um novo pedido
router.post('/', auth(), authorizeWaiterAdminOrManager, async (req, res) => {
  const { customer_id, table_id, waiter_session_id, items } = req.body;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.query(
      'INSERT INTO orders (customer_id, table_id, waiter_session_id) VALUES (?, ?, ?)',
      [customer_id || null, table_id || null, waiter_session_id || null]
    );
    const orderId = result.insertId;
    let totalAmount = 0;

    if (items && items.length > 0) {
      // Primeiro, validar estoque de todos os itens antes de processar qualquer um
      for (const item of items) {
        const [ingredientsRows] = await connection.query(
          'SELECT ingrediente_id, quantidade FROM produto_ingredientes WHERE product_id = ?',
          [item.product_id]
        );

        for (const ing of ingredientsRows) {
          const requiredQuantity = ing.quantidade * item.quantity;
          const [stockRows] = await connection.query(
            'SELECT quantidade_estoque, nome FROM ingredientes WHERE id = ? AND ativo = 1',
            [ing.ingrediente_id]
          );
          if (stockRows.length === 0) {
            throw new Error(`Ingrediente ${ing.ingrediente_id} não encontrado ou inativo`);
          }
          if (stockRows[0].quantidade_estoque < requiredQuantity) {
            throw new Error(`Estoque insuficiente para ${stockRows[0].nome}. Disponível: ${stockRows[0].quantidade_estoque}, Necessário: ${requiredQuantity}`);
          }
        }
      }

      // Se chegou até aqui, todos os itens têm estoque suficiente
      for (const item of items) {
        const [productPriceRows] = await connection.query(
          'SELECT price FROM product_prices WHERE product_id = ? AND (end_date IS NULL OR end_date >= CURDATE()) ORDER BY start_date DESC LIMIT 1',
          [item.product_id]
        );
        const unitPrice = productPriceRows.length > 0 ? productPriceRows[0].price : 0;
        const totalPrice = unitPrice * item.quantity;
        totalAmount += totalPrice;

        // Dedução de estoque (já validado acima)
        const [ingredientsRows] = await connection.query(
          'SELECT ingrediente_id, quantidade FROM produto_ingredientes WHERE product_id = ?',
          [item.product_id]
        );

        for (const ing of ingredientsRows) {
          const requiredQuantity = ing.quantidade * item.quantity;
          await connection.query(
            'UPDATE ingredientes SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?',
            [requiredQuantity, ing.ingrediente_id]
          );
          
          // Registrar movimentação de estoque
          await connection.query(
            'INSERT INTO estoque_movimentos (ingrediente_id, tipo_movimento, quantidade, referencia, ocorrido_em) VALUES (?, "SAIDA", ?, ?, NOW())',
            [ing.ingrediente_id, requiredQuantity, `order:${orderId}`]
          );
        }

        const [orderItemResult] = await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, unitPrice, totalPrice]
        );
        const orderItemId = orderItemResult.insertId;

        // Criar kitchen ticket e kitchen ticket item
        const [kitchenTicketResult] = await connection.query(
          'INSERT INTO kitchen_tickets (order_id, sent_at, status) VALUES (?, NOW(), "pending")',
          [orderId]
        );
        const kitchenTicketId = kitchenTicketResult.insertId;

        await connection.query(
          'INSERT INTO kitchen_ticket_items (kitchen_ticket_id, order_item_id, preparation_status) VALUES (?, ?, "pending")',
          [kitchenTicketId, orderItemId]
        );
      }
    }

    await connection.query('UPDATE orders SET total_amount = ? WHERE id = ?', [totalAmount, orderId]);

    await connection.commit();
    res.status(201).json({ id: orderId, customer_id, table_id, waiter_session_id, total_amount: totalAmount, items });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Erro ao criar pedido:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  } finally {
    if (connection) connection.release();
  }
});

// Rota para adicionar um item a um pedido existente
router.post('/:orderId/items', auth(), authorizeWaiterAdminOrManager, async (req, res) => {
  const { orderId } = req.params;
  const { product_id, quantity, modifier_ids = [] } = req.body;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orderRows] = await connection.query('SELECT total_amount FROM orders WHERE id = ?', [orderId]);
    if (orderRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }
    let currentTotalAmount = orderRows[0].total_amount;

    // Preço base do produto
    const [productPriceRows] = await connection.query(
      'SELECT price FROM product_prices WHERE product_id = ? AND (end_date IS NULL OR end_date >= CURDATE()) ORDER BY start_date DESC LIMIT 1',
      [product_id]
    );
    let unitPrice = productPriceRows.length > 0 ? parseFloat(productPriceRows[0].price) : 0;
    let totalModifierPrice = 0;

    // Buscar modificadores e somar ajuste de preço
    let modifiers = [];
    if (modifier_ids.length > 0) {
      const [modifierRows] = await connection.query(
        `SELECT * FROM produto_modificadores WHERE id IN (${modifier_ids.map(() => '?').join(',')})`,
        modifier_ids
      );
      modifiers = modifierRows;
      totalModifierPrice = modifierRows.reduce((sum, mod) => sum + parseFloat(mod.ajuste_preco || 0), 0);
    }
    const finalUnitPrice = unitPrice + totalModifierPrice;
    const totalPrice = finalUnitPrice * quantity;

    // Inserir item do pedido
    const [result] = await connection.query(
      'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
      [orderId, product_id, quantity, finalUnitPrice, totalPrice]
    );
    const newItemId = result.insertId;

    // Registrar modificadores do item
    for (const modId of modifier_ids) {
      await connection.query(
        'INSERT INTO order_item_modifiers (order_item_id, modifier_id) VALUES (?, ?)',
        [newItemId, modId]
      );
    }

    // Criar kitchen ticket e kitchen ticket item para o novo item
    const [kitchenTicketResult] = await connection.query(
      'INSERT INTO kitchen_tickets (order_id, sent_at, status) VALUES (?, NOW(), "pending")',
      [orderId]
    );
    const kitchenTicketId = kitchenTicketResult.insertId;

    await connection.query(
      'INSERT INTO kitchen_ticket_items (kitchen_ticket_id, order_item_id, preparation_status) VALUES (?, ?, "pending")',
      [kitchenTicketId, newItemId]
    );

    // Primeiro, validar estoque antes de processar
    const [ingredientsRows] = await connection.query(
      'SELECT ingrediente_id, quantidade FROM produto_ingredientes WHERE product_id = ?',
      [product_id]
    );
    
    // Validar estoque de ingredientes base
    for (const ing of ingredientsRows) {
      let requiredQuantity = ing.quantidade * quantity;
      // Ajustar pelo modificador se houver
      for (const mod of modifiers) {
        if (mod.ingrediente_id === ing.ingrediente_id) {
          if (mod.tipo === 'ADICAO') {
            requiredQuantity += (mod.fator_consumo || 1) * quantity;
          } else if (mod.tipo === 'REMOCAO') {
            requiredQuantity -= (mod.fator_consumo || 1) * quantity;
          } // SUBSTITUICAO pode ser tratado conforme regra de negócio
        }
      }
      if (requiredQuantity > 0) {
        const [stockRows] = await connection.query(
          'SELECT quantidade_estoque, nome FROM ingredientes WHERE id = ? AND ativo = 1',
          [ing.ingrediente_id]
        );
        if (stockRows.length === 0) {
          throw new Error(`Ingrediente ${ing.ingrediente_id} não encontrado ou inativo`);
        }
        if (stockRows[0].quantidade_estoque < requiredQuantity) {
          throw new Error(`Estoque insuficiente para ${stockRows[0].nome}. Disponível: ${stockRows[0].quantidade_estoque}, Necessário: ${requiredQuantity}`);
        }
      }
    }
    
    // Validar estoque de ingredientes de modificadores adicionais
    for (const mod of modifiers) {
      if (mod.ingrediente_id && !ingredientsRows.some(ing => ing.ingrediente_id === mod.ingrediente_id)) {
        if (mod.tipo === 'ADICAO') {
          const requiredQuantity = (mod.fator_consumo || 1) * quantity;
          const [stockRows] = await connection.query(
            'SELECT quantidade_estoque, nome FROM ingredientes WHERE id = ? AND ativo = 1',
            [mod.ingrediente_id]
          );
          if (stockRows.length === 0) {
            throw new Error(`Ingrediente ${mod.ingrediente_id} não encontrado ou inativo`);
          }
          if (stockRows[0].quantidade_estoque < requiredQuantity) {
            throw new Error(`Estoque insuficiente para ${stockRows[0].nome}. Disponível: ${stockRows[0].quantidade_estoque}, Necessário: ${requiredQuantity}`);
          }
        }
      }
    }

    // Se chegou até aqui, todos os ingredientes têm estoque suficiente
    // Agora processar a dedução de estoque
    for (const ing of ingredientsRows) {
      let requiredQuantity = ing.quantidade * quantity;
      // Ajustar pelo modificador se houver
      for (const mod of modifiers) {
        if (mod.ingrediente_id === ing.ingrediente_id) {
          if (mod.tipo === 'ADICAO') {
            requiredQuantity += (mod.fator_consumo || 1) * quantity;
          } else if (mod.tipo === 'REMOCAO') {
            requiredQuantity -= (mod.fator_consumo || 1) * quantity;
          }
        }
      }
      if (requiredQuantity > 0) {
        await connection.query(
          'UPDATE ingredientes SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?',
          [requiredQuantity, ing.ingrediente_id]
        );
        await connection.query(
          'INSERT INTO estoque_movimentos (ingrediente_id, tipo_movimento, quantidade, referencia, ocorrido_em) VALUES (?, "SAIDA", ?, ?, NOW())',
          [ing.ingrediente_id, requiredQuantity, `order_item:${newItemId}`]
        );
      }
    }
    
    // Dedução de estoque para ingredientes de modificadores que não estão na lista base
    for (const mod of modifiers) {
      if (mod.ingrediente_id && !ingredientsRows.some(ing => ing.ingrediente_id === mod.ingrediente_id)) {
        if (mod.tipo === 'ADICAO') {
          const requiredQuantity = (mod.fator_consumo || 1) * quantity;
          await connection.query(
            'UPDATE ingredientes SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?',
            [requiredQuantity, mod.ingrediente_id]
          );
          await connection.query(
            'INSERT INTO estoque_movimentos (ingrediente_id, tipo_movimento, quantidade, referencia, ocorrido_em) VALUES (?, "SAIDA", ?, ?, NOW())',
            [mod.ingrediente_id, requiredQuantity, `order_item:${newItemId}`]
          );
        }
      }
    }

    currentTotalAmount += totalPrice;
    await connection.query('UPDATE orders SET total_amount = ? WHERE id = ?', [currentTotalAmount, orderId]);

    await connection.commit();
    res.status(201).json({ id: newItemId, order_id: orderId, product_id, quantity, unit_price: finalUnitPrice, total_price: totalPrice, modifier_ids });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Erro ao adicionar item ao pedido:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  } finally {
    if (connection) connection.release();
  }
});

// Rota para atualizar um item de pedido
router.put('/:orderId/items/:itemId', auth(), authorizeWaiterAdminOrManager, async (req, res) => {
  const { orderId, itemId } = req.params;
  const { quantity } = req.body;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orderItemRows] = await connection.query('SELECT * FROM order_items WHERE id = ? AND order_id = ?', [itemId, orderId]);
    if (orderItemRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Item de pedido não encontrado.' });
    }
    const oldOrderItem = orderItemRows[0];

    const [orderRows] = await connection.query('SELECT total_amount FROM orders WHERE id = ?', [orderId]);
    let currentTotalAmount = orderRows[0].total_amount;

    const newTotalPrice = oldOrderItem.unit_price * quantity;
    currentTotalAmount = currentTotalAmount - oldOrderItem.total_price + newTotalPrice;

    await connection.query(
      'UPDATE order_items SET quantity = ?, total_price = ? WHERE id = ?',
      [quantity, newTotalPrice, itemId]
    );
    await connection.query('UPDATE orders SET total_amount = ? WHERE id = ?', [currentTotalAmount, orderId]);

    await connection.commit();
    res.json({ id: itemId, order_id: orderId, product_id: oldOrderItem.product_id, quantity, unit_price: oldOrderItem.unit_price, total_price: newTotalPrice });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Erro ao atualizar item do pedido:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  } finally {
    if (connection) connection.release();
  }
});

// Rota para deletar um item de pedido
router.delete('/:orderId/items/:itemId', auth(), authorizeWaiterAdminOrManager, async (req, res) => {
  const { orderId, itemId } = req.params;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orderItemRows] = await connection.query('SELECT total_price FROM order_items WHERE id = ? AND order_id = ?', [itemId, orderId]);
    if (orderItemRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Item de pedido não encontrado.' });
    }
    const itemTotalPrice = orderItemRows[0].total_price;

    await connection.query('DELETE FROM order_items WHERE id = ?', [itemId]);

    const [orderRows] = await connection.query('SELECT total_amount FROM orders WHERE id = ?', [orderId]);
    let currentTotalAmount = orderRows[0].total_amount;
    currentTotalAmount -= itemTotalPrice;
    await connection.query('UPDATE orders SET total_amount = ? WHERE id = ?', [currentTotalAmount, orderId]);

    // Buscar ingredientes e modificadores do item, reverter estoque
    const [orderItemMods] = await connection.query('SELECT modifier_id FROM order_item_modifiers WHERE order_item_id = ?', [itemId]);
    const modifierIds = orderItemMods.map(m => m.modifier_id);
    let modifiers = [];
    if (modifierIds.length > 0) {
      const [modifierRows] = await connection.query(
        `SELECT * FROM produto_modificadores WHERE id IN (${modifierIds.map(() => '?').join(',')})`,
        modifierIds
      );
      modifiers = modifierRows;
    }
    const [itemRow] = await connection.query('SELECT * FROM order_items WHERE id = ?', [itemId]);
    if (itemRow.length > 0) {
      const item = itemRow[0];
      const [ingredientsRows] = await connection.query(
        'SELECT ingrediente_id, quantidade FROM produto_ingredientes WHERE product_id = ?',
        [item.product_id]
      );
      for (const ing of ingredientsRows) {
        let requiredQuantity = ing.quantidade * item.quantity;
        for (const mod of modifiers) {
          if (mod.ingrediente_id === ing.ingrediente_id) {
            if (mod.tipo === 'ADICAO') {
              requiredQuantity += (mod.fator_consumo || 1) * item.quantity;
            } else if (mod.tipo === 'REMOCAO') {
              requiredQuantity -= (mod.fator_consumo || 1) * item.quantity;
            }
          }
        }
        if (requiredQuantity > 0) {
          await connection.query(
            'UPDATE ingredientes SET quantidade_estoque = quantidade_estoque + ? WHERE id = ?',
            [requiredQuantity, ing.ingrediente_id]
          );
          await connection.query(
            'INSERT INTO estoque_movimentos (ingrediente_id, tipo_movimento, quantidade, referencia, ocorrido_em) VALUES (?, "ENTRADA", ?, ? , NOW())',
            [ing.ingrediente_id, requiredQuantity, `order_item_cancel:${itemId}`]
          );
        }
      }
      for (const mod of modifiers) {
        if (mod.ingrediente_id && !ingredientsRows.some(ing => ing.ingrediente_id === mod.ingrediente_id)) {
          if (mod.tipo === 'ADICAO') {
            const requiredQuantity = (mod.fator_consumo || 1) * item.quantity;
            await connection.query(
              'UPDATE ingredientes SET quantidade_estoque = quantidade_estoque + ? WHERE id = ?',
              [requiredQuantity, mod.ingrediente_id]
            );
            await connection.query(
              'INSERT INTO estoque_movimentos (ingrediente_id, tipo_movimento, quantidade, referencia, ocorrido_em) VALUES (?, "ENTRADA", ?, ? , NOW())',
              [mod.ingrediente_id, requiredQuantity, `order_item_cancel:${itemId}`]
            );
          }
        }
      }
    }

    await connection.commit();
    res.status(204).send();
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Erro ao deletar item do pedido:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  } finally {
    if (connection) connection.release();
  }
});

// Rota para atualizar um pedido completo (incluindo itens e modificadores)
router.put('/:id', auth(), authorizeWaiterAdminOrManager, async (req, res) => {
  const { id } = req.params;
  const { customer_id, table_id, waiter_session_id, status, notes, items } = req.body;
  let connection;
  
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verificar se o pedido existe
    const [orderRows] = await connection.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orderRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }

    const order = orderRows[0];

    // Atualizar informações básicas do pedido
    const updateFields = [];
    const updateValues = [];
    
    if (customer_id !== undefined) {
      updateFields.push('customer_id = ?');
      updateValues.push(customer_id);
    }
    if (table_id !== undefined) {
      updateFields.push('table_id = ?');
      updateValues.push(table_id);
    }
    if (waiter_session_id !== undefined) {
      updateFields.push('waiter_session_id = ?');
      updateValues.push(waiter_session_id);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(notes);
    }
    
    updateFields.push('updated_at = NOW()');
    updateValues.push(id);

    if (updateFields.length > 1) { // Mais de 1 porque sempre adicionamos updated_at
      await connection.query(
        `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    // Se items foi fornecido, atualizar itens do pedido
    if (items && Array.isArray(items)) {
      // Primeiro, reverter estoque dos itens existentes
      const [existingItems] = await connection.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [id]
      );

      for (const existingItem of existingItems) {
        // Buscar modificadores do item
        const [modifierRows] = await connection.query(
          'SELECT modifier_id FROM order_item_modifiers WHERE order_item_id = ?',
          [existingItem.id]
        );
        const modifierIds = modifierRows.map(m => m.modifier_id);
        let modifiers = [];
        
        if (modifierIds.length > 0) {
          const [modifierData] = await connection.query(
            `SELECT * FROM produto_modificadores WHERE id IN (${modifierIds.map(() => '?').join(',')})`,
            modifierIds
          );
          modifiers = modifierData;
        }

        // Reverter estoque
        const [ingredientsRows] = await connection.query(
          'SELECT ingrediente_id, quantidade FROM produto_ingredientes WHERE product_id = ?',
          [existingItem.product_id]
        );

        for (const ing of ingredientsRows) {
          let requiredQuantity = ing.quantidade * existingItem.quantity;
          for (const mod of modifiers) {
            if (mod.ingrediente_id === ing.ingrediente_id) {
              if (mod.tipo === 'ADICAO') {
                requiredQuantity += (mod.fator_consumo || 1) * existingItem.quantity;
              } else if (mod.tipo === 'REMOCAO') {
                requiredQuantity -= (mod.fator_consumo || 1) * existingItem.quantity;
              }
            }
          }
          if (requiredQuantity > 0) {
            await connection.query(
              'UPDATE ingredientes SET quantidade_estoque = quantidade_estoque + ? WHERE id = ?',
              [requiredQuantity, ing.ingrediente_id]
            );
            await connection.query(
              'INSERT INTO estoque_movimentos (ingrediente_id, tipo_movimento, quantidade, referencia, ocorrido_em) VALUES (?, "ENTRADA", ?, ?, NOW())',
              [ing.ingrediente_id, requiredQuantity, `order_edit_revert:${id}`]
            );
          }
        }

        // Reverter estoque para ingredientes de modificadores
        for (const mod of modifiers) {
          if (mod.ingrediente_id && !ingredientsRows.some(ing => ing.ingrediente_id === mod.ingrediente_id)) {
            if (mod.tipo === 'ADICAO') {
              const requiredQuantity = (mod.fator_consumo || 1) * existingItem.quantity;
              await connection.query(
                'UPDATE ingredientes SET quantidade_estoque = quantidade_estoque + ? WHERE id = ?',
                [requiredQuantity, mod.ingrediente_id]
              );
              await connection.query(
                'INSERT INTO estoque_movimentos (ingrediente_id, tipo_movimento, quantidade, referencia, ocorrido_em) VALUES (?, "ENTRADA", ?, ?, NOW())',
                [mod.ingrediente_id, requiredQuantity, `order_edit_revert:${id}`]
              );
            }
          }
        }
      }

      // Deletar todos os itens existentes
      await connection.query('DELETE FROM order_items WHERE order_id = ?', [id]);

      // Deletar kitchen tickets existentes
      await connection.query('DELETE FROM kitchen_tickets WHERE order_id = ?', [id]);

      // Inserir novos itens
      let totalAmount = 0;
      for (const item of items) {
        // Validar estoque
        const [ingredientsRows] = await connection.query(
          'SELECT ingrediente_id, quantidade FROM produto_ingredientes WHERE product_id = ?',
          [item.product_id]
        );

        for (const ing of ingredientsRows) {
          const requiredQuantity = ing.quantidade * item.quantity;
          const [stockRows] = await connection.query(
            'SELECT quantidade_estoque, nome FROM ingredientes WHERE id = ? AND ativo = 1',
            [ing.ingrediente_id]
          );
          if (stockRows.length === 0) {
            throw new Error(`Ingrediente ${ing.ingrediente_id} não encontrado ou inativo`);
          }
          if (stockRows[0].quantidade_estoque < requiredQuantity) {
            throw new Error(`Estoque insuficiente para ${stockRows[0].nome}. Disponível: ${stockRows[0].quantidade_estoque}, Necessário: ${requiredQuantity}`);
          }
        }

        // Buscar preço do produto
        const [productPriceRows] = await connection.query(
          'SELECT price FROM product_prices WHERE product_id = ? AND (end_date IS NULL OR end_date >= CURDATE()) ORDER BY start_date DESC LIMIT 1',
          [item.product_id]
        );
        const unitPrice = productPriceRows.length > 0 ? productPriceRows[0].price : 0;
        const totalPrice = unitPrice * item.quantity;
        totalAmount += totalPrice;

        // Inserir item
        const [orderItemResult] = await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
          [id, item.product_id, item.quantity, unitPrice, totalPrice]
        );
        const orderItemId = orderItemResult.insertId;

        // Inserir modificadores se houver
        if (item.modifiers && Array.isArray(item.modifiers)) {
          for (const modifier of item.modifiers) {
            await connection.query(
              'INSERT INTO order_item_modifiers (order_item_id, modifier_id) VALUES (?, ?)',
              [orderItemId, modifier.id]
            );
          }
        }

        // Criar kitchen ticket
        const [kitchenTicketResult] = await connection.query(
          'INSERT INTO kitchen_tickets (order_id, sent_at, status) VALUES (?, NOW(), "pending")',
          [id]
        );
        const kitchenTicketId = kitchenTicketResult.insertId;

        await connection.query(
          'INSERT INTO kitchen_ticket_items (kitchen_ticket_id, order_item_id, preparation_status) VALUES (?, ?, "pending")',
          [kitchenTicketId, orderItemId]
        );

        // Deduzir estoque
        for (const ing of ingredientsRows) {
          const requiredQuantity = ing.quantidade * item.quantity;
          await connection.query(
            'UPDATE ingredientes SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?',
            [requiredQuantity, ing.ingrediente_id]
          );
          await connection.query(
            'INSERT INTO estoque_movimentos (ingrediente_id, tipo_movimento, quantidade, referencia, ocorrido_em) VALUES (?, "SAIDA", ?, ?, NOW())',
            [ing.ingrediente_id, requiredQuantity, `order_edit:${id}`]
          );
        }
      }

      // Atualizar total do pedido
      await connection.query('UPDATE orders SET total_amount = ? WHERE id = ?', [totalAmount, id]);
    }

    await connection.commit();
    
    // Buscar pedido atualizado
    const [updatedOrderRows] = await connection.query('SELECT * FROM orders WHERE id = ?', [id]);
    const updatedOrder = updatedOrderRows[0];

    // Buscar itens atualizados
    const [updatedItemRows] = await connection.query(
      `SELECT oi.*, p.name as product_name, p.description as product_description
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    // Buscar modificadores de cada item
    for (const item of updatedItemRows) {
      const [modifierRows] = await connection.query(
        `SELECT pm.*, i.nome as ingrediente_nome
         FROM order_item_modifiers oim
         JOIN produto_modificadores pm ON oim.modifier_id = pm.id
         LEFT JOIN ingredientes i ON pm.ingrediente_id = i.id
         WHERE oim.order_item_id = ?`,
        [item.id]
      );
      item.modifiers = modifierRows;
    }

    updatedOrder.items = updatedItemRows;

    res.json(updatedOrder);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Erro ao atualizar pedido:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  } finally {
    if (connection) connection.release();
  }
});

// Rota para buscar um pedido com informações completas (para visualização detalhada)
router.get('/:id/detailed', auth(), authorizeWaiterAdminOrManager, async (req, res) => {
  const { id } = req.params;
  try {
    // Buscar pedido com informações relacionadas
    const [orderRows] = await pool.query(`
      SELECT o.*, 
             c.full_name as customer_name, c.email as customer_email, c.phone as customer_phone,
             t.table_number, t.capacity,
             e.full_name as waiter_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN employees e ON o.waiter_session_id = e.user_id
      WHERE o.id = ?
    `, [id]);
    
    if (orderRows.length === 0) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }
    
    const order = orderRows[0];

    // Buscar itens com informações completas
    const [itemRows] = await pool.query(`
      SELECT oi.*, 
             p.name as product_name, p.description as product_description,
             pc.name as category_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE oi.order_id = ?
      ORDER BY oi.created_at
    `, [id]);

    // Buscar modificadores de cada item
    for (const item of itemRows) {
      const [modifierRows] = await pool.query(`
        SELECT pm.*, i.nome as ingrediente_nome
        FROM order_item_modifiers oim
        JOIN produto_modificadores pm ON oim.modifier_id = pm.id
        LEFT JOIN ingredientes i ON pm.ingrediente_id = i.id
        WHERE oim.order_item_id = ?
      `, [item.id]);
      item.modifiers = modifierRows;
    }

    // Buscar histórico de status (kitchen tickets)
    const [kitchenTicketRows] = await pool.query(`
      SELECT kt.*, 
             GROUP_CONCAT(CONCAT(kti.preparation_status, ':', kti.prepared_at) ORDER BY kti.created_at SEPARATOR '|') as item_statuses
      FROM kitchen_tickets kt
      LEFT JOIN kitchen_ticket_items kti ON kt.id = kti.kitchen_ticket_id
      WHERE kt.order_id = ?
      GROUP BY kt.id
      ORDER BY kt.created_at DESC
    `, [id]);

    // Buscar observações/notas se existir
    const [notesRows] = await pool.query(`
      SELECT * FROM order_notes WHERE order_id = ? ORDER BY created_at DESC
    `, [id]);

    order.items = itemRows;
    order.kitchen_tickets = kitchenTicketRows;
    order.notes = notesRows;
    order.status_history = kitchenTicketRows.map(kt => ({
      status: kt.status,
      sent_at: kt.sent_at,
      created_at: kt.created_at,
      item_statuses: kt.item_statuses ? kt.item_statuses.split('|').map(s => {
        const [status, time] = s.split(':');
        return { status, time };
      }) : []
    }));

    res.json(order);
  } catch (err) {
    console.error('Erro ao buscar pedido detalhado:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para buscar histórico de status de um pedido
router.get('/:id/status-history', auth(), authorizeWaiterAdminOrManager, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT 
        kt.status,
        kt.sent_at,
        kt.created_at,
        kt.updated_at,
        GROUP_CONCAT(
          CONCAT(
            kti.preparation_status, ':', 
            COALESCE(kti.prepared_at, 'N/A'), ':',
            COALESCE(kti.updated_at, 'N/A')
          ) ORDER BY kti.created_at SEPARATOR '|'
        ) as item_details
      FROM kitchen_tickets kt
      LEFT JOIN kitchen_ticket_items kti ON kt.id = kti.kitchen_ticket_id
      WHERE kt.order_id = ?
      GROUP BY kt.id
      ORDER BY kt.created_at DESC
    `, [id]);

    const statusHistory = rows.map(row => ({
      status: row.status,
      sent_at: row.sent_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      items: row.item_details ? row.item_details.split('|').map(item => {
        const [status, prepared_at, updated_at] = item.split(':');
        return { status, prepared_at, updated_at };
      }) : []
    }));

    res.json(statusHistory);
  } catch (err) {
    console.error('Erro ao buscar histórico de status:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para adicionar observação a um pedido
router.post('/:id/notes', auth(), authorizeWaiterAdminOrManager, async (req, res) => {
  const { id } = req.params;
  const { note, type = 'general' } = req.body;
  
  try {
    const [result] = await pool.query(
      'INSERT INTO order_notes (order_id, note, type, created_by) VALUES (?, ?, ?, ?)',
      [id, note, type, req.user.id]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      order_id: id, 
      note, 
      type, 
      created_by: req.user.id,
      created_at: new Date()
    });
  } catch (err) {
    console.error('Erro ao adicionar observação:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para buscar observações de um pedido
router.get('/:id/notes', auth(), authorizeWaiterAdminOrManager, async (req, res) => {
  const { id } = req.params;
  
  try {
    const [rows] = await pool.query(`
      SELECT on.*, u.full_name as created_by_name
      FROM order_notes on
      LEFT JOIN users u ON on.created_by = u.id
      WHERE on.order_id = ?
      ORDER BY on.created_at DESC
    `, [id]);
    
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar observações:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para atualizar status de um pedido
router.patch('/:id/status', auth(), authorizeWaiterAdminOrManager, async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verificar se o pedido existe
    const [orderRows] = await connection.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orderRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }

    // Atualizar status do pedido
    await connection.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    // Atualizar status dos kitchen tickets
    await connection.query(
      'UPDATE kitchen_tickets SET status = ?, updated_at = NOW() WHERE order_id = ?',
      [status, id]
    );

    // Se houver observações, adicionar
    if (notes) {
      await connection.query(
        'INSERT INTO order_notes (order_id, note, type, created_by) VALUES (?, ?, "status_change", ?)',
        [id, notes, req.user.id]
      );
    }

    await connection.commit();
    
    // Buscar pedido atualizado
    const [updatedOrderRows] = await connection.query('SELECT * FROM orders WHERE id = ?', [id]);
    res.json(updatedOrderRows[0]);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Erro ao atualizar status do pedido:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
