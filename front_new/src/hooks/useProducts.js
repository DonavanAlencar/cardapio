import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import productService from '../services/productService';

export const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    withImages: 0,
    lowStock: 0
  });

  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    status: 'active',
    sortBy: 'name',
    sortOrder: 'ASC',
    ...initialFilters
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Carregar produtos
  const loadProducts = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...(customFilters || filters),
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await productService.listProducts(params);

      if (response && response.products) {
        setProducts(response.products);
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 0
          }));
        }
      } else {
        setProducts([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          totalPages: 0
        }));
      }

    } catch (err) {
      setError(err.message || 'Erro ao carregar produtos');
      toast.error('Erro ao carregar produtos');
      console.error('Erro ao carregar produtos:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Carregar estatísticas
  const loadStats = useCallback(async () => {
    try {
      const statsData = await productService.getProductStats();
      if (statsData) {
        setStats(statsData);
      } else {
        setStats({
          total: 0,
          active: 0,
          withImages: 0,
          lowStock: 0
        });
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      // Manter estatísticas padrão em caso de erro
      setStats({
        total: 0,
        active: 0,
        withImages: 0,
        lowStock: 0
      });
    }
  }, []);

  // Carregar dados iniciais
  const loadInitialData = useCallback(async () => {
    await Promise.all([
      loadProducts(),
      loadStats()
    ]);
  }, [loadProducts, loadStats]);

  // Atualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Atualizar paginação
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  // Buscar produto por ID
  const getProductById = useCallback(async (id) => {
    try {
      setLoading(true);
      const product = await productService.getProductById(id);
      return product;
    } catch (err) {
      setError(err.message);
      toast.error('Erro ao buscar produto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar produto
  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      const result = await productService.createProduct(productData);
      toast.success('Produto criado com sucesso');
      
      // Recarregar produtos e estatísticas
      await Promise.all([
        loadProducts(),
        loadStats()
      ]);
      
      return result;
    } catch (err) {
      setError(err.message);
      toast.error('Erro ao criar produto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadProducts, loadStats]);

  // Atualizar produto
  const updateProduct = useCallback(async (id, productData) => {
    try {
      setLoading(true);
      const result = await productService.updateProduct(id, productData);
      toast.success('Produto atualizado com sucesso');
      
      // Recarregar produtos e estatísticas
      await Promise.all([
        loadProducts(),
        loadStats()
      ]);
      
      return result;
    } catch (err) {
      setError(err.message);
      toast.error('Erro ao atualizar produto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadProducts, loadStats]);

  // Deletar produto
  const deleteProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      await productService.deleteProduct(id);
      toast.success('Produto deletado com sucesso');
      
      // Recarregar produtos e estatísticas
      await Promise.all([
        loadProducts(),
        loadStats()
      ]);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      toast.error('Erro ao deletar produto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadProducts, loadStats]);

  // Alterar status do produto
  const toggleProductStatus = useCallback(async (id, status) => {
    try {
      setLoading(true);
      await productService.toggleProductStatus(id, status);
      toast.success(`Produto ${status === 'active' ? 'ativado' : 'desativado'} com sucesso`);
      
      // Recarregar produtos e estatísticas
      await Promise.all([
        loadProducts(),
        loadStats()
      ]);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      toast.error('Erro ao alterar status do produto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadProducts, loadStats]);

  // Buscar produtos populares
  const getPopularProducts = useCallback(async (limit = 10, days = 30) => {
    try {
      const products = await productService.getPopularProducts(limit, days);
      return products;
    } catch (err) {
      console.error('Erro ao buscar produtos populares:', err);
      return [];
    }
  }, []);

  // Buscar produtos com estoque baixo
  const getLowStockProducts = useCallback(async () => {
    try {
      const products = await productService.getLowStockProducts();
      return products;
    } catch (err) {
      console.error('Erro ao buscar produtos com estoque baixo:', err);
      return [];
    }
  }, []);

  // Buscar produtos por categoria
  const getProductsByCategory = useCallback(async (categoryId, status = 'active') => {
    try {
      const products = await productService.getProductsByCategory(categoryId, status);
      return products;
    } catch (err) {
      console.error('Erro ao buscar produtos por categoria:', err);
      return [];
    }
  }, []);

  // Buscar produtos (autocomplete)
  const searchProducts = useCallback(async (query, limit = 10) => {
    try {
      if (!query || query.length < 2) return [];
      const products = await productService.searchProducts(query, limit);
      return products;
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      return [];
    }
  }, []);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category_id: '',
      status: 'active',
      sortBy: 'name',
      sortOrder: 'ASC'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Efeito para carregar dados quando filtros mudarem
  useEffect(() => {
    loadProducts();
  }, [filters, pagination.page]);

  return {
    // Estado
    products,
    loading,
    error,
    stats,
    filters,
    pagination,
    
    // Ações
    loadProducts,
    loadStats,
    loadInitialData,
    updateFilters,
    updatePagination,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    getPopularProducts,
    getLowStockProducts,
    getProductsByCategory,
    searchProducts,
    clearFilters,
    clearError
  };
};
