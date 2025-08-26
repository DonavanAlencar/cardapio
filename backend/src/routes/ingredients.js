const express = require('express');
const ingredientController = require('../../controllers/ingredientController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware para verificar se o usuário é admin ou gerente
const authorizeAdminOrManager = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'gerente') {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para gerenciar ingredientes.' });
  }
  next();
};

// Rota para listar todos os ingredientes
router.get('/', ingredientController.listIngredients);

// Rota para buscar ingrediente por ID
router.get('/:id', ingredientController.getIngredientById);

// Rota para criar um novo ingrediente (apenas admin/gerente)
router.post('/', auth, authorizeAdminOrManager, ingredientController.createIngredient);

// Rota para atualizar um ingrediente (apenas admin/gerente)
router.put('/:id', auth, authorizeAdminOrManager, ingredientController.updateIngredient);

// Rota para deletar um ingrediente (apenas admin/gerente)
router.delete('/:id', auth, authorizeAdminOrManager, ingredientController.deleteIngredient);

// Rota para busca de ingredientes (autocomplete)
router.get('/search', ingredientController.searchIngredients);

// Rota para estatísticas dos ingredientes
router.get('/stats', ingredientController.getIngredientStats);

// Rota para alterar status do ingrediente
router.patch('/:id/status', auth, authorizeAdminOrManager, ingredientController.toggleIngredientStatus);

module.exports = router;
