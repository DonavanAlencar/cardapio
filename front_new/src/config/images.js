// Configuração para URLs de imagens
export const IMAGE_BASE_URL = 'http://localhost:4000';

// Função para construir URL completa da imagem
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return `${IMAGE_BASE_URL}${imagePath}`;
};

// Função para construir URL do thumbnail
export const getThumbnailUrl = (thumbnailPath) => {
  if (!thumbnailPath) return null;
  return `${IMAGE_BASE_URL}${thumbnailPath}`;
};

// Função para verificar se uma imagem existe
export const checkImageExists = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};
