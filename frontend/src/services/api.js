import axios from 'axios';

// Use a base URL defined at build time via REACT_APP_API_BASE_URL.
// When the variable is not provided (e.g. in Kubernetes where the
// frontend is served behind an ingress), fall back to the current
// origin with a standard `/api` prefix. This allows the same build to
// work locally, in Docker, and in Kubernetes without needing to rebuild
// the frontend for each environment.
const baseURL = process.env.REACT_APP_API_BASE_URL || `${window.location.origin}/api`;

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
