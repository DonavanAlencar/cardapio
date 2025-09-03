-- Script para criar tabelas básicas do sistema
USE cardapio;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK do usuário do sistema',
  username varchar(50) NOT NULL COMMENT 'Login de acesso',
  password_hash varchar(255) NOT NULL COMMENT 'Hash da senha',
  email varchar(100) NOT NULL COMMENT 'E-mail de login',
  branch_id bigint unsigned NOT NULL COMMENT 'Filial associada',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última atualização',
  PRIMARY KEY (id),
  UNIQUE KEY username (username),
  KEY fk_users_branch (branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabela de filiais
CREATE TABLE IF NOT EXISTS branches (
  id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK da filial/ponto de venda',
  name varchar(100) NOT NULL COMMENT 'Nome da filial',
  address varchar(255) DEFAULT NULL COMMENT 'Endereço completo',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última atualização',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Inserir filial padrão
INSERT INTO branches (id, name, address, created_at, updated_at) VALUES 
(1, 'Filial Matriz', 'Rua Principal, 100', '2025-04-27 23:52:58', '2025-04-27 23:52:58');

-- Inserir usuário admin
INSERT INTO users (id, username, password_hash, email, branch_id, created_at, updated_at) VALUES 
(1, 'admin', '$2b$10$OIhONLh1pccAAMd4oh2xReNsZkQbZB4W58jzVEonvkEjrm0ukWzhC', 'admin@empresa.com', 1, '2025-04-27 23:53:02', '2025-08-05 23:39:29');

-- Tabela de mesas
CREATE TABLE IF NOT EXISTS tables (
  id bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK da mesa',
  branch_id bigint unsigned NOT NULL COMMENT 'Filial onde a mesa está',
  table_number varchar(10) NOT NULL COMMENT 'Identificador (ex: A1, 10)',
  capacity int unsigned NOT NULL COMMENT 'Pessoas máximas',
  status enum('available','occupied','reserved') NOT NULL DEFAULT 'available' COMMENT 'Estado atual',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última atualização',
  PRIMARY KEY (id),
  KEY fk_tables_branch (branch_id),
  CONSTRAINT fk_tables_branch FOREIGN KEY (branch_id) REFERENCES branches (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Inserir algumas mesas
INSERT INTO tables (id, branch_id, table_number, capacity, status, created_at, updated_at) VALUES 
(1, 1, 'Mesa 1', 4, 'available', '2025-04-27 23:53:12', '2025-04-27 23:53:12'),
(2, 1, '2', 4, 'available', '2025-08-06 00:09:45', '2025-08-06 00:09:45'),
(3, 1, '3', 6, 'available', '2025-08-06 00:09:45', '2025-08-06 00:09:45'),
(4, 1, '4', 2, 'available', '2025-08-06 00:09:45', '2025-08-06 00:09:45'),
(5, 1, '5', 8, 'available', '2025-08-06 00:09:45', '2025-08-06 00:09:45');
