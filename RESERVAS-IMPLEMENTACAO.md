# Sistema de Reservas de Mesa - Implementação

## Visão Geral

Este documento descreve a implementação completa do sistema de reservas de mesa no projeto Cardápio, incluindo backend e frontend.

## Estrutura do Banco de Dados

### Tabela `table_reservations` (Atualizada)

A tabela foi expandida com novas colunas para suportar funcionalidades avançadas:

```sql
-- Novas colunas adicionadas
ALTER TABLE table_reservations
  ADD COLUMN duration_minutes INT NOT NULL DEFAULT 90,
  ADD COLUMN buffer_after_minutes INT NOT NULL DEFAULT 10,
  ADD COLUMN ends_at DATETIME NULL;

-- Índices para performance
CREATE INDEX idx_res_table_time ON table_reservations (table_id, reservation_time, ends_at);
CREATE INDEX idx_res_status_time ON table_reservations (status, reservation_time);
```

### Triggers de Validação

Foram implementados triggers para:
- Calcular automaticamente `ends_at` baseado em `duration_minutes`
- Impedir conflitos de horário entre reservas
- Manter integridade dos dados

## Backend

### Controlador de Reservas (`reservationsController.js`)

**Funcionalidades implementadas:**

1. **CRUD Completo:**
   - `listReservations()` - Listar reservas com filtros
   - `getReservation()` - Buscar reserva por ID
   - `createReservation()` - Criar nova reserva
   - `updateReservation()` - Atualizar reserva existente
   - `cancelReservation()` - Cancelar reserva

2. **Funcionalidades Especiais:**
   - `checkTableAvailability()` - Verificar disponibilidade de mesa
   - `getReservationsByCustomer()` - Buscar reservas por cliente
   - `getReservationStats()` - Estatísticas de reservas

3. **Validações:**
   - Verificação de conflitos de horário
   - Validação de dados obrigatórios
   - Verificação de existência de mesa e cliente

### Rotas (`reservations.js`)

**Endpoints disponíveis:**

- `GET /api/reservations` - Listar reservas
- `GET /api/reservations/:id` - Buscar reserva específica
- `POST /api/reservations` - Criar reserva
- `PUT /api/reservations/:id` - Atualizar reserva
- `DELETE /api/reservations/:id` - Cancelar reserva
- `GET /api/reservations/availability/check` - Verificar disponibilidade
- `GET /api/reservations/customer/:customer_id` - Reservas por cliente
- `GET /api/reservations/stats/summary` - Estatísticas

## Frontend

### Serviço de Reservas (`reservationsService.js`)

**Funcionalidades:**

- Interface para todas as operações da API
- Formatação de datas e durações
- Validação de dados
- Geração de horários disponíveis
- Mapeamento de status e cores

### Componentes

#### 1. Modal de Reserva (`ReservationModal.jsx`)

**Características:**
- Formulário completo para criar/editar reservas
- Seleção de cliente, mesa, data e horário
- Validação em tempo real
- Verificação de disponibilidade
- Interface responsiva

**Campos:**
- Cliente (obrigatório)
- Mesa (obrigatório)
- Data (obrigatório)
- Horário (obrigatório)
- Duração (padrão: 90 min)
- Buffer após reserva (padrão: 10 min)
- Observações (opcional)

#### 2. Lista de Reservas (`ReservationsList.jsx`)

**Funcionalidades:**
- Exibição em grid responsivo
- Filtros por status e data
- Ações de edição e cancelamento
- Estados de loading e erro
- Integração com modal de edição

### Integração com Dashboard

**Novas funcionalidades:**
- Botão para mostrar/ocultar seção de reservas
- Métrica de reservas do dia
- Indicador visual de reservas ativas
- Atualização em tempo real

## Funcionalidades Principais

### 1. Criação de Reservas

- Seleção de cliente existente
- Escolha de mesa disponível
- Definição de data e horário
- Configuração de duração e buffer
- Validação automática de conflitos

### 2. Gestão de Reservas

- Visualização em lista organizada
- Filtros por status e data
- Edição de reservas existentes
- Cancelamento com confirmação
- Histórico de alterações

### 3. Verificação de Disponibilidade

- Algoritmo inteligente de verificação
- Consideração de buffers entre reservas
- Prevenção de conflitos de horário
- Lista de mesas disponíveis

### 4. Validações e Segurança

- Triggers de banco para integridade
- Validação de dados no frontend
- Tratamento de erros específicos
- Confirmações para ações críticas

## Configuração e Uso

### 1. Executar Migração do Banco

```bash
# Executar o script SQL para atualizar a tabela
mysql -u [usuario] -p [banco] < backend/update_reservations_table.sql
```

### 2. Verificar Configuração

- Backend configurado e rodando
- Frontend com dependências instaladas
- Banco de dados acessível
- Autenticação funcionando

### 3. Acessar Funcionalidades

1. **Dashboard:** Clicar em "📋 Ver Reservas"
2. **Nova Reserva:** Botão "+ Nova Reserva"
3. **Editar:** Clicar no ícone ✏️ na reserva
4. **Cancelar:** Clicar no ícone ❌ na reserva

## Arquivos Criados/Modificados

### Backend
- `backend/update_reservations_table.sql` - Script de migração
- `backend/src/controllers/reservationsController.js` - Controlador
- `backend/src/routes/reservations.js` - Rotas
- `backend/src/app.js` - Integração das rotas

### Frontend
- `front_new/src/services/reservationsService.js` - Serviço
- `front_new/src/components/ReservationModal.jsx` - Modal
- `front_new/src/components/ReservationsList.jsx` - Lista
- `front_new/src/components/ReservationModal.css` - Estilos do modal
- `front_new/src/components/ReservationsList.css` - Estilos da lista
- `front_new/src/pages/Dashboard/Dashboard.jsx` - Integração
- `front_new/src/config/apiConfig.js` - Endpoints
- `front_new/src/services/dashboardService.js` - Serviço atualizado

## Considerações Técnicas

### Performance
- Índices otimizados para consultas
- Paginação implementada
- Cache de dados em tempo real

### Segurança
- Validação no backend e frontend
- Autenticação obrigatória
- Sanitização de inputs

### Responsividade
- Design mobile-first
- Grid adaptativo
- Componentes reutilizáveis

## Próximos Passos

### Melhorias Sugeridas
1. **Notificações:** Sistema de alertas para reservas
2. **Relatórios:** Estatísticas avançadas
3. **Integração:** Calendário externo
4. **Automação:** Confirmações automáticas

### Manutenção
1. **Monitoramento:** Logs de operações
2. **Backup:** Dados de reservas
3. **Testes:** Validação de funcionalidades
4. **Documentação:** Atualizações contínuas

## Suporte

Para dúvidas ou problemas:
1. Verificar logs do backend
2. Consultar console do navegador
3. Validar estrutura do banco
4. Testar conectividade da API

---

**Versão:** 1.0.0  
**Data:** Janeiro 2025  
**Desenvolvedor:** Sistema de Reservas Cardápio
