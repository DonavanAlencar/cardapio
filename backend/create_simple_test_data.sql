-- Script simples para criar dados de teste para a cozinha
-- Usa produtos existentes

-- Inserir pedido de exemplo
INSERT INTO `orders` (`customer_id`, `table_id`, `waiter_session_id`, `total_amount`, `status`) VALUES
(1, 1, 1, 33.00, 'open');

-- Inserir itens do pedido usando produtos existentes
INSERT INTO `order_items` (`order_id`, `product_id`, `quantity`, `unit_price`, `total_price`) VALUES
(1, 1, 1, 8.00, 8.00),   -- Coca-Cola
(1, 2, 1, 25.00, 25.00); -- Hambúrguer

-- Inserir kitchen tickets
INSERT INTO `kitchen_tickets` (`order_id`, `sent_at`, `status`) VALUES
(1, NOW(), 'pending'),
(1, NOW(), 'pending');

-- Inserir kitchen ticket items com diferentes status para demonstrar
INSERT INTO `kitchen_ticket_items` (`kitchen_ticket_id`, `order_item_id`, `preparation_status`) VALUES
(1, 1, 'pending'),    -- Coca-Cola pendente
(2, 2, 'preparing');  -- Hambúrguer em preparo 