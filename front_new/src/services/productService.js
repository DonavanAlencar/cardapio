import api from '../config/api';

class ProductService {
  // Listar produtos com filtros e paginação
  async listProducts(params = {}) {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      throw error;
    }
  }

  // Buscar produto por ID
  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  }

  // Criar novo produto
  async createProduct(productData) {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  }

  // Atualizar produto
  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  }

  // Deletar produto
  async deleteProduct(id) {
    try {
      await api.delete(`/products/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  }

  // Buscar produtos por categoria
  async getProductsByCategory(categoryId, status = 'active') {
    try {
      const response = await api.get(`/products/category/${categoryId}`, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      throw error;
    }
  }

  // Buscar produtos populares
  async getPopularProducts(limit = 10, days = 30) {
    try {
      const response = await api.get('/products/popular', {
        params: { limit, days }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos populares:', error);
      throw error;
    }
  }

  // Buscar produtos com estoque baixo
  async getLowStockProducts() {
    try {
      const response = await api.get('/products/low-stock');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error);
      throw error;
    }
  }

  // Buscar produtos (autocomplete)
  async searchProducts(query, limit = 10) {
    try {
      const response = await api.get('/products/search', {
        params: { q: query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

  // Obter estatísticas dos produtos
  async getProductStats() {
    try {
      const response = await api.get('/products/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas dos produtos:', error);
      throw error;
    }
  }

  // Upload de imagem para produto
  async uploadProductImage(productId, imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.post(`/products/${productId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    }
  }

  // Remover imagem do produto
  async removeProductImage(productId, imageId) {
    try {
      await api.delete(`/products/${productId}/images/${imageId}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      throw error;
    }
  }

  // Definir imagem principal
  async setPrimaryImage(productId, imageId) {
    try {
      const response = await api.patch(`/products/${productId}/images/${imageId}/primary`);
      return response.data;
    } catch (error) {
      console.error('Erro ao definir imagem principal:', error);
      throw error;
    }
  }

  // Atualizar preço do produto
  async updateProductPrice(productId, priceData) {
    try {
      const response = await api.patch(`/products/${productId}/price`, priceData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar preço:', error);
      throw error;
    }
  }

  // Ativar/desativar produto
  async toggleProductStatus(productId, status) {
    try {
      const response = await api.patch(`/products/${productId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar status do produto:', error);
      throw error;
    }
  }

  // Buscar histórico de preços
  async getProductPriceHistory(productId) {
    try {
      const response = await api.get(`/products/${productId}/price-history`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico de preços:', error);
      throw error;
    }
  }

  // Buscar produtos relacionados
  async getRelatedProducts(productId, limit = 5) {
    try {
      const response = await api.get(`/products/${productId}/related`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos relacionados:', error);
      throw error;
    }
  }

  // Exportar produtos
  async exportProducts(format = 'csv', filters = {}) {
    try {
      const response = await api.get('/products/export', {
        params: { format, ...filters },
        responseType: 'blob'
      });
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `produtos.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao exportar produtos:', error);
      throw error;
    }
  }

  // Importar produtos
  async importProducts(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));
      
      const response = await api.post('/products/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao importar produtos:', error);
      throw error;
    }
  }

  // Validar SKU único
  async validateSku(sku, productId = null) {
    try {
      const params = { sku };
      if (productId) params.exclude_id = productId;
      
      const response = await api.get('/products/validate-sku', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao validar SKU:', error);
      throw error;
    }
  }

  // Buscar produtos por tags
  async getProductsByTags(tags, limit = 20) {
    try {
      const response = await api.get('/products/by-tags', {
        params: { tags: tags.join(','), limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos por tags:', error);
      throw error;
    }
  }

  // Obter produtos em destaque
  async getFeaturedProducts(limit = 10) {
    try {
      const response = await api.get('/products/featured', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos em destaque:', error);
      throw error;
    }
  }

  // Marcar produto como destaque
  async setProductFeatured(productId, featured = true) {
    try {
      const response = await api.patch(`/products/${productId}/featured`, { featured });
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar produto como destaque:', error);
      throw error;
    }
  }
}

export default new ProductService();
