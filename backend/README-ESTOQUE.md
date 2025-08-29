# APIs de Estoque - Backend

Este documento descreve as APIs implementadas para o controle de estoque do sistema.

## Endpoints Disponíveis

### Base URL
```
/api/stock
```

### Autenticação
Todas as rotas requerem autenticação via middleware `auth` e autorização específica para estoque.

**Roles permitidos:** `admin`, `gerente`, `estoque`

## 1. Listar Itens do Estoque

**GET** `/api/stock/items`

Lista todos os itens do estoque com filtros, paginação e ordenação.

#### Query Parameters
- `page` (number, default: 1): Página atual
- `limit` (number, default: 20): Itens por página
- `search` (string): Busca por SKU, nome ou categoria
- `categoria` (string): Filtrar por categoria
- `status` (string): Filtrar por status (`ok`, `low`)
- `sortBy` (string, default: `nome`): Campo para ordenação
- `sortOrder` (string, default: `ASC`): Ordem (`ASC`, `DESC`)

#### Response
```json
{
  "items": [
    {
      "id": 1,
      "sku": "CARNE001",
      "nome": "Carne",
      "categoria": "Ingrediente",
      "unidade": "kg",
      "localizacao": "Depósito Principal",
      "saldo_disponivel": 10.00,
      "reservado": 0,
      "minimo": 1.00,
      "status": "ok",
      "ativo": 1,
      "created_at": "2025-07-10T16:54:52.000Z",
      "updated_at": "2025-07-10T16:54:52.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

## 2. Obter Detalhes de um Item

**GET** `/api/stock/items/:id`

Retorna detalhes completos de um item específico.

#### Path Parameters
- `id` (number): ID do item

#### Response
```json
{
  "id": 1,
  "sku": "CARNE001",
  "nome": "Carne",
  "categoria": "Ingrediente",
  "unidade": "kg",
  "localizacao": "Depósito Principal",
  "saldo_disponivel": 10.00,
  "reservado": 0,
  "minimo": 1.00,
  "status": "ok",
  "ativo": 1,
  "created_at": "2025-07-10T16:54:52.000Z",
  "updated_at": "2025-07-10T16:54:52.000Z"
}
```

## 3. Listar Movimentações

**GET** `/api/stock/movements`

Lista movimentações de estoque com filtros e paginação.

#### Query Parameters
- `page` (number, default: 1): Página atual
- `limit` (number, default: 20): Movimentações por página
- `itemId` (number): Filtrar por item específico
- `tipo` (string): Filtrar por tipo (`ENTRADA`, `SAIDA`)
- `dataInicial` (string): Data inicial (YYYY-MM-DD)
- `dataFinal` (string): Data final (YYYY-MM-DD)
- `sortBy` (string, default: `ocorrido_em`): Campo para ordenação
- `sortOrder` (string, default: `DESC`): Ordem (`ASC`, `DESC`)

#### Response
```json
{
  "movements": [
    {
      "id": 1,
      "ingrediente_id": 1,
      "item_nome": "Carne",
      "tipo": "ENTRADA",
      "quantidade": 10.00,
      "motivo": "Stock Inicial",
      "data_hora": "2025-07-10T16:54:52.000Z",
      "responsavel": "Sistema",
      "status": "entrada"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

## 4. Alertas de Estoque Baixo

**GET** `/api/stock/alerts/low-stock`

Retorna itens com estoque baixo ou zerado.

#### Response
```json
{
  "alerts": [
    {
      "id": 1,
      "nome": "Carne",
      "unidade_medida": "kg",
      "quantidade_estoque": 0.50,
      "quantidade_minima": 1.00,
      "priority": "high",
      "deficit": 0.50
    }
  ],
  "total": 1,
  "critical": 0,
  "high": 1
}
```

## 5. Estatísticas do Estoque

**GET** `/api/stock/stats`

Retorna estatísticas gerais do estoque.

#### Response
```json
{
  "total_items": 5,
  "low_stock": 1,
  "out_of_stock": 0,
  "active_items": 5,
  "total_quantity": 88.00
}
```

## 6. Categorias

**GET** `/api/stock/categories`

Retorna categorias disponíveis para autocomplete.

#### Response
```json
[
  {
    "categoria": "Ingrediente"
  }
]
```

## 7. Localizações

**GET** `/api/stock/locations`

Retorna localizações disponíveis para autocomplete.

#### Response
```json
[
  {
    "id": 1,
    "nome": "Depósito Principal",
    "tipo": "deposito"
  },
  {
    "id": 2,
    "nome": "Geladeira",
    "tipo": "refrigerado"
  }
]
```

## Estrutura do Banco

### Tabelas Utilizadas

#### `ingredientes`
- `id`: ID único do ingrediente
- `nome`: Nome do ingrediente (usado como SKU)
- `unidade_medida`: Unidade de medida (kg, unidade, etc.)
- `quantidade_estoque`: Quantidade atual em estoque
- `quantidade_minima`: Quantidade mínima para alertas
- `ativo`: Status ativo/inativo
- `created_at`, `updated_at`: Timestamps

#### `estoque_movimentos`
- `id`: ID único da movimentação
- `ingrediente_id`: Referência ao ingrediente
- `tipo_movimento`: Tipo (`ENTRADA`, `SAIDA`)
- `quantidade`: Quantidade movimentada
- `referencia`: Motivo/referência da movimentação
- `ocorrido_em`: Data/hora da movimentação

## Tratamento de Erros

### Códigos de Status HTTP
- `200`: Sucesso
- `400`: Parâmetros inválidos
- `401`: Não autenticado
- `403`: Acesso negado
- `404`: Item não encontrado
- `500`: Erro interno do servidor

### Formato de Erro
```json
{
  "message": "Descrição do erro"
}
```

## Exemplos de Uso

### Buscar itens com estoque baixo
```bash
GET /api/stock/items?status=low&limit=10
```

### Buscar movimentações de um item específico
```bash
GET /api/stock/movements?itemId=1&limit=50
```

### Buscar itens por nome
```bash
GET /api/stock/items?search=carne&page=1&limit=20
```

## Notas de Implementação

- Todas as queries são parametrizadas para evitar SQL injection
- Paginação implementada com `LIMIT` e `OFFSET`
- Filtros são aplicados dinamicamente baseados nos parâmetros fornecidos
- Ordenação suporta múltiplos campos
- Status de estoque é calculado dinamicamente baseado na quantidade vs. mínimo
- Localizações são hardcoded por enquanto (pode ser expandido para tabela no futuro)
