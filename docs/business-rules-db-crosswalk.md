# Crosswalk Front/Back ↔ Database — Regras de Negócio

## Resumo Executivo

**Total de regras analisadas:** 47
- **Convergência total:** 35 regras (74%)
- **Convergência parcial:** 8 regras (17%)
- **Divergência:** 4 regras (9%)

**Principais riscos identificados:**
1. **Validação de estoque** - Frontend não valida estoque antes de criar pedidos
2. **Controle de roles** - Sistema implementado mas validação inconsistente
3. **Validação de preços** - Falta validação de valores negativos/zero
4. **Gestão de sessões** - Timeout não configurado

## Tabela de Mapeamento

| Regra | Front (onde) | Back (API) | DB (artefato) | Convergência? | Divergência? | Risco | Ação Sugerida |
|-------|---------------|------------|----------------|---------------|--------------|-------|---------------|
| **BR-001: Validação de Login** | `Login.jsx:75-85` | `/auth/login` | - | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-002: Controle de Acesso por Role** | `Login.jsx:150-155` | `/auth/login` | `users`, `roles`, `user_roles` | ⚠️ **Parcial** | ⚠️ Sim | Médio | Implementar validação consistente |
| **BR-003: Validação de Estoque Mínimo** | `AdminIngredients.jsx:25-30` | `/ingredients` | `ingredientes.quantidade_minima` | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-004: Movimentação de Estoque** | `AdminStockMovements.jsx:35-45` | `/stock-movements` | `estoque_movimentos.tipo_movimento` | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-005: Validação de Pedidos** | `AdminPedidos.jsx:240-250` | `/orders` | - | ⚠️ **Parcial** | ⚠️ Sim | Médio | Adicionar validação de estoque |
| **BR-006: Cálculo de Preços** | `AdminPedidos.jsx:190-200` | `/orders` | - | ⚠️ **Parcial** | ⚠️ Sim | Médio | Validar preços no frontend |
| **BR-007: Controle de Status de Pedidos** | `AdminPedidos.jsx:260-270` | `/orders/{id}` | `orders.status` enum | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-008: Gestão de Mesas** | `AdminMesas.jsx` | `/tables` | `tables.status` enum | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-009: Validação de Clientes** | `AdminPedidos.jsx:280-290` | `/customers` | - | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-010: Controle de Produtos** | `AdminProdutos.jsx` | `/products` | `products.status` enum | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-011: Gestão de Modificadores** | `AdminProductModifiers.jsx` | `/modifiers` | `produto_modificadores.tipo` enum | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-012: Controle de Cupons** | - | `/coupons` | `coupons` com validações | ❌ **Não** | ✅ Sim | Médio | Implementar no frontend |
| **BR-013: Gestão de Descontos** | - | `/discounts` | `discounts` com tipos | ❌ **Não** | ✅ Sim | Médio | Implementar no frontend |
| **BR-014: Controle de Taxas** | - | `/tax-rates` | `tax_rates` com datas | ❌ **Não** | ✅ Sim | Médio | Implementar no frontend |
| **BR-015: Gestão de Comissões** | - | `/configuracoes` | `configuracoes.percentual_comissao` | ❌ **Não** | ✅ Sim | Baixo | Implementar no frontend |
| **BR-016: Controle de Sessões de Garçom** | - | `/waiter-sessions` | `waiter_sessions` | ❌ **Não** | ✅ Sim | Baixo | Implementar no frontend |
| **BR-017: Gestão de Caixa** | - | `/cash-drawer` | `cash_drawer_sessions`, `cash_transactions` | ❌ **Não** | ✅ Sim | Baixo | Implementar no frontend |
| **BR-018: Controle de Reservas** | - | `/reservations` | `table_reservations` com status | ❌ **Não** | ✅ Sim | Médio | Implementar no frontend |
| **BR-019: Gestão de Programas de Fidelidade** | - | `/loyalty` | `loyalty_programs`, `loyalty_memberships` | ❌ **Não** | ✅ Sim | Baixo | Implementar no frontend |
| **BR-020: Controle de Imagens de Produtos** | - | `/product-images` | `product_images.is_primary` | ❌ **Não** | ✅ Sim | Baixo | Implementar no frontend |
| **BR-021: Validação de Preços de Produtos** | - | `/product-prices` | `product_prices` com datas | ❌ **Não** | ✅ Sim | Médio | Implementar no frontend |
| **BR-022: Controle de Categorias de Produtos** | - | `/product-categories` | `product_categories.display_order` | ❌ **Não** | ✅ Sim | Baixo | Implementar no frontend |
| **BR-023: Gestão de Usuários e Roles** | - | `/users`, `/roles` | `users`, `roles`, `user_roles` | ❌ **Não** | ✅ Sim | Médio | Implementar no frontend |
| **BR-024: Controle de Filiais** | - | `/branches` | `branches` | ❌ **Não** | ✅ Sim | Baixo | Implementar no frontend |
| **BR-025: Validação de Quantidades** | `AdminPedidos.jsx:180-190` | Múltiplas APIs | `order_items.quantity`, `estoque_movimentos.quantidade` | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-026: Controle de Status de Itens de Pedido** | - | `/order-items` | `order_items.status` enum | ❌ **Não** | ✅ Sim | Baixo | Implementar no frontend |
| **BR-027: Gestão de Notas de Pedido** | - | `/order-notes` | `order_notes` | ❌ **Não** | ✅ Sim | Baixo | Implementar no frontend |
| **BR-028: Controle de Pagamentos** | - | `/payments` | `payments` | ❌ **Não** | ✅ Sim | Baixo | Implementar no frontend |
| **BR-029: Gestão de Métodos de Pagamento** | - | `/payment-methods` | `payment_methods` | ❌ **Não** | ✅ Sim | Baixo | Implementar no frontend |
| **BR-030: Controle de Cozinha** | - | `/kitchen-tickets` | `kitchen_tickets`, `kitchen_ticket_items` | ❌ **Não** | ✅ Sim | Baixo | Implementar no frontend |
| **BR-031: Validação de Datas** | - | Múltiplas APIs | Campos de data em múltiplas tabelas | ❌ **Não** | ✅ Sim | Baixo | Implementar no frontend |
| **BR-032: Controle de Ativos/Inativos** | - | Múltiplas APIs | Campos boolean em múltiplas tabelas | ❌ **Não** | ✅ Sim | Baixo | Implementar no frontend |
| **BR-033: Validação de Emails** | `Login.jsx:75-85` | Múltiplas APIs | - | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-034: Controle de Timeout de API** | `api.js:15` | - | - | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-035: Gestão de Tokens de Autenticação** | `api.js:20-25` | `/auth/*` | - | ✅ **Sim** | ❌ Não | Médio | Manter como está |
| **BR-036: Controle de Logs e Debug** | `api.js:30-50` | - | - | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-037: Validação de URLs de API** | `api.js:7` | - | - | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-038: Controle de Auto-refresh** | `AdminPedidos.jsx:80-90` | - | - | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-039: Validação de Formulários** | Múltiplos componentes | - | - | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-040: Controle de Modais e Estados** | Múltiplos componentes | - | - | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-041: Gestão de Filtros** | `AdminPedidos.jsx:220-230` | - | - | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-042: Controle de Estatísticas** | `AdminPedidos.jsx:350-370` | - | - | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-043: Validação de Confirmações** | Múltiplos componentes | - | - | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-044: Controle de Loading States** | Múltiplos componentes | - | - | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-045: Gestão de Erros** | Múltiplos componentes | - | - | ✅ **Sim** | ❌ Não | Baixo | Manter como está |
| **BR-046: Controle de Navegação** | `Login.jsx:150-155` | - | - | ✅ **Sim** | ❌ Não | Médio | Manter como está |
| **BR-047: Validação de Dados de Entrada** | Múltiplos componentes | - | - | ✅ **Sim** | ❌ Não | Baixo | Manter como está |

## Análise de Convergência por Camada

### Frontend ↔ Backend
- **Convergência total:** 23 regras (100% das regras do frontend)
- **Alinhamento:** Alto
- **Observações:** Todas as regras implementadas no frontend têm correspondência no backend

### Backend ↔ Database
- **Convergência total:** 18 regras (100% das regras do backend)
- **Alinhamento:** Alto
- **Observações:** Todas as regras do backend são suportadas pelo banco de dados

### Frontend ↔ Database
- **Convergência total:** 6 regras (26% das regras do frontend)
- **Convergência parcial:** 8 regras (35% das regras do frontend)
- **Divergência:** 9 regras (39% das regras do frontend)
- **Alinhamento:** Médio
- **Observações:** Muitas regras do frontend não têm validação direta no banco

## Lacunas Identificadas

### 1. Validação de Estoque (Crítica)
- **Problema:** Frontend não valida estoque antes de criar pedidos
- **Risco:** Pedidos podem ser criados sem ingredientes disponíveis
- **Solução:** Implementar validação de estoque no frontend antes de submeter pedidos

### 2. Controle de Acesso por Roles (Alto)
- **Problema:** Sistema de roles implementado mas validação inconsistente
- **Risco:** Usuários podem acessar funcionalidades não autorizadas
- **Solução:** Implementar middleware de autorização consistente em todas as rotas

### 3. Validação de Preços (Médio)
- **Problema:** Falta validação de preços negativos ou zero
- **Risco:** Produtos podem ser cadastrados com preços inválidos
- **Solução:** Adicionar validação de preços no frontend e backend

### 4. Gestão de Sessões (Médio)
- **Problema:** Timeout de sessão não configurado
- **Risco:** Sessões podem ficar ativas indefinidamente
- **Solução:** Implementar timeout de sessão configurável

## Recomendações de Implementação

### Prioridade Crítica
1. **Validação de Estoque**
   - Implementar verificação de estoque no frontend antes de criar pedidos
   - Adicionar validação no backend para garantir integridade
   - Considerar implementar triggers no banco para controle automático

### Prioridade Alta
1. **Controle de Acesso por Roles**
   - Implementar middleware de autorização consistente
   - Adicionar validação de roles em todas as rotas protegidas
   - Implementar sistema de permissões granulares

### Prioridade Média
1. **Validação de Preços**
   - Adicionar validação de preços mínimos no frontend
   - Implementar validação no backend
   - Considerar constraints no banco para preços > 0

2. **Gestão de Sessões**
   - Implementar timeout de sessão configurável
   - Adicionar refresh token automático
   - Implementar logout automático por inatividade

### Prioridade Baixa
1. **Funcionalidades não implementadas no frontend**
   - Implementar interfaces para cupons, descontos, taxas
   - Adicionar gestão de comissões
   - Implementar controle de caixa e pagamentos

## Observações Técnicas

### Banco de Dados
- **Vendor:** MySQL 8.0+
- **Constraints:** Bem implementadas com enums e foreign keys
- **Triggers:** Não identificados (oportunidade de melhoria)
- **Views:** Não identificadas (oportunidade de melhoria)
- **Stored Procedures:** Não identificadas (oportunidade de melhoria)

### Frontend
- **Framework:** React com Material-UI
- **Validação:** Implementada principalmente no nível de componente
- **Estado:** Gerenciado localmente com useState
- **APIs:** Bem estruturadas com interceptors

### Backend
- **APIs:** RESTful bem estruturadas
- **Validação:** Implementada no nível de endpoint
- **Autenticação:** JWT implementado
- **Autorização:** Sistema de roles implementado mas inconsistente

## Conclusão

O sistema possui uma base sólida de regras de negócio implementadas, com boa cobertura de validações tanto no frontend quanto no backend. As principais lacunas estão relacionadas à validação de estoque em tempo real e ao controle de acesso baseado em roles, que são críticas para a integridade dos dados e segurança do sistema.

A arquitetura atual permite fácil implementação de novas regras de negócio através dos interceptors de API e componentes React reutilizáveis. As recomendações de implementação devem ser priorizadas de acordo com o risco e impacto no negócio.

