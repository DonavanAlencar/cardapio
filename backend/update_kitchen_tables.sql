-- Script para atualizar as tabelas da cozinha
-- Execute este script no seu banco de dados MySQL

-- Atualizar o enum da tabela kitchen_ticket_items para incluir 'served'
ALTER TABLE `kitchen_ticket_items` 
MODIFY COLUMN `preparation_status` enum('pending','preparing','done','served') NOT NULL DEFAULT 'pending';

-- Verificar se a tabela kitchen_tickets existe e tem a estrutura correta
-- Se não existir, criar
CREATE TABLE IF NOT EXISTS `kitchen_tickets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `sent_at` datetime DEFAULT NULL,
  `status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_kitchen_tickets_order` (`order_id`),
  CONSTRAINT `fk_kitchen_tickets_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Verificar se a tabela kitchen_ticket_items existe e tem a estrutura correta
-- Se não existir, criar
CREATE TABLE IF NOT EXISTS `kitchen_ticket_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kitchen_ticket_id` bigint unsigned NOT NULL,
  `order_item_id` bigint unsigned NOT NULL,
  `preparation_status` enum('pending','preparing','done','served') NOT NULL DEFAULT 'pending',
  `prepared_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_kt_items_ticket` (`kitchen_ticket_id`),
  KEY `fk_kt_items_order_item` (`order_item_id`),
  CONSTRAINT `fk_kt_items_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`),
  CONSTRAINT `fk_kt_items_ticket` FOREIGN KEY (`kitchen_ticket_id`) REFERENCES `kitchen_tickets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci; 