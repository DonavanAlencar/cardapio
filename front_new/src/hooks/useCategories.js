import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import categoryService from '../services/categoryService';

export const useCategories = (initialFilters = {}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    withProducts: 0
  });

  const [filters, setFilters] = useState({
    status: 'active',
    include_products: false,
    ...initialFilters
  });

  // Carregar categorias
  const loadCategories = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);

      const params = customFilters || filters;
      const categoriesData = await categoryService.listCategories(params);

      setCategories(categoriesData);

    } catch (err) {
      setError(err.message);
      toast.error('Erro ao carregar categorias');
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Carregar estatísticas
  const loadStats = useCallback(async () => {
    try {
      const statsData = await categoryService.getCategoryStats();
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar estatísticas das categorias:', err);
    }
  }, []);

  // Carregar dados iniciais
  const loadInitialData = useCallback(async () => {
    await Promise.all([
      loadCategories(),
      loadStats()
    ]);
  }, [loadCategories, loadStats]);

  // Atualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Buscar categoria por ID
  const getCategoryById = useCallback(async (id, includeProducts = false) => {
    try {
      setLoading(true);
      const category = await categoryService.getCategoryById(id, includeProducts);
      return category;
    } catch (err) {
      setError(err.message);
      toast.error('Erro ao buscar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar categoria
  const createCategory = useCallback(async (categoryData) => {
    try {
      setLoading(true);
      const result = await categoryService.createCategory(categoryData);
      toast.success('Categoria criada com sucesso');
      
      // Recarregar categorias e estatísticas
      await Promise.all([
        loadCategories(),
        loadStats()
      ]);
      
      return result;
    } catch (err) {
      setError(err.message);
      toast.error('Erro ao criar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCategories, loadStats]);

  // Atualizar categoria
  const updateCategory = useCallback(async (id, categoryData) => {
    try {
      setLoading(true);
      const result = await categoryService.updateCategory(id, categoryData);
      toast.success('Categoria atualizada com sucesso');
      
      // Recarregar categorias e estatísticas
      await Promise.all([
        loadCategories(),
        loadStats()
      ]);
      
      return result;
    } catch (err) {
      setError(err.message);
      toast.error('Erro ao atualizar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCategories, loadStats]);

  // Deletar categoria
  const deleteCategory = useCallback(async (id) => {
    try {
      setLoading(true);
      await categoryService.deleteCategory(id);
      toast.success('Categoria deletada com sucesso');
      
      // Recarregar categorias e estatísticas
      await Promise.all([
        loadCategories(),
        loadStats()
      ]);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      toast.error('Erro ao deletar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCategories, loadStats]);

  // Alterar status da categoria
  const toggleCategoryStatus = useCallback(async (id, status) => {
    try {
      setLoading(true);
      await categoryService.toggleCategoryStatus(id, status);
      toast.success(`Categoria ${status === 'active' ? 'ativada' : 'desativada'} com sucesso`);
      
      // Recarregar categorias e estatísticas
      await Promise.all([
        loadCategories(),
        loadStats()
      ]);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      toast.error('Erro ao alterar status da categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCategories, loadStats]);

  // Reordenar categorias
  const reorderCategories = useCallback(async (categories) => {
    try {
      setLoading(true);
      const result = await categoryService.reorderCategories(categories);
      toast.success('Ordem das categorias atualizada com sucesso');
      
      // Recarregar categorias
      await loadCategories();
      
      return result;
    } catch (err) {
      setError(err.message);
      toast.error('Erro ao reordenar categorias');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadCategories]);

  // Buscar categorias (autocomplete)
  const searchCategories = useCallback(async (query, limit = 10) => {
    try {
      if (!query || query.length < 2) return [];
      const categories = await categoryService.searchCategories(query, limit);
      return categories;
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
      return [];
    }
  }, []);

  // Buscar categorias ativas
  const getActiveCategories = useCallback(async () => {
    try {
      const categories = await categoryService.getActiveCategories();
      return categories;
    } catch (err) {
      console.error('Erro ao buscar categorias ativas:', err);
      return [];
    }
  }, []);

  // Buscar categorias com produtos
  const getCategoriesWithProducts = useCallback(async () => {
    try {
      const categories = await categoryService.getCategoriesWithProducts();
      return categories;
    } catch (err) {
      console.error('Erro ao buscar categorias com produtos:', err);
      return [];
    }
  }, []);

  // Validar nome único da categoria
  const validateCategoryName = useCallback(async (name, categoryId = null) => {
    try {
      const result = await categoryService.validateCategoryName(name, categoryId);
      return result;
    } catch (err) {
      console.error('Erro ao validar nome da categoria:', err);
      return { valid: false, message: 'Erro ao validar nome' };
    }
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Efeito para carregar dados quando filtros mudarem
  useEffect(() => {
    loadCategories();
  }, [filters]);

  return {
    // Estado
    categories,
    loading,
    error,
    stats,
    filters,
    
    // Ações
    loadCategories,
    loadStats,
    loadInitialData,
    updateFilters,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    reorderCategories,
    searchCategories,
    getActiveCategories,
    getCategoriesWithProducts,
    validateCategoryName,
    clearError
  };
};
