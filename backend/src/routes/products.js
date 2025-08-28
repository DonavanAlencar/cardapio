const express = require('express');
const productController = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware para verificar se o usuário é admin ou gerente
const authorizeAdminOrManager = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'gerente') {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para gerenciar produtos.' });
  }
  next();
};

// Rota para listar todos os produtos com filtros e paginação
router.get('/', productController.listProducts);

// Rota para estatísticas dos produtos
router.get('/stats', productController.getProductStats);

// Rota para buscar produtos populares
router.get('/popular', productController.getPopularProducts);

// Rota para buscar produtos com estoque baixo
router.get('/low-stock', productController.getLowStockProducts);

// Rota para busca de produtos (autocomplete)
router.get('/search', productController.searchProducts);

// Rota para buscar produtos por categoria
router.get('/category/:category_id', productController.getProductsByCategory);

// Rota para buscar produto por ID
router.get('/:id', productController.getProductById);

// Rota para criar um novo produto (apenas admin/gerente)
router.post('/', auth(), authorizeAdminOrManager, productController.createProduct);

// Rota para atualizar um produto (apenas admin/gerente)
router.put('/:id', auth(), authorizeAdminOrManager, productController.updateProduct);

// Rota para deletar um produto (apenas admin/gerente)
router.delete('/:id', auth(), authorizeAdminOrManager, productController.deleteProduct);

module.exports = router;
