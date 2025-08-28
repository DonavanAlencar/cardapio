const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Configuração do multer para armazenamento temporário
const storage = multer.memoryStorage();

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos'), false);
  }
};

// Configuração do upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// Middleware para processar e salvar imagem
const processAndSaveImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const productId = req.params.id || req.body.product_id;
    if (!productId) {
      return res.status(400).json({ message: 'ID do produto é obrigatório' });
    }

    // Gerar nome único para a imagem
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const fileName = `${uuidv4()}${fileExtension}`;
    
    // Criar diretório se não existir
    const uploadDir = path.join(__dirname, '../../uploads/products', productId.toString());
    await fs.mkdir(uploadDir, { recursive: true });

    // Processar imagem com sharp (otimizar e redimensionar)
    const imageBuffer = await sharp(req.file.buffer)
      .resize(800, 800, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    // Salvar imagem processada
    const imagePath = path.join(uploadDir, fileName);
    await fs.writeFile(imagePath, imageBuffer);

    // Gerar thumbnail
    const thumbnailBuffer = await sharp(req.file.buffer)
      .resize(200, 200, { 
        fit: 'cover', 
        withoutEnlargement: true 
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    const thumbnailPath = path.join(uploadDir, `thumb_${fileName}`);
    await fs.writeFile(thumbnailPath, thumbnailBuffer);

    // Adicionar informações da imagem ao req
    req.imageInfo = {
      fileName: fileName,
      imagePath: `/uploads/products/${productId}/${fileName}`,
      thumbnailPath: `/uploads/products/${productId}/thumb_${fileName}`,
      originalName: req.file.originalname,
      size: imageBuffer.length,
      mimetype: 'image/jpeg'
    };

    next();
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    res.status(500).json({ message: 'Erro ao processar imagem', error: error.message });
  }
};

// Middleware para upload de imagem única
const uploadProductImage = upload.single('image');

// Middleware para upload de múltiplas imagens
const uploadMultipleImages = upload.array('images', 5);

module.exports = {
  uploadProductImage,
  uploadMultipleImages,
  processAndSaveImage
};
