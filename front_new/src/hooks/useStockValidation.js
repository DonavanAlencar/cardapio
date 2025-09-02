import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook para validação de estoque de produtos
 * Reutiliza a estrutura existente do projeto
 */
export const useStockValidation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Verifica se um produto tem estoque suficiente
   * @param {number} productId - ID do produto
   * @param {number} quantity - Quantidade desejada
   * @returns {Promise<{hasStock: boolean, availableStock: number, ingredients: Array}>}
   */
  const checkProductStock = useCallback(async (productId, quantity = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/stock/check-product/${productId}`, {
        params: { quantity }
      });
      
      return {
        hasStock: response.data.hasStock,
        availableStock: response.data.availableStock,
        ingredients: response.data.ingredients || [],
        message: response.data.message
      };
    } catch (err) {
      console.error('Erro ao verificar estoque:', err);
      setError(err.message);
      return {
        hasStock: false,
        availableStock: 0,
        ingredients: [],
        message: 'Erro ao verificar estoque'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verifica estoque para múltiplos produtos
   * @param {Array} products - Array de {productId, quantity}
   * @returns {Promise<Array>}
   */
  const checkMultipleProductsStock = useCallback(async (products) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/stock/check-multiple-products', {
        products
      });
      
      return response.data.results;
    } catch (err) {
      console.error('Erro ao verificar estoque múltiplo:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtém produtos com estoque baixo
   * @returns {Promise<Array>}
   */
  const getLowStockProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/stock/alerts/low-stock');
      return response.data.alerts || [];
    } catch (err) {
      console.error('Erro ao buscar produtos com estoque baixo:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    checkProductStock,
    checkMultipleProductsStock,
    getLowStockProducts,
    loading,
    error
  };
};

export default useStockValidation;
