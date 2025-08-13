import axios from 'axios';

// Configuração hardcoded para resolver o problema de Mixed Content
// Em produção, isso deve ser configurado via variáveis de ambiente
const baseURL = 'https://food.546digitalservices.com/api';

const api = axios.create({
  baseURL,
  timeout: 10000, // Timeout de 10 segundos
});

// Adicionar interceptor para incluir token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
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

// Interceptor de resposta para debug
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
    return Promise.reject(error);
  }
);

export default api;
