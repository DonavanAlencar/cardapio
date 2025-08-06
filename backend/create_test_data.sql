-- Script para criar dados de teste para a cozinha
-- Execute este script no seu banco de dados MySQL

-- Inserir produtos de exemplo se não existirem
INSERT IGNORE INTO `products` (`id`, `name`, `description`, `category_id`, `status`) VALUES
(1, 'Hambúrguer Clássico', 'Hambúrguer com carne, alface, tomate e queijo', 1, 'active'),
(2, 'Batata Frita', 'Porção de batatas fritas crocantes', 2, 'active'),
(3, 'Refrigerante Cola', 'Refrigerante cola 350ml', 3, 'active');

-- Inserir preços dos produtos se não existirem
INSERT IGNORE INTO `product_prices` (`product_id`, `price`, `start_date`) VALUES
(1, 25.00, CURDATE()),
(2, 12.00, CURDATE()),
(3, 8.00, CURDATE());

-- Inserir pedido de exemplo
INSERT INTO `orders` (`customer_id`, `table_id`, `waiter_session_id`, `total_amount`, `status`) VALUES
(1, 1, 1, 45.00, 'open');

-- Inserir itens do pedido
INSERT INTO `order_items` (`order_id`, `product_id`, `quantity`, `unit_price`, `total_price`) VALUES
(1, 1, 1, 25.00, 25.00),
(1, 2, 1, 12.00, 12.00),
(1, 3, 1, 8.00, 8.00);

-- Inserir kitchen tickets
INSERT INTO `kitchen_tickets` (`order_id`, `sent_at`, `status`) VALUES
(1, NOW(), 'pending'),
(1, NOW(), 'pending'),
(1, NOW(), 'pending');

-- Inserir kitchen ticket items com diferentes status para demonstrar
INSERT INTO `kitchen_ticket_items` (`kitchen_ticket_id`, `order_item_id`, `preparation_status`) VALUES
(1, 1, 'pending'),    -- Hambúrguer pendente
(2, 2, 'preparing'),  -- Batata em preparo
(3, 3, 'done');       -- Refrigerante pronto 