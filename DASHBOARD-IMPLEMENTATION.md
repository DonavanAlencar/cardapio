# Implementação do Dashboard - Sistema Cardápio

## Visão Geral

Este documento descreve a implementação da funcionalidade Dashboard (tela principal) do sistema Cardápio, incluindo APIs no backend e integração no frontend.

## Funcionalidades Implementadas

### Backend (API)

#### 1. Rota Principal: `/api/dashboard`
- **Endpoint**: `GET /api/dashboard`
- **Autenticação**: Requer token JWT válido
- **Funcionalidades**:
  - Dados do usuário logado (nome, filial)
  - Métricas de vendas (hoje vs ontem)
  - Ticket médio com variação percentual
  - Taxa de ocupação das mesas
  - Status das mesas em tempo real
  - Pedidos ativos
  - Estoque com baixo nível
  - Resumo geral do sistema

#### 2. Rota em Tempo Real: `/api/dashboard/real-time`
- **Endpoint**: `GET /api/dashboard/real-time`
- **Autenticação**: Requer token JWT válido
- **Funcionalidades**:
  - Status atualizado das mesas
  - Pedidos ativos em tempo real
  - Atualização automática a cada 30 segundos

#### 3. Rota de Teste: `/api/dashboard/test`
- **Endpoint**: `GET /api/dashboard/test`
- **Autenticação**: Nenhuma (para testes)
- **Funcionalidades**:
  - Teste de conexão com banco de dados
  - Verificação de funcionamento da API

### Frontend

#### 1. Serviço Dashboard (`dashboardService.js`)
- **Métodos**:
  - `getDashboardData()`: Busca dados principais
  - `getRealTimeData()`: Busca dados em tempo real
  - Formatação de valores monetários, percentuais e datas
  - Mapeamento de status para português
  - Mapeamento de cores para diferentes status

#### 2. Componente Dashboard (`Dashboard.jsx`)
- **Estados**:
  - Loading: Exibe spinner durante carregamento
  - Error: Exibe mensagem de erro com botão de retry
  - Success: Exibe dados do dashboard
- **Funcionalidades**:
  - Carregamento automático de dados
  - Atualização em tempo real (30s)
  - Exibição de métricas com variações percentuais
  - Visualização do status das mesas
  - Lista de pedidos ativos
  - Alertas de estoque baixo
  - Responsivo para diferentes tamanhos de tela

#### 3. Componente de Teste (`DashboardTest.jsx`)
- **Funcionalidades**:
  - Teste da API sem autenticação
  - Verificação de conectividade
  - Debug de erros

## Estrutura do Banco de Dados

### Tabelas Utilizadas

1. **users**: Informações do usuário logado
2. **employees**: Dados do funcionário
3. **branches**: Filial do usuário
4. **orders**: Pedidos para métricas de vendas
5. **order_items**: Itens dos pedidos
6. **tables**: Status das mesas
7. **ingredientes**: Estoque com baixo nível

### Consultas SQL Principais

#### Vendas de Hoje
```sql
SELECT COALESCE(SUM(o.total_amount), 0) as total_sales, COUNT(*) as total_orders 
FROM orders o 
WHERE DATE(o.created_at) = ? 
AND o.status IN ("closed", "served")
```

#### Status das Mesas
```sql
SELECT t.id, t.table_number, t.capacity, t.status, 
COALESCE(o.id, 0) as has_order, 
COALESCE(o.total_amount, 0) as order_total 
FROM tables t 
LEFT JOIN orders o ON t.id = o.table_id AND o.status IN ("open", "in_preparation", "ready") 
ORDER BY t.table_number
```

#### Estoque Baixo
```sql
SELECT i.nome, i.quantidade_estoque, i.quantidade_minima 
FROM ingredientes i 
WHERE i.quantidade_estoque <= i.quantidade_minima 
AND i.ativo = 1 
ORDER BY (i.quantidade_estoque / i.quantidade_minima) ASC 
LIMIT 5
```

## Como Testar

### 1. Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend
```bash
cd front_new
npm install
npm run dev
```

### 3. Teste da API
- Acesse: `http://localhost:4000/api/dashboard/test`
- Deve retornar: `{"message": "Dashboard API funcionando!", "database": "Conectado"}`

### 4. Teste do Frontend
- Acesse: `http://localhost:5173/dashboard`
- Use o componente `DashboardTest` para verificar conectividade

## Configuração

### Variáveis de Ambiente (Backend)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cardapio
JWT_SECRET=sua_chave_secreta
PORT=4000
```

### Configuração da API (Frontend)
- **Base URL**: `https://food.546digitalservices.com/api`
- **Timeout**: 10 segundos
- **Autenticação**: Bearer Token

## Recursos Visuais

### Cores dos Status
- **Mesas**:
  - Disponível: Verde (#10b981)
  - Ocupada: Azul (#3b82f6)
  - Reservada: Amarelo (#f59e0b)

- **Pedidos**:
  - Pendente: Vermelho (#ef4444)
  - Preparando: Roxo (#8b5cf6)
  - Pronto: Amarelo (#f59e0b)
  - Servido: Verde (#10b981)

### Ícones
- 💰 Vendas
- 📈 Ticket Médio
- 👥 Taxa de Ocupação
- 🛒 Pedidos Ativos
- 📋 Mesa com Pedido

## Atualizações em Tempo Real

- **Intervalo**: 30 segundos
- **Dados**: Status das mesas e pedidos ativos
- **Implementação**: `useEffect` com `setInterval`

## Tratamento de Erros

### Backend
- Validação de dados de entrada
- Tratamento de erros de banco de dados
- Logs detalhados para debugging

### Frontend
- Estados de loading, error e success
- Botão de retry em caso de erro
- Fallbacks para dados ausentes
- Tratamento de erros de rede

## Próximos Passos

1. **Implementar WebSockets** para atualizações em tempo real mais eficientes
2. **Adicionar gráficos** para visualização de tendências
3. **Implementar filtros** por período e filial
4. **Adicionar notificações** para eventos importantes
5. **Implementar cache** para melhorar performance

## Troubleshooting

### Problemas Comuns

1. **Erro de CORS**: Verificar configuração no backend
2. **Erro de Conexão**: Verificar se o banco está rodando
3. **Token Inválido**: Verificar JWT_SECRET e expiração
4. **Dados não carregam**: Verificar consultas SQL e permissões

### Logs Úteis
- Backend: `server.log` e console
- Frontend: Console do navegador
- Banco: Logs do MySQL

## Contribuição

Para contribuir com melhorias no Dashboard:

1. Fork do repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste localmente
5. Envie um Pull Request

## Contato

Para dúvidas ou sugestões sobre a implementação do Dashboard, entre em contato com a equipe de desenvolvimento.
