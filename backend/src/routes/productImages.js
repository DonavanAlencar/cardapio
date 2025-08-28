const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { uploadProductImage, processAndSaveImage } = require('../middleware/uploadMiddleware');
const productImageController = require('../controllers/productImageController');

// Rotas protegidas (requerem autenticação)
router.use(auth());

// Listar imagens de um produto
router.get('/:productId', productImageController.listProductImages);

// Upload de imagem para produto
router.post('/:productId/upload', uploadProductImage, processAndSaveImage, productImageController.uploadProductImage);

// Definir imagem como primária
router.put('/:imageId/primary', productImageController.setPrimaryImage);

// Deletar imagem
router.delete('/:imageId', productImageController.deleteProductImage);

// Servir arquivo de imagem (rota pública para cache)
router.get('/:productId/serve/:filename', productImageController.serveImage);

module.exports = router;
