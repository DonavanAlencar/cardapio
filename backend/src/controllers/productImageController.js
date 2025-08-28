const pool = require('../config/db');
const fs = require('fs').promises;
const path = require('path');

// Listar imagens de um produto
exports.listProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const [rows] = await pool.query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, created_at DESC',
      [productId]
    );
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar imagens', error: err.message });
  }
};

// Upload de imagem para produto
exports.uploadProductImage = async (req, res) => {
  try {
    const { productId } = req.params;
    const { is_primary = false } = req.body;
    
    if (!req.imageInfo) {
      return res.status(400).json({ message: 'Nenhuma imagem foi enviada' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Se esta imagem será primária, desmarcar outras como primárias
      if (is_primary) {
        await conn.query(
          'UPDATE product_images SET is_primary = 0 WHERE product_id = ?',
          [productId]
        );
      }

      // Inserir registro da imagem no banco
      const [result] = await conn.query(
        'INSERT INTO product_images (product_id, image_url, thumbnail_url, original_name, file_size, is_primary) VALUES (?, ?, ?, ?, ?, ?)',
        [
          productId,
          req.imageInfo.imagePath,
          req.imageInfo.thumbnailPath,
          req.imageInfo.originalName,
          req.imageInfo.size,
          is_primary ? 1 : 0
        ]
      );

      await conn.commit();

      // Retornar imagem criada
      const [newImage] = await pool.query(
        'SELECT * FROM product_images WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json(newImage[0]);
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro ao fazer upload da imagem', error: err.message });
  }
};

// Definir imagem como primária
exports.setPrimaryImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Buscar produto da imagem
      const [imageRows] = await conn.query(
        'SELECT product_id FROM product_images WHERE id = ?',
        [imageId]
      );

      if (imageRows.length === 0) {
        return res.status(404).json({ message: 'Imagem não encontrada' });
      }

      const productId = imageRows[0].product_id;

      // Desmarcar todas as imagens do produto como primárias
      await conn.query(
        'UPDATE product_images SET is_primary = 0 WHERE product_id = ?',
        [productId]
      );

      // Marcar esta imagem como primária
      await conn.query(
        'UPDATE product_images SET is_primary = 1 WHERE id = ?',
        [imageId]
      );

      await conn.commit();

      res.json({ message: 'Imagem definida como primária com sucesso' });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro ao definir imagem primária', error: err.message });
  }
};

// Deletar imagem
exports.deleteProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Buscar informações da imagem
      const [imageRows] = await conn.query(
        'SELECT * FROM product_images WHERE id = ?',
        [imageId]
      );

      if (imageRows.length === 0) {
        return res.status(404).json({ message: 'Imagem não encontrada' });
      }

      const image = imageRows[0];

      // Deletar arquivos físicos
      try {
        const imagePath = path.join(__dirname, '../../uploads/products', image.product_id.toString(), path.basename(image.image_url));
        const thumbnailPath = path.join(__dirname, '../../uploads/products', image.product_id.toString(), path.basename(image.thumbnail_url));
        
        await fs.unlink(imagePath);
        await fs.unlink(thumbnailPath);
      } catch (fileError) {
        console.warn('Arquivo de imagem não encontrado para deletar:', fileError.message);
      }

      // Deletar registro do banco
      await conn.query('DELETE FROM product_images WHERE id = ?', [imageId]);

      await conn.commit();

      res.json({ message: 'Imagem deletada com sucesso' });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro ao deletar imagem', error: err.message });
  }
};

// Servir arquivo de imagem
exports.serveImage = async (req, res) => {
  try {
    const { productId, filename } = req.params;
    const imagePath = path.join(__dirname, '../../uploads/products', productId, filename);
    
    // Verificar se arquivo existe
    try {
      await fs.access(imagePath);
    } catch {
      return res.status(404).json({ message: 'Imagem não encontrada' });
    }

    // Configurar headers para cache e otimização
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 ano
    res.setHeader('Expires', new Date(Date.now() + 31536000 * 1000).toUTCString());
    res.setHeader('Content-Type', 'image/jpeg');
    
    res.sendFile(imagePath);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao servir imagem', error: err.message });
  }
};
