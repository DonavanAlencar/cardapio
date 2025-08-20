# Sistema de Autenticação - Cardápio Digital

## Visão Geral

Este documento descreve o sistema de autenticação implementado no projeto `front_new`, que replica e melhora as funcionalidades de login do projeto `frontend` original.

## Arquitetura

### 1. Contexto de Autenticação (`AuthContext`)

O `AuthContext` é o núcleo do sistema de autenticação, gerenciando:

- **Estado de autenticação**: usuário logado, token, loading
- **Funções de autenticação**: login, logout, login com PIN
- **Verificação de permissões**: roles e acesso a rotas
- **Gerenciamento de token**: validação, expiração, renovação

### 2. Hook Personalizado (`useAuth`)

O hook `useAuth` fornece acesso fácil ao contexto de autenticação em qualquer componente:

```jsx
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  // ... resto do componente
};
```

### 3. Hook de Permissões (`usePermissions`)

Hook especializado para verificação de permissões:

```jsx
import { usePermissions } from '../hooks/usePermissions';

const AdminComponent = () => {
  const { isAdmin, canManageUsers, hasPermission } = usePermissions();
  
  if (!isAdmin()) return <div>Acesso negado</div>;
  // ... resto do componente
};
```

### 4. Utilitários de Autenticação (`authUtils`)

Funções utilitárias para:

- Verificação de expiração de token
- Decodificação de JWT
- Gerenciamento de localStorage
- Verificação de roles e permissões

### 5. Configuração Centralizada (`apiConfig`)

Configurações centralizadas para:

- URLs da API
- Endpoints de autenticação
- Roles e permissões
- Rotas da aplicação

## Funcionalidades Implementadas

### ✅ Login com Email e Senha

- Validação de formulário
- Teste de conectividade com backend
- Tratamento de erros específicos
- Redirecionamento baseado na role do usuário

### ✅ Login com PIN

- Interface numérica para entrada de PIN
- Validação de 4 dígitos
- Tratamento de erros

### ✅ Sistema de Rotas Protegidas

- `PrivateRoute`: protege rotas que requerem autenticação
- `PublicRoute`: redireciona usuários já logados
- Verificação de roles para acesso específico

### ✅ Gerenciamento de Token

- Armazenamento seguro no localStorage
- Verificação automática de expiração
- Interceptors para renovação automática
- Tratamento de erros 401

### ✅ Sistema de Roles e Permissões

- **Admin**: Acesso total ao sistema
- **Waiter (Garçom)**: Gerenciamento de mesas e pedidos
- **Kitchen (Cozinha)**: Gerenciamento de estoque e pedidos

### ✅ Componentes de UI

- `LoadingSpinner`: Indicador de carregamento
- `LogoutButton`: Botão de logout reutilizável
- `UserInfo`: Exibição de informações do usuário

## Estrutura de Arquivos

```
src/
├── contexts/
│   └── AuthContext.jsx          # Contexto principal de autenticação
├── hooks/
│   ├── useAuth.js               # Hook principal de autenticação
│   └── usePermissions.js        # Hook de verificação de permissões
├── components/
│   ├── LoadingSpinner/          # Componente de loading
│   ├── LogoutButton/            # Botão de logout
│   └── UserInfo/                # Informações do usuário
├── services/
│   └── api.js                   # Configuração do Axios com interceptors
├── utils/
│   └── authUtils.js             # Utilitários de autenticação
├── config/
│   └── apiConfig.js             # Configurações centralizadas
└── pages/
    └── Login/
        └── Login.jsx            # Página de login atualizada
```

## Como Usar

### 1. Configurar o Provider

```jsx
// App.jsx
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoutesIndex />
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### 2. Usar em Componentes

```jsx
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Faça login para continuar</div>;
  }
  
  return (
    <div>
      <h1>Bem-vindo, {user.name}!</h1>
      <button onClick={logout}>Sair</button>
    </div>
  );
};
```

### 3. Proteger Rotas

```jsx
import { PrivateRoute } from '../components/PrivateRoute';

<Route 
  path="/admin" 
  element={
    <PrivateRoute role="admin">
      <AdminDashboard />
    </PrivateRoute>
  } 
/>
```

### 4. Verificar Permissões

```jsx
import { usePermissions } from '../hooks/usePermissions';

const AdminPanel = () => {
  const { isAdmin, canManageUsers } = usePermissions();
  
  if (!isAdmin()) {
    return <div>Acesso negado</div>;
  }
  
  return (
    <div>
      {canManageUsers() && <UserManagement />}
      <OtherAdminFeatures />
    </div>
  );
};
```

## Configuração

### Variáveis de Ambiente

O sistema está configurado para usar a API em `https://food.546digitalservices.com/api`. Para alterar:

1. Edite `src/config/apiConfig.js`
2. Altere `BASE_URL` para sua API
3. Atualize os endpoints conforme necessário

### Personalização de Roles

Para adicionar novas roles ou permissões:

1. Edite `src/config/apiConfig.js`
2. Adicione novas roles em `ROLES`
3. Adicione novas permissões em `PERMISSIONS`
4. Configure o mapeamento em `ROLE_PERMISSIONS`

## Segurança

### ✅ Implementado

- Validação de token JWT
- Verificação de expiração automática
- Interceptors para tratamento de erros 401
- Redirecionamento automático para login
- Verificação de roles em rotas protegidas

### 🔒 Recomendações

- Implementar refresh token automático
- Adicionar rate limiting para tentativas de login
- Implementar logout em todas as abas (BroadcastChannel)
- Adicionar logging de atividades de autenticação
- Implementar 2FA para usuários admin

## Troubleshooting

### Problemas Comuns

1. **Token não é salvo**: Verifique se o localStorage está disponível
2. **Redirecionamento infinito**: Verifique se as rotas estão configuradas corretamente
3. **Erro 401 persistente**: Verifique se o token está sendo enviado corretamente
4. **Role não reconhecida**: Verifique se a role está definida em `ROLES`

### Debug

- Use o console do navegador para logs detalhados
- Ative o modo de diagnóstico na tela de login
- Verifique o localStorage para tokens
- Use o React DevTools para inspecionar o contexto

## Migração do Projeto Original

### O que foi Migrado

- ✅ Lógica de login com email/senha
- ✅ Lógica de login com PIN
- ✅ Sistema de roles (admin, waiter, kitchen)
- ✅ Redirecionamento baseado em roles
- ✅ Tratamento de erros de API
- ✅ Teste de conectividade

### Melhorias Implementadas

- ✅ Contexto de autenticação global
- ✅ Sistema de rotas protegidas mais robusto
- ✅ Hooks personalizados para autenticação
- ✅ Componentes reutilizáveis
- ✅ Configuração centralizada
- ✅ Tratamento automático de tokens expirados
- ✅ Sistema de permissões granular
- ✅ Melhor UX com loading states e feedback de erro

## Conclusão

O sistema de autenticação implementado no `front_new` é uma evolução significativa do sistema original do `frontend`, oferecendo:

- **Maior segurança**: Validação automática de tokens e tratamento de erros
- **Melhor UX**: Estados de loading, feedback de erro e redirecionamentos inteligentes
- **Manutenibilidade**: Código organizado, hooks reutilizáveis e configuração centralizada
- **Escalabilidade**: Sistema de permissões flexível e fácil de estender

O sistema está pronto para uso em produção e pode ser facilmente adaptado para novas funcionalidades e requisitos de segurança.
