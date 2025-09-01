import { useState, useEffect } from 'react';
import api from '../services/api';

export const useNotificationCounts = () => {
  console.log('🎯 [useNotificationCounts] Hook inicializado');
  
  const [counts, setCounts] = useState({
    kitchen: 0,
    orders: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCounts = async () => {
    try {
      console.log('🔄 [useNotificationCounts] Iniciando busca dos contadores...');
      setLoading(true);
      
      // Verificar se há token
      const token = localStorage.getItem('token');
      console.log('🔑 [useNotificationCounts] Token disponível:', !!token);
      
      console.log('🌐 [useNotificationCounts] Fazendo requisições para:', {
        kitchen: '/kitchen/pending-count',
        orders: '/orders/pending-count'
      });
      
      const [kitchenRes, ordersRes] = await Promise.all([
        api.get('/kitchen/pending-count'),
        api.get('/orders/pending-count')
      ]);

      console.log('✅ [useNotificationCounts] Respostas recebidas:', {
        kitchen: kitchenRes.data,
        orders: ordersRes.data
      });

      setCounts({
        kitchen: kitchenRes.data.count,
        orders: ordersRes.data.count
      });
      setError(null);
    } catch (err) {
      console.error('❌ [useNotificationCounts] Erro ao buscar contadores:', err);
      console.error('❌ [useNotificationCounts] Detalhes do erro:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 [useNotificationCounts] useEffect executado');
    
    // Só executar se houver token
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('🚫 [useNotificationCounts] Sem token, não executando busca');
      return;
    }
    
    console.log('✅ [useNotificationCounts] Token encontrado, executando busca inicial');
    fetchCounts();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        console.log('🔄 [useNotificationCounts] Executando atualização automática');
        fetchCounts();
      }
    }, 30000);
    
    return () => {
      console.log('🧹 [useNotificationCounts] Limpando intervalo');
      clearInterval(interval);
    };
  }, []);

  const refreshCounts = () => {
    console.log('🔄 [useNotificationCounts] Refresh manual solicitado');
    fetchCounts();
  };

  console.log('📊 [useNotificationCounts] Estado atual:', { counts, loading, error });

  return {
    counts,
    loading,
    error,
    refreshCounts
  };
};
