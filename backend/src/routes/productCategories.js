const express = require('express');
const productCategoryController = require('../../controllers/productCategoryController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware para verificar se o usuário é admin ou gerente
const authorizeAdminOrManager = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'gerente') {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para gerenciar categorias de produtos.' });
  }
  next();
};

// Rota para listar todas as categorias de produtos
router.get('/', productCategoryController.listCategories);

// Rota para buscar categoria por ID
router.get('/:id', productCategoryController.getCategoryById);

// Rota para criar uma nova categoria de produto (apenas admin/gerente)
router.post('/', auth, authorizeAdminOrManager, productCategoryController.createCategory);

// Rota para atualizar uma categoria de produto (apenas admin/gerente)
router.put('/:id', auth, authorizeAdminOrManager, productCategoryController.updateCategory);

// Rota para deletar uma categoria de produto (apenas admin/gerente)
router.delete('/:id', auth, authorizeAdminOrManager, productCategoryController.deleteCategory);

// Rota para reordenar categorias
router.put('/reorder', auth, authorizeAdminOrManager, productCategoryController.reorderCategories);

// Rota para busca de categorias (autocomplete)
router.get('/search', productCategoryController.searchCategories);

// Rota para estatísticas das categorias
router.get('/stats', productCategoryController.getCategoryStats);

// Rota para alterar status da categoria
router.patch('/:id/status', auth, authorizeAdminOrManager, productCategoryController.toggleCategoryStatus);

module.exports = router;
