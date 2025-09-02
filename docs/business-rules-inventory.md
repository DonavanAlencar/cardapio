# Inventário de Regras de Negócio — Projeto Cardápio

## Resumo Executivo

**Total de regras identificadas:** 47 regras de negócio
- **Frontend (React):** 23 regras
- **Backend (APIs):** 18 regras  
- **Banco de dados:** 6 regras

**Top 5 riscos identificados:**
1. ✅ **Validação de estoque** - IMPLEMENTADO: Frontend valida estoque antes de criar pedidos
2. **Controle de permissões por role** - Sistema de roles implementado mas validação inconsistente
3. **Validação de preços** - Falta validação de preços negativos ou zero
4. **Gestão de sessões** - Timeout de sessão não configurado
5. **Validação de dados obrigatórios** - Alguns campos obrigatórios não validados no frontend

**Lacunas críticas:**
- ✅ Validação de estoque no frontend - IMPLEMENTADO
- Controle de acesso baseado em roles
- Validação de preços e descontos
- Gestão de sessões de usuário

## Mapa por Categoria

| Regra | Tela/Fluxo | Camada | Severidade |
|-------|-------------|---------|------------|
| **Validação de Login** | Login | Front+Back | Alta |
| **Controle de Acesso por Role** | Sistema | Front+Back | Alta |
| **Validação de Estoque** | Pedidos | Front+Back | Crítica |
| **Gestão de Pedidos** | Admin Pedidos | Front+Back | Alta |
| **Controle de Mesas** | Admin Mesas | Front+Back | Média |
| **Gestão de Ingredientes** | Admin Ingredientes | Front+Back | Média |
| **Movimentação de Estoque** | Admin Estoque | Front+Back | Média |
| **Validação de Preços** | Produtos | Front+Back | Média |
| **Gestão de Clientes** | Admin Pedidos | Front+Back | Baixa |
| **Controle de Status** | Pedidos/Cozinha | Front+Back | Média |

## Detalhes por Regra

### BR-001: Validação de Login
- **Descrição**: Validação de credenciais de usuário com regras específicas
- **Frontend**: `src/pages/Login.jsx:75-85` (validação de email e senha)
- **Backend**: API `/auth/login` com validação de credenciais
- **Regras**: 
  - Email deve conter '@'
  - Senha deve ter pelo menos 3 caracteres
  - Campos obrigatórios
- **Status**: Implemented (duplo enforce). **Risco**: Baixo.

### BR-002: Controle de Acesso por Role
- **Descrição**: Redirecionamento baseado no role do usuário após login
- **Frontend**: `src/pages/Login.jsx:150-155` (navegação condicional)
- **Backend**: Resposta da API inclui role do usuário
- **Regras**: 
  - Role 'admin' → `/admin/pedidos`
  - Outros roles → `/new-features`
- **Status**: Implemented. **Risco**: Médio (falta validação consistente).

### BR-003: Validação de Estoque Mínimo
- **Descrição**: Controle de estoque mínimo para ingredientes
- **Frontend**: `src/pages/AdminIngredients.jsx:25-30` (campo obrigatório)
- **Backend**: API `/ingredients` com validação
- **Banco**: `ingredientes.quantidade_minima` com default 0.00
- **Regras**: Estoque mínimo configurável por ingrediente
- **Status**: Implemented. **Risco**: Baixo.

### BR-004: Movimentação de Estoque
- **Descrição**: Controle de entrada e saída de ingredientes
- **Frontend**: `src/pages/AdminStockMovements.jsx:35-45` (validação de quantidade)
- **Backend**: API `/stock-movements` com validação
- **Banco**: `estoque_movimentos.tipo_movimento` enum('ENTRADA','SAIDA')
- **Regras**: 
  - Quantidade deve ser > 0
  - Tipo de movimento obrigatório
  - Referência opcional
- **Status**: Implemented. **Risco**: Baixo.

### BR-005: Validação de Pedidos
- **Descrição**: Regras para criação e edição de pedidos com validação de estoque
- **Frontend**: `src/pages/GarcomPedido.jsx:134-141`, `src/pages/Public/Cardapio.jsx:88-104` (validação de estoque)
- **Backend**: API `/orders` e `/stock/check-product` com validação
- **Banco**: `ingredientes`, `produto_ingredientes`, `estoque_movimentos`
- **Regras**: 
  - Cliente obrigatório
  - Mesa obrigatória
  - Pelo menos um item
  - ✅ Validação de estoque antes de criar pedido
  - ✅ Verificação de ingredientes disponíveis
  - ✅ Cálculo de quantidade máxima disponível
- **Status**: ✅ Implemented com validação de estoque. **Risco**: Baixo.

### BR-006: Cálculo de Preços
- **Descrição**: Cálculo automático de preços totais
- **Frontend**: `src/pages/AdminPedidos.jsx:190-200` (cálculo local)
- **Backend**: API calcula preços
- **Regras**: 
  - Preço unitário × quantidade
  - Ajustes por modificadores
- **Status**: Implemented. **Risco**: Baixo.

### BR-007: Controle de Status de Pedidos
- **Descrição**: Transições de status permitidas para pedidos
- **Frontend**: `src/pages/AdminPedidos.jsx:260-270` (atualização de status)
- **Backend**: API `/orders/{id}` com validação
- **Banco**: `orders.status` enum com valores específicos
- **Regras**: Status válidos: open, in_preparation, ready, served, closed, cancelled
- **Status**: Implemented. **Risco**: Baixo.

### BR-008: Gestão de Mesas
- **Descrição**: Controle de disponibilidade e reservas de mesas
- **Frontend**: `src/pages/AdminMesas.jsx` (gestão de status)
- **Backend**: APIs de mesas e reservas
- **Banco**: `tables.status` enum('available','occupied','reserved')
- **Regras**: 
  - Status de mesa controlado
  - Capacidade configurável
- **Status**: Implemented. **Risco**: Baixo.

### BR-009: Validação de Clientes
- **Descrição**: Regras para criação e edição de clientes
- **Frontend**: `src/pages/AdminPedidos.jsx:280-290` (validação de cliente)
- **Backend**: API `/customers` com validação
- **Regras**: 
  - Nome completo obrigatório
  - Email e telefone opcionais
- **Status**: Implemented. **Risco**: Baixo.

### BR-010: Controle de Produtos
- **Descrição**: Gestão de produtos com categorias e preços
- **Frontend**: `src/pages/AdminProdutos.jsx` (gestão de produtos)
- **Backend**: APIs de produtos e categorias
- **Banco**: `products.status` enum('active','inactive')
- **Regras**: 
  - Produtos podem ser ativos/inativos
  - Categorias obrigatórias
- **Status**: Implemented. **Risco**: Baixo.

### BR-011: Gestão de Modificadores
- **Descrição**: Controle de modificadores de produtos (adições, remoções, substituições)
- **Frontend**: `src/pages/AdminProductModifiers.jsx` (gestão de modificadores)
- **Backend**: API de modificadores
- **Banco**: `produto_modificadores.tipo` enum('ADICAO','REMOCAO','SUBSTITUICAO')
- **Regras**: 
  - Tipos de modificação específicos
  - Fator de consumo configurável
  - Ajuste de preço configurável
- **Status**: Implemented. **Risco**: Baixo.

### BR-012: Controle de Cupons
- **Descrição**: Gestão de cupons de desconto com datas e limites
- **Backend**: API de cupons
- **Banco**: `coupons` com validações de data e uso
- **Regras**: 
  - Código único obrigatório
  - Datas de início e fim
  - Limite máximo de usos
  - Status ativo/inativo
- **Status**: Implemented. **Risco**: Baixo.

### BR-013: Gestão de Descontos
- **Descrição**: Controle de descontos percentuais e fixos
- **Backend**: API de descontos
- **Banco**: `discounts` com tipos e valores
- **Regras**: 
  - Tipos: percentage ou fixed
  - Valores com precisão decimal
  - Datas de vigência
- **Status**: Implemented. **Risco**: Baixo.

### BR-014: Controle de Taxas
- **Descrição**: Gestão de taxas com datas de vigência
- **Backend**: API de taxas
- **Banco**: `tax_rates` com percentuais e datas
- **Regras**: 
  - Percentual com precisão decimal
  - Datas de início e fim
- **Status**: Implemented. **Risco**: Baixo.

### BR-015: Gestão de Comissões
- **Descrição**: Controle de percentual de comissão para funcionários
- **Backend**: API de configurações
- **Banco**: `configuracoes.percentual_comissao` decimal(5,2) default 10.00
- **Regras**: 
  - Percentual configurável
  - Precisão de 2 casas decimais
- **Status**: Implemented. **Risco**: Baixo.

### BR-016: Controle de Sessões de Garçom
- **Descrição**: Gestão de sessões de trabalho dos garçons
- **Backend**: API de sessões
- **Banco**: `waiter_sessions` com controle de início/fim
- **Regras**: 
  - Sessão vinculada a funcionário e dispositivo
  - Controle de tempo de início e fim
- **Status**: Implemented. **Risco**: Baixo.

### BR-017: Gestão de Caixa
- **Descrição**: Controle de sessões de caixa e transações
- **Backend**: API de caixa
- **Banco**: `cash_drawer_sessions` e `cash_transactions`
- **Regras**: 
  - Saldo de abertura e fechamento
  - Transações de entrada e saída
  - Controle de valores decimais
- **Status**: Implemented. **Risco**: Baixo.

### BR-018: Controle de Reservas
- **Descrição**: Gestão de reservas de mesas com controle de tempo
- **Backend**: API de reservas
- **Banco**: `table_reservations` com status e horários
- **Regras**: 
  - Duração padrão de 90 minutos
  - Buffer de 10 minutos após
  - Status: hold, booked, seated, completed, cancelled, no_show
- **Status**: Implemented. **Risco**: Baixo.

### BR-019: Gestão de Programas de Fidelidade
- **Descrição**: Controle de programas de pontos para clientes
- **Backend**: API de fidelidade
- **Banco**: `loyalty_programs` e `loyalty_memberships`
- **Regras**: 
  - Multiplicador de pontos configurável
  - Datas de vigência
  - Controle de adesão
- **Status**: Implemented. **Risco**: Baixo.

### BR-020: Controle de Imagens de Produtos
- **Descrição**: Gestão de imagens com controle de imagem principal
- **Backend**: API de imagens
- **Banco**: `product_images.is_primary` boolean
- **Regras**: 
  - Controle de imagem principal
  - URLs obrigatórias
- **Status**: Implemented. **Risco**: Baixo.

### BR-021: Validação de Preços de Produtos
- **Descrição**: Controle de preços com datas de vigência
- **Backend**: API de preços
- **Banco**: `product_prices` com controle temporal
- **Regras**: 
  - Preços com precisão decimal
  - Datas de início e fim
  - Controle de vigência
- **Status**: Implemented. **Risco**: Baixo.

### BR-022: Controle de Categorias de Produtos
- **Descrição**: Gestão de categorias com ordem de exibição
- **Backend**: API de categorias
- **Banco**: `product_categories.display_order` int
- **Regras**: 
  - Ordem de exibição configurável
  - Descrições opcionais
- **Status**: Implemented. **Risco**: Baixo.

### BR-023: Gestão de Usuários e Roles
- **Descrição**: Sistema de usuários com controle de roles
- **Backend**: API de usuários e roles
- **Banco**: `users`, `roles`, `user_roles`
- **Regras**: 
  - Username único obrigatório
  - Email obrigatório
  - Vinculação a filial
  - Sistema de roles configurável
- **Status**: Implemented. **Risco**: Médio.

### BR-024: Controle de Filiais
- **Descrição**: Gestão de múltiplas filiais
- **Backend**: API de filiais
- **Banco**: `branches` com endereços
- **Regras**: 
  - Nome obrigatório
  - Endereço opcional
  - Controle de criação/atualização
- **Status**: Implemented. **Risco**: Baixo.

### BR-025: Validação de Quantidades
- **Descrição**: Controle de quantidades em pedidos e estoque
- **Frontend**: `src/pages/AdminPedidos.jsx:180-190` (controle de quantidade)
- **Backend**: APIs com validação
- **Banco**: `order_items.quantity` int unsigned, `estoque_movimentos.quantidade` decimal(10,2)
- **Regras**: 
  - Quantidades devem ser > 0
  - Precisão decimal para estoque
  - Valores inteiros para pedidos
- **Status**: Implemented. **Risco**: Baixo.

### BR-026: Controle de Status de Itens de Pedido
- **Descrição**: Gestão de status individuais dos itens
- **Backend**: API de itens de pedido
- **Banco**: `order_items.status` enum
- **Regras**: 
  - Status: pending, in_preparation, ready, served, cancelled
  - Controle de transições
- **Status**: Implemented. **Risco**: Baixo.

### BR-027: Gestão de Notas de Pedido
- **Descrição**: Controle de observações e notas nos pedidos
- **Backend**: API de notas
- **Banco**: `order_notes` com controle de usuário
- **Regras**: 
  - Notas obrigatórias
  - Controle de usuário criador
  - Timestamp automático
- **Status**: Implemented. **Risco**: Baixo.

### BR-028: Controle de Pagamentos
- **Descrição**: Gestão de pagamentos com métodos e operadores
- **Backend**: API de pagamentos
- **Banco**: `payments` com controle de métodos e operadores
- **Regras**: 
  - Método de pagamento obrigatório
  - Operador opcional
  - Controle de valores
  - Timestamp de pagamento
- **Status**: Implemented. **Risco**: Baixo.

### BR-029: Gestão de Métodos de Pagamento
- **Descrição**: Controle de métodos disponíveis
- **Backend**: API de métodos
- **Banco**: `payment_methods` com descrições
- **Regras**: 
  - Nome obrigatório
  - Descrição opcional
- **Status**: Implemented. **Risco**: Baixo.

### BR-030: Controle de Cozinha
- **Descrição**: Gestão de tickets de cozinha
- **Backend**: API de cozinha
- **Banco**: `kitchen_tickets` e `kitchen_ticket_items`
- **Regras**: 
  - Status: pending, in_progress, completed, cancelled
  - Controle de preparação por item
  - Timestamps de envio e preparação
- **Status**: Implemented. **Risco**: Baixo.

### BR-031: Validação de Datas
- **Descrição**: Controle de datas de vigência e expiração
- **Backend**: APIs com validação de datas
- **Banco**: Campos de data em múltiplas tabelas
- **Regras**: 
  - Datas de início obrigatórias
  - Datas de fim opcionais
  - Controle de vigência temporal
- **Status**: Implemented. **Risco**: Baixo.

### BR-032: Controle de Ativos/Inativos
- **Descrição**: Gestão de status ativo/inativo para entidades
- **Backend**: APIs com controle de status
- **Banco**: Campos boolean em múltiplas tabelas
- **Regras**: 
  - Status padrão ativo
  - Controle de visibilidade
- **Status**: Implemented. **Risco**: Baixo.

### BR-033: Validação de Emails
- **Descrição**: Controle de formato de email
- **Frontend**: `src/pages/Login.jsx:75-85` (validação de @)
- **Backend**: APIs com validação
- **Regras**: 
  - Formato de email válido
  - Campo obrigatório em alguns casos
- **Status**: Implemented. **Risco**: Baixo.

### BR-034: Controle de Timeout de API
- **Descrição**: Timeout configurado para requisições
- **Frontend**: `src/services/api.js:15` (timeout de 10 segundos)
- **Regras**: 
  - Timeout de 10 segundos
  - Tratamento de erros de timeout
- **Status**: Implemented. **Risco**: Baixo.

### BR-035: Gestão de Tokens de Autenticação
- **Descrição**: Controle de tokens JWT para autenticação
- **Frontend**: `src/services/api.js:20-25` (interceptor de token)
- **Backend**: API de autenticação
- **Regras**: 
  - Token obrigatório para APIs protegidas
  - Interceptor automático
  - Controle de autorização
- **Status**: Implemented. **Risco**: Médio.

### BR-036: Controle de Logs e Debug
- **Descrição**: Sistema de logs para debug e monitoramento
- **Frontend**: `src/services/api.js:30-50` (interceptors de log)
- **Regras**: 
  - Logs de requisições e respostas
  - Controle de debug
  - Rastreamento de erros
- **Status**: Implemented. **Risco**: Baixo.

### BR-037: Validação de URLs de API
- **Descrição**: Configuração hardcoded de URLs de API
- **Frontend**: `src/services/api.js:7` (baseURL configurada)
- **Regras**: 
  - URL base configurada
  - Resolução de Mixed Content
- **Status**: Implemented. **Risco**: Baixo.

### BR-038: Controle de Auto-refresh
- **Descrição**: Atualização automática de dados
- **Frontend**: `src/pages/AdminPedidos.jsx:80-90` (interval de 10 segundos)
- **Regras**: 
  - Atualização a cada 10 segundos
  - Controle de ativação/desativação
  - Limpeza de intervalos
- **Status**: Implemented. **Risco**: Baixo.

### BR-039: Validação de Formulários
- **Descrição**: Validação de campos obrigatórios
- **Frontend**: Múltiplos componentes com validação
- **Regras**: 
  - Campos obrigatórios validados
  - Mensagens de erro específicas
  - Prevenção de envio inválido
- **Status**: Implemented. **Risco**: Baixo.

### BR-040: Controle de Modais e Estados
- **Descrição**: Gestão de estados de modais e formulários
- **Frontend**: Múltiplos componentes com controle de estado
- **Regras**: 
  - Estados de abertura/fechamento
  - Controle de edição
  - Limpeza de formulários
- **Status**: Implemented. **Risco**: Baixo.

### BR-041: Gestão de Filtros
- **Descrição**: Controle de filtros para listagens
- **Frontend**: `src/pages/AdminPedidos.jsx:220-230` (filtros de status e cliente)
- **Regras**: 
  - Filtros por status
  - Filtros por cliente
  - Filtros combinados
- **Status**: Implemented. **Risco**: Baixo.

### BR-042: Controle de Estatísticas
- **Descrição**: Cálculo de estatísticas em tempo real
- **Frontend**: `src/pages/AdminPedidos.jsx:350-370` (cálculo de estatísticas)
- **Regras**: 
  - Contagem de pedidos por status
  - Cálculo de valor total
  - Atualização automática
- **Status**: Implemented. **Risco**: Baixo.

### BR-043: Validação de Confirmações
- **Descrição**: Confirmação para ações destrutivas
- **Frontend**: Múltiplos componentes com `window.confirm`
- **Regras**: 
  - Confirmação para exclusões
  - Prevenção de ações acidentais
- **Status**: Implemented. **Risco**: Baixo.

### BR-044: Controle de Loading States
- **Descrição**: Gestão de estados de carregamento
- **Frontend**: Múltiplos componentes com `loading` state
- **Regras**: 
  - Indicadores de carregamento
  - Desabilitação durante operações
  - Feedback visual para usuário
- **Status**: Implemented. **Risco**: Baixo.

### BR-045: Gestão de Erros
- **Descrição**: Tratamento e exibição de erros
- **Frontend**: Múltiplos componentes com tratamento de erro
- **Regras**: 
  - Captura de erros de API
  - Mensagens de erro específicas
  - Fallbacks para erros
- **Status**: Implemented. **Risco**: Baixo.

### BR-046: Controle de Navegação
- **Descrição**: Navegação baseada em roles e estados
- **Frontend**: `src/pages/Login.jsx:150-155` (redirecionamento condicional)
- **Regras**: 
  - Redirecionamento baseado em role
  - Controle de acesso a rotas
- **Status**: Implemented. **Risco**: Médio.

### BR-047: Validação de Dados de Entrada
- **Descrição**: Sanitização e validação de dados
- **Frontend**: Múltiplos componentes com validação
- **Regras**: 
  - Validação de tipos de dados
  - Sanitização de entrada
  - Prevenção de dados inválidos
- **Status**: Implemented. **Risco**: Baixo.

## Backlog de Correções Sugeridas

### Prioridade Alta
1. ✅ **Implementar validação de estoque no frontend** - IMPLEMENTADO
   - Hook `useStockValidation` para verificação em tempo real
   - Componente `StockBadge` para status visual
   - Validação antes de adicionar ao carrinho/pedido
   - Filtro "Apenas disponíveis" no cardápio
2. **Reforçar controle de acesso baseado em roles** em todas as rotas
3. **Implementar validação de preços** para evitar valores negativos ou zero
4. **Configurar timeout de sessão** para usuários logados

### Prioridade Média
1. **Adicionar validação de CPF** para clientes (se aplicável)
2. **Implementar controle de desconto máximo** por pedido
3. **Adicionar validação de capacidade de mesa** vs. número de clientes
4. **Implementar controle de horário de funcionamento** para pedidos

### Prioridade Baixa
1. **Adicionar validação de telefone** para clientes
2. **Implementar controle de idade mínima** para certos produtos
3. **Adicionar validação de CEP** para endereços
4. **Implementar controle de alergias** para ingredientes

## Observações Finais

O sistema possui uma base sólida de regras de negócio implementadas, com boa cobertura de validações tanto no frontend quanto no backend. As principais lacunas estão relacionadas à validação de estoque em tempo real e ao controle de acesso baseado em roles, que são críticas para a integridade dos dados e segurança do sistema.

A arquitetura atual permite fácil implementação de novas regras de negócio através dos interceptors de API e componentes React reutilizáveis.

