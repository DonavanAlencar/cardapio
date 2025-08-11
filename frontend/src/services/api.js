import axios from 'axios';

const [, firstSegment] = window.location.pathname.split('/');
const apiBasePath = firstSegment ? `/${firstSegment}/api` : '/api';
const baseURL =
  process.env.REACT_APP_API_BASE_URL || `${window.location.origin}${apiBasePath}`;

const api = axios.create({
  baseURL,
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
