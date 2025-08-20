import jwt_decode from 'jwt-decode';

/**
 * Verifica se um token JWT está expirado
 * @param {string} token - Token JWT
 * @returns {boolean} - true se expirado, false caso contrário
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return true;
  }
};

/**
 * Decodifica um token JWT e retorna as informações do usuário
 * @param {string} token - Token JWT
 * @returns {object|null} - Informações do usuário ou null se inválido
 */
export const decodeToken = (token) => {
  try {
    return jwt_decode(token);
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
};

/**
 * Obtém o token do localStorage
 * @returns {string|null} - Token ou null se não existir
 */
export const getStoredToken = () => {
  return localStorage.getItem('token');
};

/**
 * Salva o token no localStorage
 * @param {string} token - Token JWT
 */
export const storeToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Remove o token do localStorage
 */
export const removeStoredToken = () => {
  localStorage.removeItem('token');
};

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean} - true se autenticado, false caso contrário
 */
export const isAuthenticated = () => {
  const token = getStoredToken();
  return token && !isTokenExpired(token);
};

/**
 * Obtém informações do usuário do token armazenado
 * @returns {object|null} - Informações do usuário ou null se não autenticado
 */
export const getCurrentUser = () => {
  const token = getStoredToken();
  if (!token || isTokenExpired(token)) {
    return null;
  }
  return decodeToken(token);
};

/**
 * Verifica se o usuário tem uma role específica
 * @param {string} requiredRole - Role requerida
 * @returns {boolean} - true se tem a role, false caso contrário
 */
export const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  return user && user.role === requiredRole;
};

/**
 * Verifica se o usuário tem uma das roles especificadas
 * @param {string[]} requiredRoles - Array de roles requeridas
 * @returns {boolean} - true se tem uma das roles, false caso contrário
 */
export const hasAnyRole = (requiredRoles) => {
  const user = getCurrentUser();
  return user && requiredRoles.includes(user.role);
};

/**
 * Formata a data de expiração do token
 * @param {string} token - Token JWT
 * @returns {string} - Data formatada ou 'Inválido' se erro
 */
export const getTokenExpirationDate = (token) => {
  try {
    const decoded = jwt_decode(token);
    return new Date(decoded.exp * 1000).toLocaleString('pt-BR');
  } catch (error) {
    return 'Inválido';
  }
};

/**
 * Calcula o tempo restante até a expiração do token
 * @param {string} token - Token JWT
 * @returns {number} - Tempo restante em segundos ou 0 se expirado
 */
export const getTokenTimeRemaining = (token) => {
  try {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    const timeRemaining = decoded.exp - currentTime;
    return Math.max(0, timeRemaining);
  } catch (error) {
    return 0;
  }
};
