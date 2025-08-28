-- Script para adicionar a role 'cozinha' se ela não existir

-- Verificar se a role 'cozinha' existe e inserir se não existir
INSERT IGNORE INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(3, 'cozinha', 'Funcionário da cozinha', NOW(), NOW());

-- Verificar se a role foi inserida
SELECT 
  id,
  name,
  description,
  created_at
FROM roles 
WHERE name = 'cozinha';

-- Opcional: Atribuir a role 'cozinha' a um usuário existente (substitua USER_ID pelo ID do usuário desejado)
-- INSERT IGNORE INTO `user_roles` (`user_id`, `role_id`, `assigned_at`) VALUES
-- (USER_ID, 3, NOW());

-- Verificar todas as roles disponíveis
SELECT 
  id,
  name,
  description,
  created_at
FROM roles 
ORDER BY id;
