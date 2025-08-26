const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(requiredRole) {
  return (req, res, next) => {
    console.log('🔐 AuthMiddleware - Iniciando verificação...');
    console.log('🔐 AuthMiddleware - URL:', req.url);
    console.log('🔐 AuthMiddleware - Method:', req.method);
    
    // Verificar se JWT_SECRET está definido
    if (!process.env.JWT_SECRET) {
      console.error('❌ AuthMiddleware - JWT_SECRET não definido!');
      return res.status(500).json({ 
        error: 'Erro de configuração do servidor',
        details: 'JWT_SECRET não configurado'
      });
    }
    
    const authHeader = req.headers['authorization'];
    console.log('🔐 AuthMiddleware - Auth header:', authHeader ? 'Presente' : 'Ausente');
    
    if (!authHeader) {
      console.log('❌ AuthMiddleware - Header de autorização ausente');
      return res.status(401).json({ 
        error: 'Token de autorização não fornecido',
        details: 'Header Authorization é obrigatório'
      });
    }
    
    const token = authHeader && authHeader.split(' ')[1];
    console.log('🔐 AuthMiddleware - Token extraído:', token ? 'Sim' : 'Não');
    
    if (!token) {
      console.log('❌ AuthMiddleware - Token não encontrado no header');
      return res.status(401).json({ 
        error: 'Token inválido',
        details: 'Formato do header Authorization inválido'
      });
    }
    
    try {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          console.error('❌ AuthMiddleware - Erro na verificação do token:', err.message);
          
          if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
              error: 'Token expirado',
              details: 'Faça login novamente'
            });
          } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
              error: 'Token inválido',
              details: 'Token malformado ou corrompido'
            });
          } else {
            return res.status(403).json({ 
              error: 'Token inválido',
              details: err.message
            });
          }
        }
        
        console.log('✅ AuthMiddleware - Token válido, usuário:', decoded.username || decoded.id);
        console.log('✅ AuthMiddleware - Dados do usuário:', {
          id: decoded.id,
          username: decoded.username,
          role: decoded.role,
          branch_id: decoded.branch_id
        });
        
        req.user = decoded;
        
        if (requiredRole && req.user.role !== requiredRole) {
          console.log('❌ AuthMiddleware - Role insuficiente:', {
            required: requiredRole,
            user: req.user.role
          });
          return res.status(403).json({ 
            error: 'Acesso negado',
            details: `Role ${requiredRole} é obrigatório`
          });
        }
        
        console.log('✅ AuthMiddleware - Verificação concluída, prosseguindo...');
        next();
      });
    } catch (error) {
      console.error('❌ AuthMiddleware - Erro inesperado:', error);
      return res.status(500).json({ 
        error: 'Erro interno na autenticação',
        details: error.message
      });
    }
  };
}

module.exports = authMiddleware;