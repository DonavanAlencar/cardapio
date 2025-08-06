import axios from 'axios';

const api = axios.create({
  //baseURL: 'http://localhost:4000/api',
  baseURL: process.env.REACT_APP_API_BASE_URL,  // usa a env var
});

// Adicionar interceptor para incluir token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;