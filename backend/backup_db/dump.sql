-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: cardapio
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branches` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK da filial/ponto de venda',
  `name` varchar(100) NOT NULL COMMENT 'Nome da filial',
  `address` varchar(255) DEFAULT NULL COMMENT 'Endereço completo',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última atualização',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES (1,'Filial Matriz','Rua Principal, 100','2025-04-27 23:52:58','2025-04-27 23:52:58');
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_drawer_sessions`
--

DROP TABLE IF EXISTS `cash_drawer_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_drawer_sessions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK da sessão de caixa',
  `cash_drawer_id` bigint unsigned NOT NULL COMMENT 'Caixa usado',
  `opened_by` bigint unsigned NOT NULL COMMENT 'Usuário que abriu',
  `opened_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Abertura',
  `closed_at` datetime DEFAULT NULL COMMENT 'Fechamento',
  `opening_balance` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Saldo inicial',
  `closing_balance` decimal(10,2) DEFAULT NULL COMMENT 'Saldo final',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_cds_drawer` (`cash_drawer_id`),
  KEY `fk_cds_opened_by` (`opened_by`),
  CONSTRAINT `fk_cds_drawer` FOREIGN KEY (`cash_drawer_id`) REFERENCES `cash_drawers` (`id`),
  CONSTRAINT `fk_cds_opened_by` FOREIGN KEY (`opened_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_drawer_sessions`
--

LOCK TABLES `cash_drawer_sessions` WRITE;
/*!40000 ALTER TABLE `cash_drawer_sessions` DISABLE KEYS */;
INSERT INTO `cash_drawer_sessions` VALUES (1,1,1,'2025-04-27 08:00:00',NULL,100.00,NULL,'2025-04-27 23:53:33','2025-04-27 23:53:33');
/*!40000 ALTER TABLE `cash_drawer_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_drawers`
--

DROP TABLE IF EXISTS `cash_drawers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_drawers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK do caixa',
  `branch_id` bigint unsigned NOT NULL COMMENT 'Filial onde fica',
  `identifier` varchar(50) NOT NULL COMMENT 'Alias físico/virtual',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_cash_drawers_branch` (`branch_id`),
  CONSTRAINT `fk_cash_drawers_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_drawers`
--

LOCK TABLES `cash_drawers` WRITE;
/*!40000 ALTER TABLE `cash_drawers` DISABLE KEYS */;
INSERT INTO `cash_drawers` VALUES (1,1,'Caixa Matriz','2025-04-27 23:53:31','2025-04-27 23:53:31');
/*!40000 ALTER TABLE `cash_drawers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_transactions`
--

DROP TABLE IF EXISTS `cash_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK da transação',
  `session_id` bigint unsigned NOT NULL COMMENT 'Sessão de caixa',
  `transaction_type` enum('entry','exit') NOT NULL COMMENT 'Tipo: entrada/saída',
  `amount` decimal(10,2) NOT NULL COMMENT 'Valor movimentado',
  `description` varchar(255) DEFAULT NULL COMMENT 'Descrição',
  `occurred_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Quando ocorreu',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_ct_session` (`session_id`),
  CONSTRAINT `fk_ct_session` FOREIGN KEY (`session_id`) REFERENCES `cash_drawer_sessions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_transactions`
--

LOCK TABLES `cash_transactions` WRITE;
/*!40000 ALTER TABLE `cash_transactions` DISABLE KEYS */;
INSERT INTO `cash_transactions` VALUES (1,1,'entry',11.00,'Pagamento pedido #1','2025-04-27 08:11:00','2025-04-27 23:53:34','2025-04-27 23:53:34');
/*!40000 ALTER TABLE `cash_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK do cupom',
  `code` varchar(50) NOT NULL COMMENT 'Código único',
  `discount_id` bigint unsigned NOT NULL COMMENT 'FK → discounts.id',
  `max_uses` int unsigned DEFAULT NULL COMMENT 'Limite de usos',
  `start_date` date NOT NULL COMMENT 'Início de validade',
  `end_date` date DEFAULT NULL COMMENT 'Fim de validade',
  `active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Disponível/inativo',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `fk_coupons_discount` (`discount_id`),
  CONSTRAINT `fk_coupons_discount` FOREIGN KEY (`discount_id`) REFERENCES `discounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `credit_card_transactions`
--

DROP TABLE IF EXISTS `credit_card_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_card_transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK da transação cartão',
  `payment_id` bigint unsigned NOT NULL COMMENT 'Pagamento relacionado',
  `gateway_response_code` varchar(50) DEFAULT NULL COMMENT 'Código/Status da adquirente',
  `fees_amount` decimal(10,2) DEFAULT NULL COMMENT 'Taxas cobradas',
  `status` enum('authorized','captured','failed','refunded') NOT NULL COMMENT 'Status',
  `transaction_time` datetime DEFAULT NULL COMMENT 'Quando informado',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_cct_payment` (`payment_id`),
  CONSTRAINT `fk_cct_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credit_card_transactions`
--

LOCK TABLES `credit_card_transactions` WRITE;
/*!40000 ALTER TABLE `credit_card_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `credit_card_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crm_interactions`
--

DROP TABLE IF EXISTS `crm_interactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crm_interactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK de interação CRM',
  `customer_id` bigint unsigned NOT NULL COMMENT 'Cliente envolvido',
  `interaction_type` varchar(50) NOT NULL COMMENT 'Ex: email, call',
  `channel` varchar(50) DEFAULT NULL COMMENT 'Canal (WhatsApp,SMS)',
  `interaction_date` datetime NOT NULL COMMENT 'Data/hora',
  `notes` text COMMENT 'Observações',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_crm_interactions_customer` (`customer_id`),
  CONSTRAINT `fk_crm_interactions_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crm_interactions`
--

LOCK TABLES `crm_interactions` WRITE;
/*!40000 ALTER TABLE `crm_interactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `crm_interactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_segment_memberships`
--

DROP TABLE IF EXISTS `customer_segment_memberships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_segment_memberships` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK vínculo cliente-segmento',
  `customer_id` bigint unsigned NOT NULL COMMENT 'Cliente associado',
  `segment_id` bigint unsigned NOT NULL COMMENT 'Segmento aplicado',
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Quando associado',
  PRIMARY KEY (`id`),
  KEY `fk_csm_customer` (`customer_id`),
  KEY `fk_csm_segment` (`segment_id`),
  CONSTRAINT `fk_csm_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_csm_segment` FOREIGN KEY (`segment_id`) REFERENCES `customer_segments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_segment_memberships`
--

LOCK TABLES `customer_segment_memberships` WRITE;
/*!40000 ALTER TABLE `customer_segment_memberships` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_segment_memberships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_segments`
--

DROP TABLE IF EXISTS `customer_segments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_segments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK do segmento',
  `name` varchar(100) NOT NULL COMMENT 'Nome do segmento',
  `criteria_json` json DEFAULT NULL COMMENT 'Critérios em JSON',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_segments`
--

LOCK TABLES `customer_segments` WRITE;
/*!40000 ALTER TABLE `customer_segments` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_segments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK de cliente',
  `full_name` varchar(100) NOT NULL COMMENT 'Nome completo ou razão social',
  `email` varchar(100) DEFAULT NULL COMMENT 'E-mail para contato',
  `phone` varchar(20) DEFAULT NULL COMMENT 'Telefone/WhatsApp',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'João Cliente','joao.cliente@example.com','11999990000','2025-04-27 23:53:10','2025-04-27 23:53:10'),(2,'Maria Silva','maria@email.com','(11) 99999-8888','2025-08-06 00:09:27','2025-08-06 00:09:27'),(3,'João Santos','joao@email.com','(11) 88888-7777','2025-08-06 00:09:27','2025-08-06 00:09:27'),(4,'Ana Costa','ana@email.com','(11) 77777-6666','2025-08-06 00:09:27','2025-08-06 00:09:27');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discounts`
--

DROP TABLE IF EXISTS `discounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK do desconto',
  `name` varchar(100) NOT NULL COMMENT 'Nome da promoção',
  `discount_type` enum('percentage','fixed') NOT NULL COMMENT 'Tipo de desconto',
  `amount` decimal(10,2) NOT NULL COMMENT 'Valor percentual/fixo',
  `start_date` date NOT NULL COMMENT 'Início de vigência',
  `end_date` date DEFAULT NULL COMMENT 'Fim de vigência',
  `active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Ativo/inativo',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discounts`
--

LOCK TABLES `discounts` WRITE;
/*!40000 ALTER TABLE `discounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `discounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK de funcionário/garçom',
  `user_id` bigint unsigned DEFAULT NULL COMMENT 'FK opcional → users.id',
  `branch_id` bigint unsigned NOT NULL COMMENT 'Filial onde trabalha',
  `full_name` varchar(100) NOT NULL COMMENT 'Nome completo',
  `position` varchar(50) DEFAULT NULL COMMENT 'Cargo/função',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_employees_user` (`user_id`),
  KEY `fk_employees_branch` (`branch_id`),
  CONSTRAINT `fk_employees_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_employees_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,2,1,'Carlos Silva','Garçom','2025-04-27 23:53:05','2025-04-27 23:53:05');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluation_surveys`
--

DROP TABLE IF EXISTS `evaluation_surveys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluation_surveys` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK da pesquisa',
  `title` varchar(100) NOT NULL COMMENT 'Título',
  `description` text COMMENT 'Descrição',
  `active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Disponível',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluation_surveys`
--

LOCK TABLES `evaluation_surveys` WRITE;
/*!40000 ALTER TABLE `evaluation_surveys` DISABLE KEYS */;
/*!40000 ALTER TABLE `evaluation_surveys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kitchen_ticket_items`
--

DROP TABLE IF EXISTS `kitchen_ticket_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kitchen_ticket_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK do item de comanda',
  `kitchen_ticket_id` bigint unsigned NOT NULL COMMENT 'Comanda pai',
  `order_item_id` bigint unsigned NOT NULL COMMENT 'Item original do pedido',
  `preparation_status` enum('pending','preparing','done') NOT NULL DEFAULT 'pending' COMMENT 'Status de preparo',
  `prepared_at` datetime DEFAULT NULL COMMENT 'Quando pronto',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_kt_items_ticket` (`kitchen_ticket_id`),
  KEY `fk_kt_items_order_item` (`order_item_id`),
  CONSTRAINT `fk_kt_items_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`),
  CONSTRAINT `fk_kt_items_ticket` FOREIGN KEY (`kitchen_ticket_id`) REFERENCES `kitchen_tickets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kitchen_ticket_items`
--

LOCK TABLES `kitchen_ticket_items` WRITE;
/*!40000 ALTER TABLE `kitchen_ticket_items` DISABLE KEYS */;
INSERT INTO `kitchen_ticket_items` VALUES (1,1,1,'pending',NULL,'2025-04-27 23:53:27','2025-04-27 23:53:27');
/*!40000 ALTER TABLE `kitchen_ticket_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kitchen_tickets`
--

DROP TABLE IF EXISTS `kitchen_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kitchen_tickets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK da comanda',
  `order_id` bigint unsigned NOT NULL COMMENT 'Pedido associado',
  `sent_at` datetime DEFAULT NULL COMMENT 'Enviada à cozinha em',
  `status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Estado',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_kitchen_tickets_order` (`order_id`),
  CONSTRAINT `fk_kitchen_tickets_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kitchen_tickets`
--

LOCK TABLES `kitchen_tickets` WRITE;
/*!40000 ALTER TABLE `kitchen_tickets` DISABLE KEYS */;
INSERT INTO `kitchen_tickets` VALUES (1,1,'2025-04-27 08:06:00','pending','2025-04-27 23:53:25','2025-04-27 23:53:25');
/*!40000 ALTER TABLE `kitchen_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loyalty_memberships`
--

DROP TABLE IF EXISTS `loyalty_memberships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyalty_memberships` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK vínculo cliente-programa',
  `customer_id` bigint unsigned NOT NULL COMMENT 'Cliente participante',
  `program_id` bigint unsigned NOT NULL COMMENT 'Programa associado',
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de adesão',
  `status` enum('active','cancelled') NOT NULL DEFAULT 'active' COMMENT 'Estado',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_lm_customer` (`customer_id`),
  KEY `fk_lm_program` (`program_id`),
  CONSTRAINT `fk_lm_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_lm_program` FOREIGN KEY (`program_id`) REFERENCES `loyalty_programs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_memberships`
--

LOCK TABLES `loyalty_memberships` WRITE;
/*!40000 ALTER TABLE `loyalty_memberships` DISABLE KEYS */;
/*!40000 ALTER TABLE `loyalty_memberships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loyalty_points`
--

DROP TABLE IF EXISTS `loyalty_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyalty_points` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK lançamento de pontos',
  `membership_id` bigint unsigned NOT NULL COMMENT 'Ficha de fidelidade',
  `order_id` bigint unsigned DEFAULT NULL COMMENT 'Pedido gerador',
  `points_earned` int NOT NULL DEFAULT '0' COMMENT 'Ganhos',
  `points_redeemed` int NOT NULL DEFAULT '0' COMMENT 'Resgatados',
  `points_balance` int NOT NULL DEFAULT '0' COMMENT 'Saldo',
  `recorded_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Registro em',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_lp_membership` (`membership_id`),
  KEY `fk_lp_order` (`order_id`),
  CONSTRAINT `fk_lp_membership` FOREIGN KEY (`membership_id`) REFERENCES `loyalty_memberships` (`id`),
  CONSTRAINT `fk_lp_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_points`
--

LOCK TABLES `loyalty_points` WRITE;
/*!40000 ALTER TABLE `loyalty_points` DISABLE KEYS */;
/*!40000 ALTER TABLE `loyalty_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loyalty_programs`
--

DROP TABLE IF EXISTS `loyalty_programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyalty_programs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK do programa de fidelidade',
  `name` varchar(100) NOT NULL COMMENT 'Nome do programa',
  `description` text COMMENT 'Regras gerais',
  `point_multiplier` decimal(5,2) NOT NULL DEFAULT '1.00' COMMENT 'Fator de pontos',
  `start_date` date NOT NULL COMMENT 'Início',
  `end_date` date DEFAULT NULL COMMENT 'Fim (NULL = indefinido)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_programs`
--

LOCK TABLES `loyalty_programs` WRITE;
/*!40000 ALTER TABLE `loyalty_programs` DISABLE KEYS */;
/*!40000 ALTER TABLE `loyalty_programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_commissions`
--

DROP TABLE IF EXISTS `order_commissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_commissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK registro comissão',
  `order_id` bigint unsigned NOT NULL COMMENT 'Pedido gerador',
  `employee_id` bigint unsigned NOT NULL COMMENT 'Garçom atendente',
  `commission_percentage` decimal(5,2) NOT NULL COMMENT 'Taxa aplicada',
  `commission_amount` decimal(10,2) NOT NULL COMMENT 'Valor calculado',
  `calculated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Quando calculado',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_oc_order` (`order_id`),
  KEY `fk_oc_employee` (`employee_id`),
  CONSTRAINT `fk_oc_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  CONSTRAINT `fk_oc_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_commissions`
--

LOCK TABLES `order_commissions` WRITE;
/*!40000 ALTER TABLE `order_commissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_commissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK do item de pedido',
  `order_id` bigint unsigned NOT NULL COMMENT 'Pedido pai',
  `product_id` bigint unsigned NOT NULL COMMENT 'Produto solicitado',
  `quantity` int unsigned NOT NULL DEFAULT '1' COMMENT 'Quantidade',
  `unit_price` decimal(10,2) NOT NULL COMMENT 'Preço unitário aplicado',
  `total_price` decimal(10,2) NOT NULL COMMENT 'unit_price * quantity',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_order_items_order` (`order_id`),
  KEY `fk_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,2,5.50,11.00,'2025-04-27 23:53:23','2025-04-27 23:53:23');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_notes`
--

DROP TABLE IF EXISTS `order_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_notes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL COMMENT 'FK → orders.id',
  `note` text NOT NULL COMMENT 'Texto da observação/nota',
  `type` enum('general','status_change','kitchen','waiter','customer') NOT NULL DEFAULT 'general' COMMENT 'Tipo da observação',
  `created_by` bigint unsigned NOT NULL COMMENT 'FK → users.id (usuário que criou a nota)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data/hora de criação',
  PRIMARY KEY (`id`),
  KEY `fk_order_notes_order` (`order_id`),
  KEY `fk_order_notes_user` (`created_by`),
  KEY `idx_order_notes_created_at` (`created_at`),
  KEY `idx_order_notes_type` (`type`),
  CONSTRAINT `fk_order_notes_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_notes_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Observações e notas sobre pedidos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_notes`
--

LOCK TABLES `order_notes` WRITE;
/*!40000 ALTER TABLE `order_notes` DISABLE KEYS */;
INSERT INTO `order_notes` VALUES (1,1,'Cliente solicitou que o hambúrguer seja bem passado','customer',1,'2025-09-02 22:43:44');
/*!40000 ALTER TABLE `order_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK do pedido',
  `customer_id` bigint unsigned DEFAULT NULL COMMENT 'Cliente (balcão ou mesa)',
  `table_id` bigint unsigned DEFAULT NULL COMMENT 'Mesa (se aplicável)',
  `waiter_session_id` bigint unsigned DEFAULT NULL COMMENT 'Sessão do garçom',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Valor total',
  `status` enum('open','in_preparation','served','closed','cancelled') NOT NULL DEFAULT 'open' COMMENT 'Estado',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_orders_customer` (`customer_id`),
  KEY `fk_orders_table` (`table_id`),
  KEY `fk_orders_waiter_session` (`waiter_session_id`),
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_orders_table` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`),
  CONSTRAINT `fk_orders_waiter_session` FOREIGN KEY (`waiter_session_id`) REFERENCES `waiter_sessions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,1,1,11.00,'closed','2025-04-27 23:53:19','2025-04-27 23:53:19');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK do método de pagamento',
  `name` varchar(50) NOT NULL COMMENT 'Ex: cash, credit_card, pix',
  `description` varchar(255) DEFAULT NULL COMMENT 'Descrição',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_methods`
--

LOCK TABLES `payment_methods` WRITE;
/*!40000 ALTER TABLE `payment_methods` DISABLE KEYS */;
INSERT INTO `payment_methods` VALUES (1,'cash','Dinheiro','2025-04-27 23:53:28','2025-04-27 23:53:28');
/*!40000 ALTER TABLE `payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK do pagamento',
  `order_id` bigint unsigned NOT NULL COMMENT 'Pedido pago',
  `payment_method_id` bigint unsigned NOT NULL COMMENT 'Método utilizado',
  `amount` decimal(10,2) NOT NULL COMMENT 'Valor pago',
  `paid_at` datetime NOT NULL COMMENT 'Quando pago',
  `operator_id` bigint unsigned DEFAULT NULL COMMENT 'Usuário que registrou',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_payments_order` (`order_id`),
  KEY `fk_payments_method` (`payment_method_id`),
  KEY `fk_payments_operator` (`operator_id`),
  CONSTRAINT `fk_payments_method` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`),
  CONSTRAINT `fk_payments_operator` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,1,11.00,'2025-04-27 08:10:00',1,'2025-04-27 23:53:30','2025-04-27 23:53:30');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK categoria',
  `name` varchar(100) NOT NULL COMMENT 'Nome da categoria',
  `description` varchar(255) DEFAULT NULL COMMENT 'Descrição',
  `display_order` int unsigned NOT NULL DEFAULT '0' COMMENT 'Ordem em listagens',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (1,'Bebidas','Refrigerantes e sucos diversos',1,'2025-04-27 23:53:14','2025-04-27 23:53:14'),(2,'Comidas','Pratos principais e petiscos',2,'2025-08-05 23:59:28','2025-08-05 23:59:28'),(3,'Sobremesas','Doces e sobremesas',3,'2025-08-06 00:10:21','2025-08-06 00:10:21'),(4,'Acompanhamentos','Acompanhamentos para pratos',4,'2025-08-06 00:10:21','2025-08-06 00:10:21');
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_prices`
--

DROP TABLE IF EXISTS `product_prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_prices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK de preço',
  `product_id` bigint unsigned NOT NULL COMMENT 'Produto referenciado',
  `price` decimal(10,2) NOT NULL COMMENT 'Preço de venda',
  `start_date` date NOT NULL COMMENT 'Início de vigência',
  `end_date` date DEFAULT NULL COMMENT 'Fim de vigência (NULL = atual)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_product_prices_product` (`product_id`),
  CONSTRAINT `fk_product_prices_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_prices`
--

LOCK TABLES `product_prices` WRITE;
/*!40000 ALTER TABLE `product_prices` DISABLE KEYS */;
INSERT INTO `product_prices` VALUES (1,1,5.50,'2025-01-01',NULL,'2025-04-27 23:53:17','2025-04-27 23:53:17'),(3,3,15.00,'2025-08-06',NULL,'2025-08-06 00:00:01','2025-08-06 00:00:01'),(4,4,8.50,'2025-08-06',NULL,'2025-08-06 00:08:43','2025-08-06 00:08:43'),(5,5,3.00,'2025-08-06',NULL,'2025-08-06 00:08:43','2025-08-06 00:08:43'),(6,6,12.00,'2025-08-06',NULL,'2025-08-06 00:08:43','2025-08-06 00:08:43'),(7,7,15.50,'2025-08-06',NULL,'2025-08-06 00:08:43','2025-08-06 00:08:43'),(8,8,6.50,'2025-08-06',NULL,'2025-08-06 00:10:40','2025-08-06 00:10:40'),(9,9,8.00,'2025-08-06',NULL,'2025-08-06 00:10:40','2025-08-06 00:10:40'),(10,10,4.00,'2025-08-06',NULL,'2025-08-06 00:10:40','2025-08-06 00:10:40'),(11,11,5.50,'2025-08-06',NULL,'2025-08-06 00:10:40','2025-08-06 00:10:40');
/*!40000 ALTER TABLE `product_prices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK do produto',
  `category_id` bigint unsigned NOT NULL COMMENT 'Categoria principal',
  `name` varchar(100) NOT NULL COMMENT 'Nome do item/cardápio',
  `description` text COMMENT 'Descrição detalhada',
  `sku` varchar(50) DEFAULT NULL COMMENT 'Código interno',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active' COMMENT 'Disponibilidade',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Coca-Cola 350ml','Refrigerante em lata','COCA350','active','2025-04-27 23:53:16','2025-04-27 23:53:16'),(3,2,'Hambúrguer Simples','Pão, carne, alface, tomate','HAMB001','active','2025-08-05 23:59:36','2025-08-05 23:59:36'),(4,1,'Suco de Laranja','Suco natural de laranja 300ml','SUCO001','active','2025-08-06 00:06:20','2025-08-06 00:06:20'),(5,1,'Água Mineral','Água mineral 500ml','AGUA001','active','2025-08-06 00:06:20','2025-08-06 00:06:20'),(6,2,'Batata Frita','Porção de batatas fritas crocantes','BATATA001','active','2025-08-06 00:06:20','2025-08-06 00:06:20'),(7,2,'X-Burger','Hambúrguer com queijo, alface, tomate','XBURGER001','active','2025-08-06 00:06:20','2025-08-06 00:06:20'),(8,3,'Pudim de Leite','Pudim de leite condensado','PUDIM001','active','2025-08-06 00:10:33','2025-08-06 00:10:33'),(9,3,'Sorvete de Chocolate','Sorvete artesanal de chocolate','SORVETE001','active','2025-08-06 00:10:33','2025-08-06 00:10:33'),(10,4,'Arroz Branco','Arroz branco soltinho','ARROZ001','active','2025-08-06 00:10:33','2025-08-06 00:10:33'),(11,4,'Feijão Preto','Feijão preto temperado','FEIJAO001','active','2025-08-06 00:10:33','2025-08-06 00:10:33');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qr_codes`
--

DROP TABLE IF EXISTS `qr_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qr_codes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK do QR code',
  `code` varchar(100) NOT NULL COMMENT 'Hash/UUID gerado',
  `type` enum('menu','evaluation') NOT NULL COMMENT 'Uso do QR',
  `target_id` bigint unsigned DEFAULT NULL COMMENT 'Ex: order_id',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `expires_at` datetime DEFAULT NULL COMMENT 'Validade opcional',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qr_codes`
--

LOCK TABLES `qr_codes` WRITE;
/*!40000 ALTER TABLE `qr_codes` DISABLE KEYS */;
/*!40000 ALTER TABLE `qr_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK de perfil/permissão',
  `name` varchar(50) NOT NULL COMMENT 'Nome único do perfil (ex: admin, waiter)',
  `description` varchar(255) DEFAULT NULL COMMENT 'Descrição do papel',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','Administrador do sistema','2025-04-27 23:53:00','2025-04-27 23:53:00'),(2,'waiter','Garçom','2025-04-27 23:53:00','2025-04-27 23:53:00');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `table_reservations`
--

DROP TABLE IF EXISTS `table_reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `table_reservations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK de reserva',
  `customer_id` bigint unsigned NOT NULL COMMENT 'Quem reservou',
  `table_id` bigint unsigned NOT NULL COMMENT 'Qual mesa',
  `reservation_time` datetime NOT NULL COMMENT 'Data/hora agendada',
  `status` enum('booked','seated','cancelled') NOT NULL DEFAULT 'booked' COMMENT 'Estado da reserva',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_reservations_customer` (`customer_id`),
  KEY `fk_reservations_table` (`table_id`),
  CONSTRAINT `fk_reservations_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_reservations_table` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `table_reservations`
--

LOCK TABLES `table_reservations` WRITE;
/*!40000 ALTER TABLE `table_reservations` DISABLE KEYS */;
/*!40000 ALTER TABLE `table_reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tables`
--

DROP TABLE IF EXISTS `tables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tables` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK da mesa',
  `branch_id` bigint unsigned NOT NULL COMMENT 'Filial onde a mesa está',
  `table_number` varchar(10) NOT NULL COMMENT 'Identificador (ex: A1, 10)',
  `capacity` int unsigned NOT NULL COMMENT 'Pessoas máximas',
  `status` enum('available','occupied','reserved') NOT NULL DEFAULT 'available' COMMENT 'Estado atual',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_tables_branch` (`branch_id`),
  CONSTRAINT `fk_tables_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tables`
--

LOCK TABLES `tables` WRITE;
/*!40000 ALTER TABLE `tables` DISABLE KEYS */;
INSERT INTO `tables` VALUES (1,1,'Mesa 1',4,'available','2025-04-27 23:53:12','2025-04-27 23:53:12'),(2,1,'2',4,'available','2025-08-06 00:09:45','2025-08-06 00:09:45'),(3,1,'3',6,'available','2025-08-06 00:09:45','2025-08-06 00:09:45'),(4,1,'4',2,'available','2025-08-06 00:09:45','2025-08-06 00:09:45'),(5,1,'5',8,'available','2025-08-06 00:09:45','2025-08-06 00:09:45');
/*!40000 ALTER TABLE `tables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tax_rates`
--

DROP TABLE IF EXISTS `tax_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tax_rates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK da alíquota',
  `name` varchar(50) NOT NULL COMMENT 'Ex: ISS, ICMS',
  `rate` decimal(5,2) NOT NULL COMMENT 'Percentual',
  `start_date` date NOT NULL COMMENT 'Início de vigência',
  `end_date` date DEFAULT NULL COMMENT 'Fim de vigência',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax_rates`
--

LOCK TABLES `tax_rates` WRITE;
/*!40000 ALTER TABLE `tax_rates` DISABLE KEYS */;
INSERT INTO `tax_rates` VALUES (1,'ICMS',18.00,'2025-01-01',NULL,'2025-04-27 23:53:54','2025-04-27 23:53:54');
/*!40000 ALTER TABLE `tax_rates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` bigint unsigned NOT NULL COMMENT 'FK → users.id',
  `role_id` bigint unsigned NOT NULL COMMENT 'FK → roles.id',
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Quando recebeu o perfil',
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `fk_user_roles_role` (`role_id`),
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1,'2025-04-27 23:53:03'),(2,2,'2025-04-27 23:53:03');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK do usuário do sistema',
  `username` varchar(50) NOT NULL COMMENT 'Login de acesso',
  `password_hash` varchar(255) NOT NULL COMMENT 'Hash da senha',
  `email` varchar(100) NOT NULL COMMENT 'E-mail de login',
  `branch_id` bigint unsigned NOT NULL COMMENT 'Filial associada',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `fk_users_branch` (`branch_id`),
  CONSTRAINT `fk_users_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$OIhONLh1pccAAMd4oh2xReNsZkQbZB4W58jzVEonvkeJrm0ukWzhC','admin@empresa.com',1,'2025-04-27 23:53:02','2025-08-05 23:39:29'),(2,'garcom','hash_waiter','garcom@empresa.com',1,'2025-04-27 23:53:02','2025-04-27 23:53:02');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `waiter_commission_settings`
--

DROP TABLE IF EXISTS `waiter_commission_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `waiter_commission_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK config comissão',
  `employee_id` bigint unsigned NOT NULL COMMENT 'Garçom associado',
  `percentage` decimal(5,2) NOT NULL COMMENT 'Percentual (%)',
  `valid_from` date NOT NULL COMMENT 'Início de vigência',
  `valid_to` date DEFAULT NULL COMMENT 'Fim (NULL = indefinido)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_wcs_employee` (`employee_id`),
  CONSTRAINT `fk_wcs_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `waiter_commission_settings`
--

LOCK TABLES `waiter_commission_settings` WRITE;
/*!40000 ALTER TABLE `waiter_commission_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `waiter_commission_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `waiter_devices`
--

DROP TABLE IF EXISTS `waiter_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `waiter_devices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK do dispositivo do garçom',
  `employee_id` bigint unsigned NOT NULL COMMENT 'Garçom proprietário',
  `device_uuid` varchar(100) NOT NULL COMMENT 'UUID do app/dispositivo',
  `registered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Quando cadastrado',
  PRIMARY KEY (`id`),
  KEY `fk_wd_employee` (`employee_id`),
  CONSTRAINT `fk_wd_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `waiter_devices`
--

LOCK TABLES `waiter_devices` WRITE;
/*!40000 ALTER TABLE `waiter_devices` DISABLE KEYS */;
INSERT INTO `waiter_devices` VALUES (1,1,'uuid-waiter-1','2025-04-27 08:00:00');
/*!40000 ALTER TABLE `waiter_devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `waiter_sessions`
--

DROP TABLE IF EXISTS `waiter_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `waiter_sessions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK da sessão do garçom',
  `employee_id` bigint unsigned NOT NULL COMMENT 'Garçom que fez login',
  `device_id` bigint unsigned NOT NULL COMMENT 'Dispositivo usado',
  `logged_in_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Login em',
  `logged_out_at` datetime DEFAULT NULL COMMENT 'Logout em',
  PRIMARY KEY (`id`),
  KEY `fk_ws_employee` (`employee_id`),
  KEY `fk_ws_device` (`device_id`),
  CONSTRAINT `fk_ws_device` FOREIGN KEY (`device_id`) REFERENCES `waiter_devices` (`id`),
  CONSTRAINT `fk_ws_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `waiter_sessions`
--

LOCK TABLES `waiter_sessions` WRITE;
/*!40000 ALTER TABLE `waiter_sessions` DISABLE KEYS */;
INSERT INTO `waiter_sessions` VALUES (1,1,1,'2025-04-27 08:05:00',NULL);
/*!40000 ALTER TABLE `waiter_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'cardapio'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-02 22:46:36
