// Configurações da API
export const API_CONFIG = {
  // URL base da API - Detecta automaticamente se é desenvolvimento ou produção
  get BASE_URL() {
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('localhost');
    
    return isDevelopment 
      ? 'http://localhost:4000/api'
      : 'https://food.546digitalservices.com/api';
  },
  
  // Timeout das requisições
  TIMEOUT: 10000,
  
  // Endpoints de autenticação
  AUTH: {
    LOGIN: '/auth/login',
    LOGIN_PIN: '/auth/login-pin',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    TEST_DB: '/auth/test-db',
  },
  
  // Endpoints do dashboard
  DASHBOARD: {
    MAIN: '/dashboard',
    REAL_TIME: '/dashboard/real-time',
    SIMPLE_TEST: '/dashboard/simple-test',
    DEBUG: '/dashboard/debug',
  },
  
  // Endpoints de sistema
  SYSTEM: {
    HEALTH: '/health',
    DIAGNOSTIC: '/diagnostic',
  },
  
  // Endpoints de usuários
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
  },
  
  // Endpoints de produtos
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    UPDATE: '/products/:id',
    DELETE: '/products/:id',
    CATEGORIES: '/products/categories',
    MODIFIERS: '/products/modifiers',
  },
  
  // Endpoints de pedidos
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    UPDATE: '/orders/:id',
    DELETE: '/orders/:id',
    STATUS: '/orders/:id/status',
  },
  
  // Endpoints de mesas
  TABLES: {
    LIST: '/tables',
    CREATE: '/tables',
    UPDATE: '/tables/:id',
    DELETE: '/tables/:id',
    STATUS: '/tables/:id/status',
  },
  
  // Endpoints de reservas
  RESERVATIONS: {
    LIST: '/reservations',
    CREATE: '/reservations',
    UPDATE: '/reservations/:id',
    DELETE: '/reservations/:id',
    GET: '/reservations/:id',
    AVAILABILITY: '/reservations/availability/check',
    BY_CUSTOMER: '/reservations/customer/:customer_id',
    STATS: '/reservations/stats/summary',
  },
  
  // Endpoints de estoque
  STOCK: {
    LIST: '/stock',
    MOVEMENTS: '/stock/movements',
    INGREDIENTS: '/stock/ingredients',
  },
  
  // Endpoints de relatórios
  REPORTS: {
    SALES: '/reports/sales',
    INVENTORY: '/reports/inventory',
    USERS: '/reports/users',
  },
};

// Função para obter URL completa de um endpoint
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Função para verificar se está em desenvolvimento
export const isDevelopment = () => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('localhost');
};

// Log da configuração atual
console.log('🌐 [API Config] Configuração carregada:', {
  hostname: window.location.hostname,
  isDevelopment: isDevelopment(),
  baseURL: API_CONFIG.BASE_URL,
  timestamp: new Date().toISOString()
});

// Configurações de autenticação
export const AUTH_CONFIG = {
  // Tempo de expiração do token em segundos
  TOKEN_EXPIRY: 3600, // 1 hora
  
  // Tempo para renovar o token antes da expiração (em segundos)
  REFRESH_BEFORE_EXPIRY: 300, // 5 minutos
  
  // Nome da chave no localStorage
  TOKEN_KEY: 'token',
  
  // Nome da chave no localStorage para refresh token
  REFRESH_TOKEN_KEY: 'refreshToken',
};

// Configurações de roles e permissões
export const ROLES = {
  ADMIN: 'admin',
  WAITER: 'waiter',
  KITCHEN: 'cozinha',
};

export const PERMISSIONS = {
  // Gerenciamento de usuários
  USERS_MANAGE: 'users.manage',
  
  // Gerenciamento de produtos
  PRODUCTS_MANAGE: 'products.manage',
  PRODUCTS_VIEW: 'products.view',
  
  // Gerenciamento de pedidos
  ORDERS_MANAGE: 'orders.manage',
  ORDERS_VIEW: 'orders.view',
  
  // Gerenciamento de mesas
  TABLES_MANAGE: 'tables.manage',
  TABLES_VIEW: 'tables.view',
  
  // Gerenciamento de estoque
  STOCK_MANAGE: 'stock.manage',
  STOCK_VIEW: 'stock.view',
  
  // Visualização de relatórios
  REPORTS_VIEW: 'reports.view',
};

// Mapeamento de roles para permissões
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.WAITER]: [
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.TABLES_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
  ],
  [ROLES.KITCHEN]: [
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.STOCK_MANAGE,
  ],
};

// Configurações de rotas da aplicação
export const APP_ROUTES = {
  // Rotas públicas
  PUBLIC: {
    LOGIN: '/login',
    CARDAPIO: '/cardapio',
  },
  
  // Rotas administrativas
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    PRODUCTS: '/admin/produtos',
    CATEGORIES: '/admin/product-categories',
    MODIFIERS: '/admin/product-modifiers',
    ORDERS: '/admin/pedidos',
    STOCK: '/admin/stock-movements',
    REPORTS: '/admin/reports',
    TABLES: '/admin/mesas',
    COMMISSION: '/admin/comissao',
    INGREDIENTS: '/admin/ingredients',
  },
  
  // Rotas do garçom
  WAITER: {
    DASHBOARD: '/garcom/dashboard',
    TABLES: '/garcom/mesas',
    ORDERS: '/garcom/pedido',
    COMMISSION: '/garcom/comissao',
  },
  
  // Rotas da cozinha
  KITCHEN: {
    DASHBOARD: '/cozinha',
    ORDERS: '/kitchen/orders',
    STOCK: '/kitchen/stock',
  },
  
  // Rotas gerais
  GENERAL: {
    DASHBOARD: '/',
    MENU: '/menu',
    ORDERS: '/orders',
    STOCK: '/stock',
    CATEGORIES: '/categories',
    INGREDIENTS: '/ingredients',
  },
};
