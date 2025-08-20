import axios from 'axios';
import { isTokenExpired, removeStoredToken } from '../utils/authUtils';

// Configuração hardcoded para resolver o problema de Mixed Content
// Em produção, isso deve ser configurado via variáveis de ambiente
const baseURL = 'https://food.546digitalservices.com/api';

const api = axios.create({
  baseURL,
  timeout: 10000, // Timeout de 10 segundos
});

// Interceptor para incluir token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Verifica se o token não está expirado antes de usar
      if (isTokenExpired(token)) {
        console.warn('Token expirado detectado, removendo...');
        removeStoredToken();
        // Redireciona para login se estiver em uma rota protegida
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('Token expirado'));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log para debug
    console.log(`🌐 [API] ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasToken: !!token
    });
    
    return config;
  },
  (error) => {
    console.error('❌ [API] Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta para tratamento de erros
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API] Resposta recebida:`, {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ [API] Erro na resposta:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      response: error.response?.data
    });

    // Tratamento específico para erros de autenticação
    if (error.response?.status === 401) {
      console.warn('Erro 401 detectado, removendo token...');
      removeStoredToken();
      
      // Redireciona para login se não estiver já na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Tratamento para erros de rede
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      console.error('Erro de rede detectado:', error.message);
    }

    // Tratamento para timeouts
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout da requisição:', error.message);
    }

    return Promise.reject(error);
  }
);

// Função para renovar token
export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh');
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      return response.data.token;
    }
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    removeStoredToken();
    throw error;
  }
};

// Função para fazer logout
export const logout = () => {
  removeStoredToken();
  delete api.defaults.headers.common['Authorization'];
  
  // Redireciona para login
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

export default api;
