-- Script para criar a tabela de configurações
-- Execute este script no seu banco de dados MySQL

CREATE TABLE IF NOT EXISTS `configuracoes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `percentual_comissao` decimal(5,2) NOT NULL DEFAULT '10.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Inserir configuração padrãoroot

INSERT INTO `configuracoes` (`id`, `percentual_comissao`) VALUES (1, 10.00)
ON DUPLICATE KEY UPDATE `percentual_comissao` = VALUES(`percentual_comissao`); 