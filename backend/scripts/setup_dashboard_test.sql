-- Script para configurar dados de teste para o Dashboard
-- Execute este script após criar as tabelas do banco de dados

USE cardapio;

-- Inserir dados de teste para branches (se não existir)
INSERT IGNORE INTO branches (id, name, address) VALUES 
(1, 'Filial Matriz', 'Rua Principal, 100'),
(2, 'Filial Centro', 'Avenida Central, 200');

-- Inserir dados de teste para users (se não existir)
INSERT IGNORE INTO users (id, username, password_hash, email, branch_id) VALUES 
(1, 'admin', '$2b$10$hrFwGLpPd2tAJppCILvEBelxR9XdqtrywUgpSbTpFkYhRBrbJj0V6', 'admin@empresa.com', 1),
(2, 'garcom1', '$2b$10$hrFwGLpPd2tAJppCILvEBelxR9XdqtrywUgpSbTpFkYhRBrbJj0V6', 'garcom1@empresa.com', 1);

-- Inserir dados de teste para employees (se não existir)
INSERT IGNORE INTO employees (id, user_id, branch_id, full_name, position) VALUES 
(1, 2, 1, 'Carlos Silva', 'Garçom'),
(2, 1, 1, 'Administrador', 'Gerente');

-- Inserir dados de teste para tables (se não existir)
INSERT IGNORE INTO tables (id, branch_id, table_number, capacity, status) VALUES 
(1, 1, 'Mesa 1', 4, 'occupied'),
(2, 1, 'Mesa 2', 2, 'available'),
(3, 1, 'Mesa 3', 6, 'reserved'),
(4, 1, 'Mesa 4', 4, 'available'),
(5, 1, 'Mesa 5', 2, 'occupied');

-- Inserir dados de teste para customers (se não existir)
INSERT IGNORE INTO customers (id, full_name, email, phone) VALUES 
(1, 'João da Silva', 'joao.silva@example.com', '11999990000'),
(2, 'Mariana Costa', 'mariana.costa@example.com', '21988887777'),
(3, 'Pedro Oliveira', 'pedro.oliveira@example.com', '21977776666');

-- Inserir dados de teste para orders (se não existir)
INSERT IGNORE INTO orders (id, customer_id, table_id, waiter_session_id, total_amount, status) VALUES 
(1, 1, 1, 1, 45.00, 'open'),
(2, 2, 5, 1, 33.00, 'in_preparation'),
(3, 3, NULL, 1, 67.50, 'ready'),
(4, 1, 1, 1, 89.90, 'closed'),
(5, 2, 2, 1, 120.00, 'served');

-- Inserir dados de teste para order_items (se não existir)
INSERT IGNORE INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, status) VALUES 
(1, 1, 1, 2, 25.00, 50.00, 'pending'),
(2, 1, 2, 1, 15.00, 17.00, 'pending'),
(3, 2, 1, 1, 5.50, 5.50, 'in_preparation'),
(4, 3, 2, 3, 22.50, 67.50, 'ready'),
(5, 4, 1, 2, 25.00, 50.00, 'served'),
(6, 4, 2, 2, 19.95, 39.90, 'served'),
(7, 5, 2, 4, 30.00, 120.00, 'served');

-- Inserir dados de teste para ingredientes (se não existir)
INSERT IGNORE INTO ingredientes (id, nome, unidade_medida, quantidade_estoque, quantidade_minima, ativo) VALUES 
(1, 'Carne', 'kg', 10.00, 1.00, 1),
(2, 'Pão', 'unidade', 50.00, 10.00, 1),
(3, 'Queijo', 'kg', 5.00, 0.50, 1),
(4, 'Gelo', 'kg', 20.00, 5.00, 1),
(5, 'Alface', 'kg', 3.00, 0.50, 1),
(6, 'Tomate', 'kg', 0.30, 1.00, 1),  -- Estoque baixo
(7, 'Cebola', 'kg', 0.20, 0.50, 1);  -- Estoque baixo

-- Inserir dados de teste para products (se não existir)
INSERT IGNORE INTO products (id, category_id, name, description, sku, status) VALUES 
(1, 1, 'Coca-Cola 350ml', 'Refrigerante em lata', 'COCA350', 'active'),
(2, 2, 'Hambúrguer Simples', 'Pão, carne, alface, tomate', 'HAMB001', 'active'),
(3, 2, 'Batata Frita', 'Porção de batatas fritas', 'BATATA001', 'active');

-- Inserir dados de teste para product_categories (se não existir)
INSERT IGNORE INTO product_categories (id, name, description, display_order) VALUES 
(1, 'Bebidas', 'Refrigerantes, sucos e coquetéis', 1),
(2, 'Comidas', 'Petiscos e pratos principais', 2);

-- Inserir dados de teste para product_prices (se não existir)
INSERT IGNORE INTO product_prices (id, product_id, price, start_date) VALUES 
(1, 1, 5.50, '2025-01-01'),
(2, 2, 15.00, '2025-01-01'),
(3, 3, 12.00, '2025-01-01');

-- Verificar se os dados foram inseridos corretamente
SELECT 'Dados de teste inseridos com sucesso!' as status;

-- Mostrar resumo dos dados
SELECT 
    'Branches' as tabela, COUNT(*) as total FROM branches
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Tables', COUNT(*) FROM tables
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Ingredientes', COUNT(*) FROM ingredientes;
