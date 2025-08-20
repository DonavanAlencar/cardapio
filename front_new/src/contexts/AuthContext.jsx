import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import api from '../services/api';
import { API_CONFIG, AUTH_CONFIG, APP_ROUTES } from '../config/apiConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Verifica se o token está expirado
  const isTokenExpired = (token) => {
    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  // Inicializa a autenticação ao carregar a aplicação
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
      
      if (storedToken && !isTokenExpired(storedToken)) {
        try {
          const decoded = jwt_decode(storedToken);
          setUser(decoded);
          setToken(storedToken);
          setIsAuthenticated(true);
          
          // Configura o token no axios
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        } catch (error) {
          console.error('Erro ao decodificar token:', error);
          logout();
        }
      } else if (storedToken && isTokenExpired(storedToken)) {
        console.log('Token expirado, fazendo logout...');
        logout();
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Função de login
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      
      const response = await api.post(API_CONFIG.AUTH.LOGIN, { email, password });
      
      if (response.data && response.data.token && response.data.user) {
        const { token: newToken, user: userData } = response.data;
        
        // Salva no localStorage
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, newToken);
        
        // Configura o token no axios
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        // Atualiza o estado
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Redireciona com base na role do usuário
        if (userData.role === 'admin') {
          navigate(APP_ROUTES.ADMIN.ORDERS);
        } else if (userData.role === 'waiter') {
          navigate(APP_ROUTES.WAITER.TABLES);
        } else {
          navigate(APP_ROUTES.GENERAL.DASHBOARD);
        }
        
        return { success: true, user: userData };
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de login com PIN
  const loginWithPin = async (pin) => {
    try {
      setIsLoading(true);
      
      const response = await api.post(API_CONFIG.AUTH.LOGIN_PIN, { pin });
      
      if (response.data && response.data.token && response.data.user) {
        const { token: newToken, user: userData } = response.data;
        
        // Salva no localStorage
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, newToken);
        
        // Configura o token no axios
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        // Atualiza o estado
        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Redireciona com base na role do usuário
        if (userData.role === 'admin') {
          navigate(APP_ROUTES.ADMIN.ORDERS);
        } else if (userData.role === 'waiter') {
          navigate(APP_ROUTES.WAITER.TABLES);
        } else {
          navigate(APP_ROUTES.GENERAL.DASHBOARD);
        }
        
        return { success: true, user: userData };
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro no login com PIN:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    // Remove o token do localStorage
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    
    // Remove o token do axios
    delete api.defaults.headers.common['Authorization'];
    
    // Limpa o estado
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Redireciona para login
    navigate(APP_ROUTES.PUBLIC.LOGIN);
  };

  // Verifica se o usuário tem uma role específica
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Verifica se o usuário tem uma das roles especificadas
  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  // Renova o token (pode ser usado para manter a sessão ativa)
  const refreshToken = async () => {
    try {
      const response = await api.post(API_CONFIG.AUTH.REFRESH);
      if (response.data && response.data.token) {
        const newToken = response.data.token;
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        return true;
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      logout();
      return false;
    }
  };

  // Verifica se o usuário está autenticado e tem permissão para acessar uma rota
  const canAccess = (requiredRole = null, requiredRoles = null) => {
    if (!isAuthenticated || !user) {
      return false;
    }

    if (requiredRole) {
      return user.role === requiredRole;
    }

    if (requiredRoles) {
      return requiredRoles.includes(user.role);
    }

    return true;
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    loginWithPin,
    logout,
    hasRole,
    hasAnyRole,
    canAccess,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
