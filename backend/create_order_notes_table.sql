-- Script para criar a tabela order_notes se ela não existir
-- Esta tabela armazena observações e notas sobre pedidos

-- Verificar se a tabela order_notes existe e criar se não existir
CREATE TABLE IF NOT EXISTS `order_notes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL COMMENT 'FK → orders.id',
  `note` text NOT NULL COMMENT 'Texto da observação/nota',
  `type` enum('general', 'status_change', 'kitchen', 'waiter', 'customer') NOT NULL DEFAULT 'general' COMMENT 'Tipo da observação',
  `created_by` bigint unsigned NOT NULL COMMENT 'FK → users.id (usuário que criou a nota)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data/hora de criação',
  PRIMARY KEY (`id`),
  KEY `fk_order_notes_order` (`order_id`),
  KEY `fk_order_notes_user` (`created_by`),
  KEY `idx_order_notes_created_at` (`created_at`),
  KEY `idx_order_notes_type` (`type`),
  CONSTRAINT `fk_order_notes_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_notes_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Observações e notas sobre pedidos';

-- Inserir alguns dados de exemplo se a tabela estiver vazia
INSERT IGNORE INTO `order_notes` (`order_id`, `note`, `type`, `created_by`, `created_at`) VALUES
(1, 'Cliente solicitou que o hambúrguer seja bem passado', 'customer', 1, NOW()),
(2, 'Pedido com urgência - cliente tem compromisso', 'waiter', 1, NOW()),
(3, 'Substituir queijo por queijo vegano', 'kitchen', 1, NOW());

-- Verificar se a tabela foi criada corretamente
SELECT 
  TABLE_NAME,
  TABLE_ROWS,
  CREATE_TIME,
  TABLE_COMMENT
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'order_notes';
