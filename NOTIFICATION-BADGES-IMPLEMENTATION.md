# Implementação dos Badges de Notificação

## Visão Geral

Implementei a funcionalidade dos badges numéricos para os menus "Cozinha" e "Pedidos" no frontend novo (`front_new`). Os badges mostram em tempo real o número de itens pendentes para cada seção.

## Funcionalidades Implementadas

### 1. Backend - Novas APIs

#### `/api/kitchen/pending-count`
- **Método**: GET
- **Autenticação**: Requerida
- **Descrição**: Conta os itens pendentes da cozinha
- **Query**: 
  ```sql
  SELECT COUNT(*) as count
  FROM kitchen_ticket_items kti
  JOIN kitchen_tickets kt ON kti.kitchen_ticket_id = kt.id
  WHERE kti.preparation_status IN ('pending', 'preparing')
  AND kt.status IN ('pending', 'in_progress')
  ```

#### `/api/orders/pending-count`
- **Método**: GET
- **Autenticação**: Requerida (admin, waiter, gerente)
- **Descrição**: Conta os pedidos pendentes
- **Query**:
  ```sql
  SELECT COUNT(*) as count
  FROM orders
  WHERE status IN ('open', 'in_preparation')
  ```

### 2. Frontend - Hook Personalizado

#### `useNotificationCounts`
- **Localização**: `front_new/src/hooks/useNotificationCounts.js`
- **Funcionalidades**:
  - Busca contadores das APIs
  - Atualização automática a cada 30 segundos
  - Estado de loading e tratamento de erros
  - Função de refresh manual

### 3. Sidebar Atualizado

#### Menu Principal
- **Cozinha**: Badge mostra itens pendentes da cozinha
- **Outros menus**: Sem badges

#### Menu Administrativo
- **Pedidos**: Badge mostra pedidos pendentes
- **Outros menus**: Sem badges

## Como Funciona

1. **Inicialização**: O hook `useNotificationCounts` é carregado quando o Sidebar é montado
2. **Primeira busca**: Faz requisições para ambas as APIs para obter os contadores iniciais
3. **Atualização automática**: A cada 30 segundos, os contadores são atualizados automaticamente
4. **Renderização**: Os badges são exibidos apenas quando o valor é maior que 0
5. **Estilização**: Os badges usam o CSS existente com cores laranja (#f7931e)

## Estrutura dos Dados

### Resposta da API
```json
{
  "count": 3
}
```

### Estado do Hook
```javascript
{
  counts: {
    kitchen: 3,
    orders: 2
  },
  loading: false,
  error: null
}
```

## Estilização

Os badges já possuem CSS completo:
- **Cor de fundo**: Laranja (#f7931e)
- **Cor do texto**: Marrom escuro (#2d1b1e)
- **Formato**: Círculo com bordas arredondadas
- **Tamanho**: Mínimo de 20px de largura
- **Estados**: Normal e ativo (quando o menu está selecionado)

## Segurança

- Todas as APIs requerem autenticação
- A API de pedidos verifica se o usuário tem role adequado (admin, waiter, gerente)
- A API da cozinha é acessível a usuários autenticados

## Performance

- **Cache**: Os contadores são armazenados em estado local
- **Intervalo**: Atualização a cada 30 segundos (configurável)
- **Requisições paralelas**: Ambas as APIs são chamadas simultaneamente
- **Cleanup**: O intervalo é limpo quando o componente é desmontado

## Uso

### No Sidebar
```javascript
import { useNotificationCounts } from '../../hooks/useNotificationCounts';

export default function Sidebar() {
  const { counts } = useNotificationCounts();
  
  const menuItems = [
    {
      to: '/cozinha',
      label: 'Cozinha',
      icon: '👨‍🍳',
      badge: counts.kitchen, // Badge dinâmico
      active: pathname === '/cozinha'
    }
  ];
}
```

### Badge Condicional
```javascript
{item.badge > 0 && (
  <span className="badge">{item.badge}</span>
)}
```

## Manutenção

### Adicionar Novo Badge
1. Criar nova API no backend
2. Adicionar contador no hook `useNotificationCounts`
3. Atualizar o Sidebar para usar o novo contador

### Modificar Intervalo de Atualização
Alterar o valor em `useNotificationCounts.js`:
```javascript
const interval = setInterval(fetchCounts, 30000); // 30 segundos
```

## Testes

Para testar a funcionalidade:
1. Iniciar o backend: `cd backend && npm start`
2. Iniciar o frontend: `cd front_new && npm run dev`
3. Fazer login como admin
4. Verificar se os badges aparecem nos menus
5. Criar/modificar pedidos para ver as mudanças em tempo real

## Troubleshooting

### Badge não aparece
- Verificar se a API está retornando dados
- Verificar se o usuário tem permissão
- Verificar console do navegador para erros

### Badge não atualiza
- Verificar se o intervalo está funcionando
- Verificar se as APIs estão respondendo
- Verificar se há erros de rede

### Performance
- Ajustar intervalo de atualização se necessário
- Verificar se as queries SQL estão otimizadas
- Monitorar uso de memória do hook
