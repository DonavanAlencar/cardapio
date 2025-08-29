# Gestão de Garçons - Backend

## Visão Geral

Este módulo implementa a gestão completa de garçons (funcionários) do sistema, incluindo CRUD, métricas, relatórios e exportação de dados.

## Endpoints

### 1. Listar Garçons
```
GET /garcons
```

**Parâmetros de Query:**
- `q` - Busca por nome, ID ou username
- `status[]` - Array de status (ativo, inativo, licenca, ferias)
- `turno[]` - Array de turnos (Integral, Manhã, Tarde, Noite)
- `setor[]` - Array de setores (Salão, Terraço, VIP, Delivery)
- `dataInicio` - Data de início para filtro
- `dataFim` - Data de fim para filtro
- `page` - Página atual (padrão: 1)
- `pageSize` - Itens por página (padrão: 20)
- `sort` - Campo para ordenação (padrão: full_name)
- `sortOrder` - Ordem ASC/DESC (padrão: ASC)

**Resposta:**
```json
{
  "data": [
    {
      "id": 1,
      "full_name": "Carlos Silva",
      "position": "Garçom",
      "status": "ativo",
      "turno": "Integral",
      "setor": "Salão",
      "commission_rate": 3.0,
      "orders_per_day": "18.5",
      "sales_30d": 18500.00,
      "avg_rating": 4.7
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### 2. Métricas Gerais (KPIs)
```
GET /garcons/metrics/overview
```

**Parâmetros de Query:**
- `dataInicio` - Data de início para filtro
- `dataFim` - Data de fim para filtro

**Resposta:**
```json
{
  "total_ativos": 5,
  "media_pedidos_dia": "6.6",
  "maior_faturamento": {
    "nome": "Carlos Silva",
    "valor": 18500.00
  }
}
```

### 3. Detalhes do Garçom
```
GET /garcons/:id
```

**Resposta:**
```json
{
  "id": 1,
  "full_name": "Carlos Silva",
  "position": "Garçom",
  "status": "ativo",
  "turno": "Integral",
  "setor": "Salão",
  "commission_rate": 3.0,
  "metrics": {
    "total_orders_30d": 1247,
    "total_sales_30d": 89650.25,
    "avg_ticket_30d": 71.89
  },
  "recent_orders": [...]
}
```

### 4. Criar Garçom
```
POST /garcons
```

**Body:**
```json
{
  "full_name": "João Silva",
  "email": "joao@restaurante.com",
  "username": "joao123",
  "password": "senha123",
  "branch_id": 1,
  "position": "Garçom",
  "turno": "Integral",
  "setor": "Salão",
  "commission_rate": 3.0,
  "status": "ativo"
}
```

### 5. Atualizar Garçom
```
PUT /garcons/:id
```

**Body:** Mesmo formato do POST, mas sem password obrigatório

### 6. Atualizar Status
```
PATCH /garcons/:id
```

**Body:**
```json
{
  "status": "inativo"
}
```

### 7. Deletar Garçom
```
DELETE /garcons/:id
```

### 8. Exportar Relatório
```
GET /garcons/report
```

**Parâmetros de Query:**
- `format` - Formato do arquivo (csv, xlsx, pdf)
- `groupBy` - Agrupamento para relatório sumário (day, month, turno, setor)
- Mesmos filtros da listagem

## Estrutura do Banco

### Tabelas Principais

#### `employees`
- `id` - ID único
- `user_id` - Referência para users
- `branch_id` - Filial
- `full_name` - Nome completo
- `position` - Cargo
- `status` - Status (ativo, inativo, licenca, ferias)
- `turno` - Turno de trabalho
- `setor` - Setor/área
- `commission_rate` - Taxa de comissão
- `created_at`, `updated_at` - Timestamps

#### `users`
- `id` - ID único
- `username` - Nome de usuário
- `email` - Email
- `password_hash` - Hash da senha
- `branch_id` - Filial

#### `waiter_sessions`
- `id` - ID único
- `employee_id` - Referência para employees
- `device_id` - Dispositivo
- `started_at`, `ended_at` - Início e fim da sessão

#### `orders`
- `id` - ID único
- `waiter_session_id` - Referência para waiter_sessions
- `total_amount` - Valor total
- `status` - Status do pedido
- `created_at` - Data de criação

## Cálculos de Métricas

### Pedidos por Dia
```
total_pedidos_30d / dias_com_pedidos
```

### Vendas 30d
```
SUM(orders.total_amount) WHERE status = 'closed' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
```

### Maior Faturamento
```
SELECT full_name, SUM(total_amount) as total_revenue
FROM employees e
JOIN waiter_sessions ws ON e.id = ws.employee_id
JOIN orders o ON ws.id = o.waiter_session_id
WHERE o.status = 'closed' AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY e.id, e.full_name
ORDER BY total_revenue DESC
LIMIT 1
```

## Relatórios

### Relatório Detalhado
- Um registro por garçom
- Inclui todas as informações pessoais e métricas
- Ordenado por nome

### Relatório Sumário
- Agregado por período, turno ou setor
- Inclui totais e médias
- Útil para análise gerencial

## Formatos de Exportação

### CSV
- Formato padrão para importação em planilhas
- Separador: vírgula
- Encoding: UTF-8

### XLSX
- Formato Excel moderno
- Múltiplas abas se necessário
- Formatação preservada

### PDF
- Formato para impressão e compartilhamento
- Layout profissional
- Inclui cabeçalho com data/hora

## Segurança

- Apenas usuários com role 'admin' podem acessar
- Validação de entrada em todos os endpoints
- Sanitização de parâmetros SQL
- Transações para operações críticas

## Dependências

- `mysql2` - Conexão com banco MySQL
- `xlsx` - Geração de arquivos Excel
- `pdfkit` - Geração de arquivos PDF
- `bcrypt` - Hash de senhas
- `express` - Framework web

## Configuração

Certifique-se de que as variáveis de ambiente estão configuradas:
- `DB_HOST` - Host do banco MySQL
- `DB_USER` - Usuário do banco
- `DB_PASSWORD` - Senha do banco
- `DB_NAME` - Nome do banco (cardapio)

## Exemplos de Uso

### Buscar garçons ativos do turno da manhã
```bash
curl "http://localhost:4000/api/garcons?status[]=ativo&turno[]=Manhã"
```

### Exportar relatório CSV dos últimos 30 dias
```bash
curl "http://localhost:4000/api/garcons/report?format=csv&dataInicio=2024-01-01&dataFim=2024-01-31"
```

### Obter métricas do mês atual
```bash
curl "http://localhost:4000/api/garcons/metrics/overview?dataInicio=2024-01-01&dataFim=2024-01-31"
```
