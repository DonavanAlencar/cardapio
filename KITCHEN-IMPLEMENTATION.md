# Implementação da Tela de Cozinha

## Visão Geral

Este documento descreve a implementação completa das funcionalidades da tela de cozinha para o sistema de cardápio, incluindo backend e frontend.

## Funcionalidades Implementadas

### 🍳 Backend (API)

#### Rotas da Cozinha (`/api/kitchen`)

1. **GET `/orders`** - Listar todos os pedidos da cozinha com filtros
   - Filtros: status, branch_id, date_from, date_to, search
   - Retorna pedidos com itens, status e estatísticas

2. **GET `/orders/status/:status`** - Buscar pedidos por status específico
   - Status válidos: pending, in_preparation, ready, served, closed, cancelled

3. **GET `/orders/:id`** - Buscar detalhes de um pedido específico
   - Inclui itens, modificadores, observações e tickets da cozinha

4. **PATCH `/orders/:id/status`** - Atualizar status de um pedido
   - Atualiza status e itens automaticamente
   - Suporte a observações

5. **PATCH `/orders/:id/items/:itemId/status`** - Atualizar status de item específico
   - Atualiza status do item e verifica se todos estão prontos

6. **PATCH `/orders/:id/ready`** - Marcar pedido como pronto
   - Atualiza todos os itens para 'ready'

7. **PATCH `/orders/:id/delivered`** - Marcar pedido como entregue
   - Atualiza todos os itens para 'served'

8. **POST `/orders/:id/notes`** - Adicionar observações ao pedido
   - Cria tabela `order_notes` automaticamente se não existir

9. **GET `/stats`** - Estatísticas da cozinha
   - Contadores por status, tempo médio de preparo

10. **GET `/orders/history`** - Histórico de pedidos
    - Filtros por data, status e filial

11. **GET `/orders/urgent`** - Pedidos urgentes
    - Pedidos aguardando há mais de 30 minutos

12. **GET `/orders/table/:tableId`** - Pedidos por mesa
    - Verifica permissões da filial

13. **GET `/orders/customer/:customerId`** - Pedidos por cliente
    - Filtra por filial do usuário

14. **PATCH `/orders/:id/cancel`** - Cancelar pedido
    - Requer motivo do cancelamento

15. **PATCH `/orders/:id/reactivate`** - Reativar pedido cancelado
    - Apenas pedidos cancelados podem ser reativados

16. **GET `/stock/low`** - Produtos com estoque baixo
    - Baseado em ingredientes

17. **GET `/ingredients/low-stock`** - Ingredientes com estoque baixo
    - Níveis: CRÍTICO, BAIXO, NORMAL

#### Middleware de Autorização

- **`authorizeKitchenAccess`** - Verifica se usuário tem role: admin, cozinha ou waiter
- Suporte a múltiplas roles para flexibilidade

#### WebSocket Integration

- Eventos em tempo real para mudanças de status
- Salas específicas para cozinha
- Notificações automáticas para mudanças

### 🎨 Frontend (React + Material-UI)

#### Componente Kitchen

1. **Dashboard com Estatísticas**
   - Contadores por status (Pendentes, Em Preparo, Prontos, Entregues)
   - Atualização automática a cada 30 segundos

2. **Sistema de Filtros**
   - Filtros por status (chips clicáveis)
   - Filtros avançados (busca, datas, filial)
   - Ordenação por prioridade ou tempo

3. **Visualização em Tabs**
   - **Tab 1**: Pedidos principais com cards
   - **Tab 2**: Pedidos urgentes (mais de 30 min)
   - **Tab 3**: Ingredientes com estoque baixo

4. **Cards de Pedidos**
   - Informações: ID, mesa, cliente, itens, total
   - Indicadores visuais de prioridade por tempo
   - Status dos itens individuais
   - Ações contextuais por status

5. **Modal de Detalhes**
   - Informações completas do pedido
   - Lista de itens com modificadores
   - Ações de mudança de status

6. **Sistema de Notificações**
   - Snackbar para feedback de ações
   - Notificações WebSocket em tempo real
   - Diferentes tipos: success, error, warning, info

7. **Controles Avançados**
   - Atualização automática configurável
   - FAB para ações rápidas
   - Responsivo para mobile

#### Serviço KitchenService

- **`getKitchenOrders()`** - Buscar pedidos com filtros
- **`updateOrderStatus()`** - Atualizar status
- **`markOrderAsReady()`** - Marcar como pronto
- **`markOrderAsDelivered()`** - Marcar como entregue
- **`cancelOrder()`** - Cancelar pedido
- **`getKitchenStats()`** - Estatísticas
- **`getUrgentOrders()`** - Pedidos urgentes
- **`getLowStockIngredients()`** - Estoque baixo

## Estrutura do Banco de Dados

### Tabelas Principais

1. **`orders`** - Pedidos principais
2. **`order_items`** - Itens dos pedidos
3. **`kitchen_tickets`** - Tickets da cozinha
4. **`kitchen_ticket_items`** - Itens dos tickets
5. **`order_notes`** - Observações dos pedidos (nova)
6. **`customers`** - Clientes
7. **`tables`** - Mesas
8. **`products`** - Produtos
9. **`ingredientes`** - Ingredientes para estoque

### Status dos Pedidos

- **`pending`** - Pendente (aguardando preparo)
- **`in_preparation`** - Em Preparo
- **`ready`** - Pronto (aguardando entrega)
- **`served`** - Entregue
- **`closed`** - Fechado
- **`cancelled`** - Cancelado

### Status dos Itens

- **`pending`** - Pendente
- **`in_preparation`** - Em Preparo
- **`ready`** - Pronto
- **`served`** - Entregue

## Instalação e Configuração

### 1. Backend

```bash
cd backend

# Executar scripts SQL para criar tabelas necessárias
mysql -u username -p database_name < create_order_notes_table.sql
mysql -u username -p database_name < add_kitchen_role.sql

# Reiniciar servidor
npm run dev
```

### 2. Frontend

```bash
cd front_new

# Instalar dependências adicionais
npm install @mui/x-date-pickers date-fns

# Iniciar aplicação
npm run dev
```

### 3. Configuração de Roles

- Adicionar role 'cozinha' na tabela `roles`
- Atribuir role aos usuários da cozinha na tabela `user_roles`

## Uso das Funcionalidades

### Para Cozinheiros

1. **Visualizar Pedidos**
   - Acessar `/cozinha`
   - Ver pedidos pendentes em tempo real
   - Filtrar por status ou mesa

2. **Gerenciar Status**
   - Clicar em "Iniciar" para pedidos pendentes
   - Clicar em "Pronto" quando concluído
   - Clicar em "Entregar" após entrega

3. **Monitorar Urgências**
   - Ver pedidos aguardando há mais de 30 min
   - Priorizar pedidos urgentes

4. **Controle de Estoque**
   - Monitorar ingredientes com estoque baixo
   - Identificar produtos que precisam de reposição

### Para Administradores

1. **Configuração de Roles**
   - Atribuir role 'cozinha' aos funcionários
   - Gerenciar permissões de acesso

2. **Monitoramento**
   - Acompanhar estatísticas em tempo real
   - Ver histórico de pedidos
   - Analisar tempo médio de preparo

## WebSocket Events

### Eventos Enviados

- **`order:status_changed`** - Status do pedido alterado
- **`order:ready`** - Pedido marcado como pronto
- **`order:delivered`** - Pedido entregue
- **`order:cancelled`** - Pedido cancelado
- **`item:status_changed`** - Status do item alterado

### Eventos Recebidos

- **`orders:updated`** - Lista de pedidos atualizada
- **`order:created`** - Novo pedido criado

## Segurança

- **Autenticação JWT** obrigatória
- **Autorização por role** (admin, cozinha, waiter)
- **Validação de filial** para acesso a dados
- **Sanitização de inputs** SQL injection
- **Rate limiting** para prevenir abuso

## Performance

- **Paginação** de resultados
- **Índices** em campos de busca
- **Cache** de estatísticas
- **WebSocket** para atualizações em tempo real
- **Lazy loading** de dados

## Troubleshooting

### Problemas Comuns

1. **Erro 403 - Acesso Negado**
   - Verificar se usuário tem role adequado
   - Verificar se role 'cozinha' existe no banco

2. **WebSocket não conecta**
   - Verificar configuração CORS
   - Verificar se servidor está rodando

3. **Pedidos não aparecem**
   - Verificar permissões da filial
   - Verificar se tabelas foram criadas

4. **Erro de dependências**
   - Executar `npm install` no frontend
   - Verificar versões das dependências

### Logs

- Backend: `app.log` e console
- Frontend: Console do navegador
- WebSocket: Logs de conexão e eventos

## Próximos Passos

1. **Relatórios Avançados**
   - Métricas de produtividade
   - Análise de tendências

2. **Integração com Impressora**
   - Impressão automática de tickets
   - QR codes para rastreamento

3. **Mobile App**
   - Aplicativo nativo para cozinheiros
   - Notificações push

4. **IA e Automação**
   - Previsão de tempo de preparo
   - Sugestões de priorização

## Contribuição

Para contribuir com melhorias:

1. Fork do repositório
2. Criar branch para feature
3. Implementar mudanças
4. Testar funcionalidades
5. Criar Pull Request

## Suporte

- **Issues**: GitHub Issues
- **Documentação**: Este arquivo e comentários no código
- **Comunidade**: Discussões no repositório
