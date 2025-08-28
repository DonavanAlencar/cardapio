const express = require('express');
const productCategoryController = require('../controllers/productCategoryController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware para verificar se o usuário é admin ou gerente
const authorizeAdminOrManager = (req, res, next) => {
  if (!req.user || (!['admin','gerente'].includes(req.user.role))) {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para gerenciar categorias de produtos.' });
  }
  next();
};

// Rota para listar todas as categorias de produtos
router.get('/', productCategoryController.listCategories);

// Rota para busca de categorias (autocomplete)
router.get('/search', productCategoryController.searchCategories);

// Rota para buscar categoria por ID
router.get('/:id', productCategoryController.getCategoryById);

// Rota para criar uma nova categoria de produto (apenas admin/gerente)
router.post('/', auth(), (req, res, next) => { console.log('📥 [Categories] POST / - body:', req.body); next(); }, authorizeAdminOrManager, productCategoryController.createCategory);

// Rota para atualizar uma categoria de produto (apenas admin/gerente)
router.put('/:id', auth(), authorizeAdminOrManager, productCategoryController.updateCategory);

// Rota para deletar uma categoria de produto (apenas admin/gerente)
router.delete('/:id', auth(), authorizeAdminOrManager, productCategoryController.deleteCategory);

// Rota para reordenar categorias
router.put('/reorder', auth(), authorizeAdminOrManager, productCategoryController.reorderCategories);

module.exports = router;
