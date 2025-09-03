-- Script de inicialização corrigido para o MySQL
-- Este script será executado automaticamente quando o MySQL iniciar

-- Aguardar o MySQL estar pronto
SELECT SLEEP(5);

-- Criar banco se não existir
CREATE DATABASE IF NOT EXISTS cardapio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar o banco
USE cardapio;

-- Verificar se já existe dados (para evitar duplicação)
SET @table_count = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'cardapio');

-- Se não existem tabelas, executar o dump
SET @sql = IF(@table_count = 0, 'SOURCE /docker-entrypoint-initdb.d/backup/dump.sql', 'SELECT "Banco já inicializado" as status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
