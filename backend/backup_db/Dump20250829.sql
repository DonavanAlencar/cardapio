-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: cardapio
-- ------------------------------------------------------
-- Server version	8.0.43

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
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES (1,'Filial Matriz','Rua Principal, 100','2025-07-10 16:54:52','2025-07-10 16:54:52'),(2,'Filial Centro','Av. Central, 200','2025-08-26 16:26:35','2025-08-26 16:26:35'),(3,'Filial Zona Sul','Rua das Palmeiras, 45','2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_drawer_sessions`
--

DROP TABLE IF EXISTS `cash_drawer_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_drawer_sessions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cash_drawer_id` bigint unsigned NOT NULL,
  `opened_by` bigint unsigned NOT NULL,
  `opened_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `closed_at` datetime DEFAULT NULL,
  `opening_balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `closing_balance` decimal(10,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_cds_drawer` (`cash_drawer_id`),
  KEY `fk_cds_opened_by` (`opened_by`),
  CONSTRAINT `fk_cds_drawer` FOREIGN KEY (`cash_drawer_id`) REFERENCES `cash_drawers` (`id`),
  CONSTRAINT `fk_cds_opened_by` FOREIGN KEY (`opened_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_drawer_sessions`
--

LOCK TABLES `cash_drawer_sessions` WRITE;
/*!40000 ALTER TABLE `cash_drawer_sessions` DISABLE KEYS */;
INSERT INTO `cash_drawer_sessions` VALUES (1,1,1,'2025-07-10 16:54:52',NULL,100.00,NULL,'2025-07-10 16:54:52','2025-07-10 16:54:52'),(2,2,1,'2025-08-26 16:26:35',NULL,150.00,NULL,'2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `cash_drawer_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_drawers`
--

DROP TABLE IF EXISTS `cash_drawers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_drawers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `branch_id` bigint unsigned NOT NULL,
  `identifier` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_cash_drawers_branch` (`branch_id`),
  CONSTRAINT `fk_cash_drawers_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_drawers`
--

LOCK TABLES `cash_drawers` WRITE;
/*!40000 ALTER TABLE `cash_drawers` DISABLE KEYS */;
INSERT INTO `cash_drawers` VALUES (1,1,'Caixa Principal','2025-07-10 16:54:52','2025-07-10 16:54:52'),(2,2,'Caixa Secundário','2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `cash_drawers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_transactions`
--

DROP TABLE IF EXISTS `cash_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `session_id` bigint unsigned NOT NULL,
  `transaction_type` enum('entry','exit') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `occurred_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ct_session` (`session_id`),
  CONSTRAINT `fk_ct_session` FOREIGN KEY (`session_id`) REFERENCES `cash_drawer_sessions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_transactions`
--

LOCK TABLES `cash_transactions` WRITE;
/*!40000 ALTER TABLE `cash_transactions` DISABLE KEYS */;
INSERT INTO `cash_transactions` VALUES (1,1,'entry',0.00,'Abertura de caixa','2025-07-10 16:54:52','2025-07-10 16:54:52','2025-07-10 16:54:52'),(2,2,'entry',200.00,'Troco inicial extra','2025-08-26 16:26:35','2025-08-26 16:26:35','2025-08-26 16:26:35'),(3,2,'exit',50.00,'Sangria parcial','2025-08-26 16:26:35','2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `cash_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracoes`
--

DROP TABLE IF EXISTS `configuracoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracoes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `percentual_comissao` decimal(5,2) NOT NULL DEFAULT '10.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracoes`
--

LOCK TABLES `configuracoes` WRITE;
/*!40000 ALTER TABLE `configuracoes` DISABLE KEYS */;
INSERT INTO `configuracoes` VALUES (1,10.00,'2025-08-05 21:36:14','2025-08-05 21:36:14');
/*!40000 ALTER TABLE `configuracoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `discount_id` bigint unsigned NOT NULL,
  `max_uses` int unsigned DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `fk_coupons_discount` (`discount_id`),
  CONSTRAINT `fk_coupons_discount` FOREIGN KEY (`discount_id`) REFERENCES `discounts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,'VERAO10',1,100,'2025-07-01','2025-09-01',1,'2025-08-01 12:26:05','2025-08-01 12:26:05'),(2,'FIXO5',2,50,'2025-07-15','2025-08-15',1,'2025-08-01 12:26:05','2025-08-01 12:26:05'),(3,'CLIENTE15',3,200,'2025-09-01','2025-09-30',1,'2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'João da Silva','joao.silva@example.com','11999990000','2025-07-10 16:54:52','2025-07-10 16:54:52'),(2,'Mariana Costa','mariana.costa@example.com','21988887777','2025-08-01 12:26:05','2025-08-01 12:26:05'),(3,'Pedro Oliveira','pedro.oliveira@example.com','21977776666','2025-08-01 12:26:05','2025-08-01 12:26:05'),(4,'Luiza Martins','luiza.martins@example.com','11988880001','2025-08-26 16:26:35','2025-08-26 16:26:35'),(5,'Rafael Souza','rafael.souza@example.com','11988880002','2025-08-26 16:26:35','2025-08-26 16:26:35'),(6,'Bianca Alves','bianca.alves@example.com','21977770003','2025-08-26 16:26:35','2025-08-26 16:26:35'),(7,'Carlos Eduardo','cadu@example.com','11966660004','2025-08-26 16:26:35','2025-08-26 16:26:35'),(8,'Julia Lima','julia.lima@example.com','21955550005','2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discounts`
--

DROP TABLE IF EXISTS `discounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `discount_type` enum('percentage','fixed') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discounts`
--

LOCK TABLES `discounts` WRITE;
/*!40000 ALTER TABLE `discounts` DISABLE KEYS */;
INSERT INTO `discounts` VALUES (1,'Promo Verão','percentage',10.00,'2025-07-01','2025-09-01',1,'2025-08-01 12:26:05','2025-08-01 12:26:05'),(2,'Desconto Fixo R$5','fixed',5.00,'2025-07-15','2025-08-15',1,'2025-08-01 12:26:05','2025-08-01 12:26:05'),(3,'Semana do Cliente 15%','percentage',15.00,'2025-09-01','2025-09-30',1,'2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `discounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `branch_id` bigint unsigned NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `position` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_employees_user` (`user_id`),
  KEY `fk_employees_branch` (`branch_id`),
  CONSTRAINT `fk_employees_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `fk_employees_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,2,1,'Carlos Silva','Garçom','2025-07-10 16:54:52','2025-07-10 16:54:52'),(2,4,2,'Ana Pereira','Garçonete','2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estoque_movimentos`
--

DROP TABLE IF EXISTS `estoque_movimentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estoque_movimentos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ingrediente_id` bigint unsigned NOT NULL,
  `tipo_movimento` enum('ENTRADA','SAIDA') NOT NULL,
  `quantidade` decimal(10,2) NOT NULL,
  `referencia` varchar(100) DEFAULT NULL,
  `ocorrido_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_em_ingrediente` (`ingrediente_id`),
  CONSTRAINT `fk_em_ingrediente` FOREIGN KEY (`ingrediente_id`) REFERENCES `ingredientes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estoque_movimentos`
--

LOCK TABLES `estoque_movimentos` WRITE;
/*!40000 ALTER TABLE `estoque_movimentos` DISABLE KEYS */;
INSERT INTO `estoque_movimentos` VALUES (1,1,'ENTRADA',10.00,'Stock Inicial','2025-07-10 16:54:52'),(2,2,'ENTRADA',50.00,'Stock Inicial','2025-07-10 16:54:52'),(3,3,'ENTRADA',5.00,'Stock Inicial','2025-07-10 16:54:52'),(4,4,'ENTRADA',20.00,'Stock Inicial','2025-07-10 16:54:52'),(5,5,'ENTRADA',3.00,'Stock Inicial','2025-07-10 16:54:52'),(6,6,'ENTRADA',2.50,'Seed inicial','2025-08-26 16:26:35'),(7,7,'ENTRADA',6.00,'Seed inicial','2025-08-26 16:26:35'),(8,8,'ENTRADA',25.00,'Seed inicial','2025-08-26 16:26:35'),(9,9,'ENTRADA',3.50,'Seed inicial','2025-08-26 16:26:35'),(10,10,'ENTRADA',12.00,'Seed inicial','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `estoque_movimentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingredientes`
--

DROP TABLE IF EXISTS `ingredientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredientes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `unidade_medida` varchar(20) NOT NULL,
  `quantidade_estoque` decimal(10,2) NOT NULL,
  `quantidade_minima` decimal(10,2) NOT NULL DEFAULT '0.00',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredientes`
--

LOCK TABLES `ingredientes` WRITE;
/*!40000 ALTER TABLE `ingredientes` DISABLE KEYS */;
INSERT INTO `ingredientes` VALUES (1,'Carne','kg',10.00,1.00,1,'2025-07-10 16:54:52','2025-07-10 16:54:52'),(2,'Pão','unidade',50.00,10.00,1,'2025-07-10 16:54:52','2025-07-10 16:54:52'),(3,'Queijo','kg',5.00,0.50,1,'2025-07-10 16:54:52','2025-07-10 16:54:52'),(4,'Gelo','kg',20.00,5.00,1,'2025-07-10 16:54:52','2025-07-10 16:54:52'),(5,'Alface','kg',3.00,0.50,1,'2025-07-10 16:54:52','2025-07-10 16:54:52'),(6,'Bacon','kg',2.50,0.20,1,'2025-08-26 16:26:35','2025-08-26 16:26:35'),(7,'Tomate','kg',6.00,0.50,1,'2025-08-26 16:26:35','2025-08-26 16:26:35'),(8,'Batata','kg',25.00,2.00,1,'2025-08-26 16:26:35','2025-08-26 16:26:35'),(9,'Chocolate','kg',3.50,0.20,1,'2025-08-26 16:26:35','2025-08-26 16:26:35'),(10,'Laranja','kg',12.00,1.00,1,'2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `ingredientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kitchen_ticket_items`
--

DROP TABLE IF EXISTS `kitchen_ticket_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kitchen_ticket_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `kitchen_ticket_id` bigint unsigned NOT NULL,
  `order_item_id` bigint unsigned NOT NULL,
  `preparation_status` enum('pending','preparing','done') NOT NULL DEFAULT 'pending',
  `prepared_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_kt_items_ticket` (`kitchen_ticket_id`),
  KEY `fk_kt_items_order_item` (`order_item_id`),
  CONSTRAINT `fk_kt_items_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`),
  CONSTRAINT `fk_kt_items_ticket` FOREIGN KEY (`kitchen_ticket_id`) REFERENCES `kitchen_tickets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kitchen_ticket_items`
--

LOCK TABLES `kitchen_ticket_items` WRITE;
/*!40000 ALTER TABLE `kitchen_ticket_items` DISABLE KEYS */;
INSERT INTO `kitchen_ticket_items` VALUES (1,1,1,'pending',NULL,'2025-08-01 12:32:40','2025-08-01 12:32:40'),(2,1,2,'pending',NULL,'2025-08-01 12:32:40','2025-08-01 12:32:40'),(3,1,3,'pending',NULL,'2025-08-01 12:32:40','2025-08-01 12:32:40'),(4,2,2,'pending',NULL,'2025-08-01 12:32:40','2025-08-01 12:32:40'),(5,2,3,'pending',NULL,'2025-08-01 12:32:40','2025-08-01 12:32:40'),(6,1,1,'pending',NULL,'2025-08-05 22:02:49','2025-08-05 22:02:49'),(7,2,2,'preparing',NULL,'2025-08-05 22:02:49','2025-08-05 22:02:49'),(8,5,12,'done','2025-08-26 16:26:35','2025-08-26 16:26:35','2025-08-26 16:26:35'),(9,5,13,'done','2025-08-26 16:26:35','2025-08-26 16:26:35','2025-08-26 16:26:35'),(10,6,14,'preparing',NULL,'2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `kitchen_ticket_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kitchen_tickets`
--

DROP TABLE IF EXISTS `kitchen_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kitchen_tickets` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `sent_at` datetime DEFAULT NULL,
  `status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_kitchen_tickets_order` (`order_id`),
  CONSTRAINT `fk_kitchen_tickets_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kitchen_tickets`
--

LOCK TABLES `kitchen_tickets` WRITE;
/*!40000 ALTER TABLE `kitchen_tickets` DISABLE KEYS */;
INSERT INTO `kitchen_tickets` VALUES (1,1,NULL,'pending','2025-08-01 12:32:40','2025-08-01 12:32:40'),(2,2,NULL,'pending','2025-08-01 12:32:40','2025-08-01 12:32:40'),(3,1,'2025-08-05 22:02:49','pending','2025-08-05 22:02:49','2025-08-05 22:02:49'),(4,1,'2025-08-05 22:02:49','pending','2025-08-05 22:02:49','2025-08-05 22:02:49'),(5,6,'2025-08-26 16:26:35','completed','2025-08-26 16:26:35','2025-08-26 16:26:35'),(6,7,'2025-08-26 16:26:35','in_progress','2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `kitchen_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loyalty_memberships`
--

DROP TABLE IF EXISTS `loyalty_memberships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyalty_memberships` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `program_id` bigint unsigned NOT NULL,
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_lm_customer` (`customer_id`),
  KEY `fk_lm_program` (`program_id`),
  CONSTRAINT `fk_lm_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_lm_program` FOREIGN KEY (`program_id`) REFERENCES `loyalty_programs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_memberships`
--

LOCK TABLES `loyalty_memberships` WRITE;
/*!40000 ALTER TABLE `loyalty_memberships` DISABLE KEYS */;
INSERT INTO `loyalty_memberships` VALUES (1,1,1,'2025-08-01 12:26:06','2025-08-01 12:26:06','2025-08-01 12:26:06'),(2,2,2,'2025-08-01 12:26:06','2025-08-01 12:26:06','2025-08-01 12:26:06'),(3,4,3,'2025-08-26 16:26:35','2025-08-26 16:26:35','2025-08-26 16:26:35'),(4,5,3,'2025-08-26 16:26:35','2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `loyalty_memberships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loyalty_programs`
--

DROP TABLE IF EXISTS `loyalty_programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyalty_programs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `point_multiplier` decimal(5,2) NOT NULL DEFAULT '1.00',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_programs`
--

LOCK TABLES `loyalty_programs` WRITE;
/*!40000 ALTER TABLE `loyalty_programs` DISABLE KEYS */;
INSERT INTO `loyalty_programs` VALUES (1,'Programa Bronze','Acumula 1x pontos nos pedidos',1.00,'2025-01-01','2026-01-01','2025-08-01 12:26:05','2025-08-01 12:26:05'),(2,'Programa Prata','Acumula 1.5x pontos nos pedidos',1.50,'2025-01-01','2026-01-01','2025-08-01 12:26:05','2025-08-01 12:26:05'),(3,'Programa Ouro','2x pontos nos pedidos',2.00,'2025-01-01','2026-01-01','2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `loyalty_programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_item_modifiers`
--

DROP TABLE IF EXISTS `order_item_modifiers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_item_modifiers` (
  `order_item_id` bigint unsigned NOT NULL,
  `modifier_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`order_item_id`,`modifier_id`),
  KEY `fk_oim_modifier` (`modifier_id`),
  CONSTRAINT `fk_oim_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`),
  CONSTRAINT `fk_oim_modifier` FOREIGN KEY (`modifier_id`) REFERENCES `produto_modificadores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_item_modifiers`
--

LOCK TABLES `order_item_modifiers` WRITE;
/*!40000 ALTER TABLE `order_item_modifiers` DISABLE KEYS */;
INSERT INTO `order_item_modifiers` VALUES (12,1),(13,4);
/*!40000 ALTER TABLE `order_item_modifiers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `product_id` bigint unsigned NOT NULL,
  `quantity` int unsigned NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','in_preparation','ready','served','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_order_items_order` (`order_id`),
  KEY `fk_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,2,25.00,50.00,'pending','2025-07-22 21:34:49','2025-07-22 21:34:49'),(2,1,2,1,15.00,17.00,'pending','2025-08-01 12:26:06','2025-08-01 12:26:06'),(3,1,1,1,5.50,5.50,'pending','2025-08-01 12:26:06','2025-08-01 12:26:06'),(10,1,1,1,8.00,8.00,'pending','2025-08-05 22:02:49','2025-08-05 22:02:49'),(11,1,2,1,25.00,25.00,'pending','2025-08-05 22:02:49','2025-08-05 22:02:49'),(12,6,4,2,7.50,15.00,'pending','2025-08-26 16:26:35','2025-08-26 16:26:35'),(13,6,5,1,18.00,18.00,'pending','2025-08-26 16:26:35','2025-08-26 16:26:35'),(14,7,6,3,10.00,30.00,'pending','2025-08-26 16:26:35','2025-08-26 16:26:35');
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
  `notes` text NOT NULL COMMENT 'Texto da observação/nota',
  `created_by` bigint unsigned NOT NULL COMMENT 'FK → users.id (usuário que criou a nota)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data/hora de criação',
  PRIMARY KEY (`id`),
  KEY `fk_order_notes_order` (`order_id`),
  KEY `fk_order_notes_user` (`created_by`),
  KEY `idx_order_notes_created_at` (`created_at`),
  CONSTRAINT `fk_order_notes_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_notes_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Observações e notas sobre pedidos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_notes`
--

LOCK TABLES `order_notes` WRITE;
/*!40000 ALTER TABLE `order_notes` DISABLE KEYS */;
INSERT INTO `order_notes` VALUES (1,1,'Cliente solicitou que o hambúrguer seja bem passado',1,'2025-08-28 19:54:32'),(2,2,'Pedido com urgência - cliente tem compromisso',1,'2025-08-28 19:54:32'),(3,3,'Substituir queijo por queijo vegano',1,'2025-08-28 19:54:32');
/*!40000 ALTER TABLE `order_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned DEFAULT NULL,
  `table_id` bigint unsigned DEFAULT NULL,
  `waiter_session_id` bigint unsigned DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('open','in_preparation','ready','served','closed','cancelled') NOT NULL DEFAULT 'open',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_orders_customer` (`customer_id`),
  KEY `fk_orders_table` (`table_id`),
  KEY `fk_orders_waiter_session` (`waiter_session_id`),
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_orders_table` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`),
  CONSTRAINT `fk_orders_waiter_session` FOREIGN KEY (`waiter_session_id`) REFERENCES `waiter_sessions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,1,1,0.00,'open','2025-07-22 21:34:47','2025-07-22 21:34:47'),(2,1,1,1,0.00,'open','2025-08-01 12:26:06','2025-08-01 12:26:06'),(3,1,1,1,45.00,'open','2025-08-05 21:58:20','2025-08-05 21:58:20'),(4,1,1,1,45.00,'open','2025-08-05 22:01:43','2025-08-05 22:01:43'),(5,1,1,1,33.00,'open','2025-08-05 22:02:49','2025-08-05 22:02:49'),(6,4,3,1,33.00,'closed','2025-08-26 16:26:35','2025-08-26 16:26:35'),(7,5,4,2,30.00,'open','2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_methods`
--

LOCK TABLES `payment_methods` WRITE;
/*!40000 ALTER TABLE `payment_methods` DISABLE KEYS */;
INSERT INTO `payment_methods` VALUES (1,'cash','Dinheiro','2025-07-10 16:54:52','2025-07-10 16:54:52'),(2,'card','Cartão','2025-07-10 16:54:52','2025-07-10 16:54:52');
/*!40000 ALTER TABLE `payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `payment_method_id` bigint unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paid_at` datetime NOT NULL,
  `operator_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
INSERT INTO `payments` VALUES (1,6,2,33.00,'2025-08-26 16:26:35',1,'2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `display_order` int unsigned NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (1,'Bebidas','Refrigerantes, sucos e coquetéis',1,'2025-07-10 16:54:52','2025-07-10 16:54:52'),(2,'Comidas','Petiscos e pratos principais',2,'2025-07-10 16:54:52','2025-07-10 16:54:52'),(3,'Sobremesas','Doces e sorvetes',3,'2025-08-26 16:26:35','2025-08-26 16:26:35'),(4,'Salgados','Salgados',0,'2025-08-28 14:28:58','2025-08-28 14:28:58'),(5,'Entradas','Entradas',0,'2025-08-28 16:26:35','2025-08-28 16:26:41');
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK da imagem do produto',
  `product_id` bigint unsigned NOT NULL COMMENT 'FK → products.id',
  `image_url` varchar(255) NOT NULL COMMENT 'URL da imagem',
  `is_primary` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 = imagem principal do cardápio',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Criação',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Atualização',
  PRIMARY KEY (`id`),
  KEY `fk_product_images_product` (`product_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,1,'https://example.com/images/coca_cola_350ml_1.jpg',1,'2025-08-01 12:26:05','2025-08-01 12:26:05'),(2,1,'https://example.com/images/coca_cola_350ml_alt.jpg',0,'2025-08-01 12:26:05','2025-08-01 12:26:05'),(3,2,'https://example.com/images/hamburguer_simples_1.jpg',1,'2025-08-01 12:26:05','2025-08-01 12:26:05'),(4,2,'https://example.com/images/hamburguer_simples_extra.jpg',0,'2025-08-01 12:26:05','2025-08-01 12:26:05'),(5,4,'https://example.com/images/suco_laranja_300.jpg',1,'2025-08-26 16:26:35','2025-08-26 16:26:35'),(6,5,'https://example.com/images/batata_frita.jpg',1,'2025-08-26 16:26:35','2025-08-26 16:26:35'),(7,6,'https://example.com/images/sorvete_chocolate.jpg',1,'2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_prices`
--

DROP TABLE IF EXISTS `product_prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_prices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_product_prices_product` (`product_id`),
  CONSTRAINT `fk_product_prices_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_prices`
--

LOCK TABLES `product_prices` WRITE;
/*!40000 ALTER TABLE `product_prices` DISABLE KEYS */;
INSERT INTO `product_prices` VALUES (1,1,5.50,'2025-01-01',NULL,'2025-07-10 16:54:52','2025-07-10 16:54:52'),(2,2,15.00,'2025-01-01',NULL,'2025-07-10 16:54:52','2025-07-10 16:54:52'),(3,1,25.00,'2025-08-05',NULL,'2025-08-05 21:58:20','2025-08-05 21:58:20'),(4,2,12.00,'2025-08-05',NULL,'2025-08-05 21:58:20','2025-08-05 21:58:20'),(6,1,25.00,'2025-08-05',NULL,'2025-08-05 22:01:43','2025-08-05 22:01:43'),(7,2,12.00,'2025-08-05',NULL,'2025-08-05 22:01:43','2025-08-05 22:01:43'),(9,4,7.50,'2025-01-01',NULL,'2025-08-26 16:26:35','2025-08-26 16:26:35'),(10,5,18.00,'2025-01-01',NULL,'2025-08-26 16:26:35','2025-08-26 16:26:35'),(11,6,10.00,'2025-01-01',NULL,'2025-08-26 16:26:35','2025-08-26 16:26:35'),(12,7,1.00,'2025-08-28',NULL,'2025-08-28 15:34:38','2025-08-28 15:34:38'),(13,7,12.00,'2025-08-28',NULL,'2025-08-28 16:27:52','2025-08-28 16:27:52');
/*!40000 ALTER TABLE `product_prices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category_id` bigint unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `sku` varchar(50) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Coca-Cola 350ml','Refrigerante em lata','COCA350','active','2025-07-10 16:54:52','2025-07-10 16:54:52'),(2,2,'Hambúrguer Simples','Pão, carne, alface, tomate','HAMB001','active','2025-07-10 16:54:52','2025-07-10 16:54:52'),(4,1,'Suco de Laranja 300ml','Suco natural sem açúcar','SUCO300','active','2025-08-26 16:26:35','2025-08-26 16:26:35'),(5,2,'Batata Frita','Porção individual crocante','BATATA001','active','2025-08-26 16:26:35','2025-08-26 16:26:35'),(6,3,'Sorvete de Chocolate','Bola de sorvete artesanal','SOBRE001','active','2025-08-26 16:26:35','2025-08-26 16:26:35'),(7,4,'teste1','teste1','teste','active','2025-08-28 15:34:38','2025-08-28 16:27:52');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produto_ingredientes`
--

DROP TABLE IF EXISTS `produto_ingredientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produto_ingredientes` (
  `product_id` bigint unsigned NOT NULL,
  `ingrediente_id` bigint unsigned NOT NULL,
  `quantidade` decimal(10,2) NOT NULL,
  PRIMARY KEY (`product_id`,`ingrediente_id`),
  KEY `fk_pi_ingrediente` (`ingrediente_id`),
  CONSTRAINT `fk_pi_ingrediente` FOREIGN KEY (`ingrediente_id`) REFERENCES `ingredientes` (`id`),
  CONSTRAINT `fk_pi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produto_ingredientes`
--

LOCK TABLES `produto_ingredientes` WRITE;
/*!40000 ALTER TABLE `produto_ingredientes` DISABLE KEYS */;
INSERT INTO `produto_ingredientes` VALUES (1,4,0.05),(2,1,0.10),(2,2,1.00),(2,3,0.02),(4,10,0.30),(5,8,0.25),(6,9,0.10);
/*!40000 ALTER TABLE `produto_ingredientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produto_modificadores`
--

DROP TABLE IF EXISTS `produto_modificadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produto_modificadores` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `nome` varchar(100) NOT NULL,
  `tipo` enum('ADICAO','REMOCAO','SUBSTITUICAO') NOT NULL,
  `ingrediente_id` bigint unsigned DEFAULT NULL,
  `fator_consumo` decimal(5,2) NOT NULL DEFAULT '1.00',
  `ajuste_preco` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_pm_product` (`product_id`),
  KEY `fk_pm_ingrediente` (`ingrediente_id`),
  CONSTRAINT `fk_pm_ingrediente` FOREIGN KEY (`ingrediente_id`) REFERENCES `ingredientes` (`id`),
  CONSTRAINT `fk_pm_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produto_modificadores`
--

LOCK TABLES `produto_modificadores` WRITE;
/*!40000 ALTER TABLE `produto_modificadores` DISABLE KEYS */;
INSERT INTO `produto_modificadores` VALUES (1,1,'Sem gelo','REMOCAO',4,0.00,0.00,'2025-07-10 16:54:52','2025-07-10 16:54:52'),(2,2,'Sem queijo','REMOCAO',3,0.00,0.00,'2025-07-10 16:54:52','2025-07-10 16:54:52'),(3,2,'Extra queijo','ADICAO',3,2.00,1.00,'2025-07-10 16:54:52','2025-07-10 16:54:52'),(4,5,'Extra porção','ADICAO',8,1.50,6.00,'2025-08-26 16:26:35','2025-08-26 16:26:35'),(5,6,'Calda de chocolate','ADICAO',9,0.30,2.50,'2025-08-26 16:26:35','2025-08-26 16:26:35'),(6,4,'Sem gelo','REMOCAO',4,0.00,0.00,'2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `produto_modificadores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','Administrador do sistema','2025-07-10 16:54:52','2025-07-10 16:54:52'),(2,'waiter','Garçom','2025-07-10 16:54:52','2025-07-10 16:54:52'),(3,'cozinha','Funcionário da cozinha','2025-08-28 19:58:30','2025-08-28 19:58:30'),(4,'estoque','Funcionário do estoque','2025-08-29 20:05:12','2025-08-29 20:05:12');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `table_reservations`
--

DROP TABLE IF EXISTS `table_reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `table_reservations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `table_id` bigint unsigned NOT NULL,
  `reservation_time` datetime NOT NULL,
  `duration_minutes` int NOT NULL DEFAULT '90',
  `buffer_after_minutes` int NOT NULL DEFAULT '10',
  `ends_at` datetime DEFAULT NULL,
  `hold_expires_at` datetime DEFAULT NULL,
  `status` enum('hold','booked','seated','completed','cancelled','no_show') NOT NULL DEFAULT 'hold',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_reservations_customer` (`customer_id`),
  KEY `idx_res_table_time` (`table_id`,`reservation_time`,`ends_at`),
  KEY `idx_res_status_time` (`status`,`reservation_time`),
  CONSTRAINT `fk_reservations_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `fk_reservations_table` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `table_reservations`
--

LOCK TABLES `table_reservations` WRITE;
/*!40000 ALTER TABLE `table_reservations` DISABLE KEYS */;
INSERT INTO `table_reservations` VALUES (1,1,1,'2025-08-01 19:00:00',90,10,'2025-08-01 20:30:00',NULL,'booked','2025-08-01 12:26:05','2025-08-26 16:36:44'),(2,2,2,'2025-08-01 20:30:00',90,10,'2025-08-01 22:00:00',NULL,'booked','2025-08-01 12:26:05','2025-08-26 16:36:44'),(3,6,5,'2025-08-27 16:26:35',90,10,'2025-08-27 17:56:35',NULL,'booked','2025-08-26 16:26:35','2025-08-26 16:36:44'),(4,8,4,'2025-08-28 16:26:35',90,10,'2025-08-28 17:56:35',NULL,'booked','2025-08-26 16:26:35','2025-08-26 16:36:44');
/*!40000 ALTER TABLE `table_reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tables`
--

DROP TABLE IF EXISTS `tables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tables` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `branch_id` bigint unsigned NOT NULL,
  `table_number` varchar(10) NOT NULL,
  `capacity` int unsigned NOT NULL,
  `status` enum('available','occupied','reserved') NOT NULL DEFAULT 'available',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
INSERT INTO `tables` VALUES (1,1,'Mesa 1',4,'available','2025-07-10 16:54:52','2025-07-10 16:54:52'),(2,1,'Mesa 2',2,'available','2025-07-10 16:54:52','2025-07-10 16:54:52'),(3,1,'Mesa 3',4,'available','2025-08-26 16:26:35','2025-08-26 16:26:35'),(4,1,'Mesa 4',6,'available','2025-08-26 16:26:35','2025-08-26 16:26:35'),(5,2,'Mesa 1',4,'available','2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `tables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tax_rates`
--

DROP TABLE IF EXISTS `tax_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tax_rates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `rate` decimal(5,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax_rates`
--

LOCK TABLES `tax_rates` WRITE;
/*!40000 ALTER TABLE `tax_rates` DISABLE KEYS */;
INSERT INTO `tax_rates` VALUES (1,'ISS 5%',5.00,'2025-01-01','2025-12-31','2025-08-01 12:26:05','2025-08-01 12:26:05'),(2,'ICMS 18%',18.00,'2025-01-01','2025-12-31','2025-08-01 12:26:05','2025-08-01 12:26:05');
/*!40000 ALTER TABLE `tax_rates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` bigint unsigned NOT NULL,
  `role_id` bigint unsigned NOT NULL,
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
INSERT INTO `user_roles` VALUES (1,1,'2025-07-10 16:54:52'),(2,2,'2025-07-10 16:54:52'),(3,1,'2025-08-26 16:26:35'),(4,2,'2025-08-26 16:26:35');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `branch_id` bigint unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `fk_users_branch` (`branch_id`),
  CONSTRAINT `fk_users_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$hrFwGLpPd2tAJppCILvEBelxR9XdqtrywUgpSbTpFkYhRBrbJj0V6','admin@empresa.com',1,'2025-07-10 16:54:52','2025-07-10 17:32:17'),(2,'garcom1','hash_garcom','garcom1@empresa.com',1,'2025-07-10 16:54:52','2025-07-10 16:54:52'),(3,'caixa1','$2b$10$fakehashcaixa1','caixa1@empresa.com',1,'2025-08-26 16:26:35','2025-08-26 16:26:35'),(4,'garcom2','hash_garcom2','garcom2@empresa.com',2,'2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `waiter_devices`
--

DROP TABLE IF EXISTS `waiter_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `waiter_devices` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` bigint unsigned NOT NULL,
  `device_uuid` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_wd_employee` (`employee_id`),
  CONSTRAINT `fk_wd_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `waiter_devices`
--

LOCK TABLES `waiter_devices` WRITE;
/*!40000 ALTER TABLE `waiter_devices` DISABLE KEYS */;
INSERT INTO `waiter_devices` VALUES (1,1,'uuid-device-1','2025-07-10 16:54:52','2025-07-10 16:54:52'),(2,2,'uuid-device-2','2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `waiter_devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `waiter_sessions`
--

DROP TABLE IF EXISTS `waiter_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `waiter_sessions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` bigint unsigned NOT NULL,
  `device_id` bigint unsigned NOT NULL,
  `started_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ended_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ws_employee` (`employee_id`),
  KEY `fk_ws_device` (`device_id`),
  CONSTRAINT `fk_ws_device` FOREIGN KEY (`device_id`) REFERENCES `waiter_devices` (`id`),
  CONSTRAINT `fk_ws_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `waiter_sessions`
--

LOCK TABLES `waiter_sessions` WRITE;
/*!40000 ALTER TABLE `waiter_sessions` DISABLE KEYS */;
INSERT INTO `waiter_sessions` VALUES (1,1,1,'2025-07-10 16:54:52',NULL,'2025-07-10 16:54:52','2025-07-10 16:54:52'),(2,2,2,'2025-08-26 16:26:35',NULL,'2025-08-26 16:26:35','2025-08-26 16:26:35');
/*!40000 ALTER TABLE `waiter_sessions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-29 18:27:46
