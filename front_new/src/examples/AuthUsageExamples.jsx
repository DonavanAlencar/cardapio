import React from 'react';
import { Box, Typography, Button, Card, CardContent, Grid } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import LogoutButton from '../components/LogoutButton';
import UserInfo from '../components/UserInfo';

// Exemplo 1: Uso básico do useAuth
const BasicAuthExample = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Exemplo Básico - Não Autenticado</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Use as credenciais padrão: admin@empresa.com / admin123
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => login('admin@empresa.com', 'admin123')}
            sx={{ mt: 1 }}
          >
            Fazer Login Automático
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Exemplo Básico - Autenticado</Typography>
        <Typography variant="body1" gutterBottom>
          Bem-vindo, {user?.name || user?.email}!
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Role: {user?.role}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <LogoutButton variant="button" />
        </Box>
      </CardContent>
    </Card>
  );
};

// Exemplo 2: Uso do usePermissions
const PermissionsExample = () => {
  const { isAdmin, isWaiter, isKitchen, canManageUsers, canManageProducts } = usePermissions();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Exemplo de Permissões</Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Status das Roles:</Typography>
          <Typography variant="body2" color={isAdmin() ? 'success.main' : 'text.secondary'}>
            • Admin: {isAdmin() ? '✅ Sim' : '❌ Não'}
          </Typography>
          <Typography variant="body2" color={isWaiter() ? 'success.main' : 'text.secondary'}>
            • Garçom: {isWaiter() ? '✅ Sim' : '❌ Não'}
          </Typography>
          <Typography variant="body2" color={isKitchen() ? 'success.main' : 'text.secondary'}>
            • Cozinha: {isKitchen() ? '✅ Sim' : '❌ Não'}
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Permissões:</Typography>
          <Typography variant="body2" color={canManageUsers() ? 'success.main' : 'text.secondary'}>
            • Gerenciar Usuários: {canManageUsers() ? '✅ Sim' : '❌ Não'}
          </Typography>
          <Typography variant="body2" color={canManageProducts() ? 'success.main' : 'text.secondary'}>
            • Gerenciar Produtos: {canManageProducts() ? '✅ Sim' : '❌ Não'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Exemplo 3: Componente com proteção de rota
const ProtectedComponentExample = () => {
  const { isAuthenticated, user } = useAuth();
  const { isAdmin } = usePermissions();

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error">
            Acesso Negado
          </Typography>
          <Typography variant="body2">
            Você precisa estar logado para ver este conteúdo.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin()) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="warning.main">
            Permissão Insuficiente
          </Typography>
          <Typography variant="body2">
            Apenas administradores podem acessar este componente.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sua role atual: {user?.role}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" color="success.main">
          Conteúdo Administrativo
        </Typography>
        <Typography variant="body2">
          Este conteúdo só é visível para administradores.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" color="primary">
            Gerenciar Usuários
          </Button>
          <Button variant="contained" color="secondary" sx={{ ml: 1 }}>
            Configurações do Sistema
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// Exemplo 4: Dashboard com informações do usuário
const UserDashboardExample = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Dashboard do Usuário</Typography>
        
        <Box sx={{ mt: 2 }}>
          <UserInfo variant="compact" />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Informações da Sessão:</Typography>
          <Typography variant="body2">
            • Email: {user?.email}
          </Typography>
          <Typography variant="body2">
            • Role: {user?.role}
          </Typography>
          <Typography variant="body2">
            • ID: {user?.id || user?.sub || 'N/A'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Componente principal que mostra todos os exemplos
const AuthUsageExamples = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Exemplos de Uso do Sistema de Autenticação
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Este componente demonstra como usar as diferentes funcionalidades do sistema de autenticação.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <BasicAuthExample />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <PermissionsExample />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ProtectedComponentExample />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <UserDashboardExample />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Como Usar em Seus Componentes
        </Typography>
        
        <Typography variant="body2" paragraph>
          <strong>1. Importe os hooks:</strong>
        </Typography>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
{`import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';`}
        </pre>

        <Typography variant="body2" paragraph>
          <strong>2. Use nos seus componentes:</strong>
        </Typography>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
{`const MyComponent = () => {
  const { user, isAuthenticated } = useAuth();
  const { isAdmin } = usePermissions();
  
  if (!isAuthenticated) return <div>Faça login</div>;
  if (!isAdmin()) return <div>Acesso negado</div>;
  
  return <div>Conteúdo protegido</div>;
};`}
        </pre>
      </Box>
    </Box>
  );
};

export default AuthUsageExamples;
