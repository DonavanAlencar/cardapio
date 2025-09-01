import api from './api';

class CategoryService {
  // Listar todas as categorias
  async listCategories(params = {}) {
    try {
      const response = await api.get('/product-categories', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      throw error;
    }
  }

  // Buscar categoria por ID
  async getCategoryById(id, includeProducts = false) {
    try {
      const response = await api.get(`/product-categories/${id}`, {
        params: { include_products: includeProducts }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      throw error;
    }
  }

  // Criar nova categoria
  async createCategory(categoryData) {
    try {
      const response = await api.post('/product-categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  }

  // Atualizar categoria
  async updateCategory(id, categoryData) {
    try {
      const response = await api.put(`/product-categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  }

  // Deletar categoria
  async deleteCategory(id) {
    try {
      await api.delete(`/product-categories/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
  }

  // Reordenar categorias
  async reorderCategories(categories) {
    try {
      const response = await api.put('/product-categories/reorder', { categories });
      return response.data;
    } catch (error) {
      console.error('Erro ao reordenar categorias:', error);
      throw error;
    }
  }

  // Buscar categorias (autocomplete)
  async searchCategories(query, limit = 10) {
    try {
      const response = await api.get('/product-categories/search', {
        params: { q: query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }

  // Obter estatísticas das categorias
  async getCategoryStats() {
    try {
      const response = await api.get('/product-categories/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas das categorias:', error);
      throw error;
    }
  }

  // Alterar status da categoria
  async toggleCategoryStatus(id, status) {
    try {
      const response = await api.patch(`/product-categories/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar status da categoria:', error);
      throw error;
    }
  }

  // Buscar categorias ativas
  async getActiveCategories() {
    try {
      const response = await api.get('/product-categories', {
        params: { status: 'active' }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categorias ativas:', error);
      throw error;
    }
  }

  // Buscar categorias com produtos
  async getCategoriesWithProducts() {
    try {
      const response = await api.get('/product-categories', {
        params: { include_products: true }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categorias com produtos:', error);
      throw error;
    }
  }

  // Validar nome único da categoria
  async validateCategoryName(name, categoryId = null) {
    try {
      const params = { name };
      if (categoryId) params.exclude_id = categoryId;
      
      const response = await api.get('/product-categories/validate-name', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao validar nome da categoria:', error);
      throw error;
    }
  }

  // Buscar categorias por termo de busca
  async searchCategoriesByTerm(term, limit = 20) {
    try {
      const response = await api.get('/product-categories/search', {
        params: { q: term, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categorias por termo:', error);
      throw error;
    }
  }

  // Obter categorias em destaque
  async getFeaturedCategories(limit = 10) {
    try {
      const response = await api.get('/product-categories/featured', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categorias em destaque:', error);
      throw error;
    }
  }

  // Marcar categoria como destaque
  async setCategoryFeatured(categoryId, featured = true) {
    try {
      const response = await api.patch(`/product-categories/${categoryId}/featured`, { featured });
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar categoria como destaque:', error);
      throw error;
    }
  }

  // Exportar categorias
  async exportCategories(format = 'csv') {
    try {
      const response = await api.get('/product-categories/export', {
        params: { format },
        responseType: 'blob'
      });
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `categorias.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao exportar categorias:', error);
      throw error;
    }
  }

  // Importar categorias
  async importCategories(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));
      
      const response = await api.post('/product-categories/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao importar categorias:', error);
      throw error;
    }
  }

  // Obter hierarquia de categorias
  async getCategoryHierarchy() {
    try {
      const response = await api.get('/product-categories/hierarchy');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar hierarquia de categorias:', error);
      throw error;
    }
  }

  // Criar subcategoria
  async createSubcategory(parentId, categoryData) {
    try {
      const response = await api.post(`/product-categories/${parentId}/subcategories`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar subcategoria:', error);
      throw error;
    }
  }

  // Mover categoria para outra categoria pai
  async moveCategory(categoryId, newParentId) {
    try {
      const response = await api.patch(`/product-categories/${categoryId}/move`, {
        new_parent_id: newParentId
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao mover categoria:', error);
      throw error;
    }
  }

  // Duplicar categoria
  async duplicateCategory(categoryId, newName) {
    try {
      const response = await api.post(`/product-categories/${categoryId}/duplicate`, {
        new_name: newName
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao duplicar categoria:', error);
      throw error;
    }
  }

  // Obter produtos de uma categoria com paginação
  async getCategoryProducts(categoryId, params = {}) {
    try {
      const response = await api.get(`/product-categories/${categoryId}/products`, { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos da categoria:', error);
      throw error;
    }
  }

  // Contar produtos por categoria
  async getCategoryProductCounts() {
    try {
      const response = await api.get('/product-categories/product-counts');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar contagem de produtos por categoria:', error);
      throw error;
    }
  }
}

export default new CategoryService();
