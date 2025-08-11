import axios from 'axios';

// Use a base URL defined at build time via REACT_APP_API_BASE_URL.
// When the variable is not provided (e.g. in Kubernetes where the
// frontend is served behind an ingress), fall back to a path relative
// to the application's first URL segment. This ensures API calls resolve
// correctly when the app is deployed under a subpath like `/cardapio`.
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
