# Tela de Estoque - Frontend

Este documento descreve a implementação da tela de controle de estoque no frontend.

## Visão Geral

A tela de estoque permite visualizar, filtrar e gerenciar itens do inventário, incluindo:
- Listagem de itens com filtros avançados
- Estatísticas em tempo real
- Histórico de movimentações por item
- Alertas de estoque baixo
- Paginação e ordenação

## Componentes Implementados

### 1. Stock.jsx (Página Principal)
**Localização:** `src/pages/Stock/Stock.jsx`

Componente principal que orquestra toda a funcionalidade de estoque.

#### Props
Nenhuma prop externa é necessária.

#### Estado Interno
- `items`: Array de itens do estoque
- `stats`: Estatísticas do estoque
- `pagination`: Configuração de paginação
- `filters`: Filtros ativos
- `loading`: Estado de carregamento
- `error`: Mensagens de erro
- `selectedItemId`: ID do item selecionado para detalhes
- `detailModalOpen`: Estado do modal de detalhes

#### Funcionalidades
- Carregamento automático de dados
- Gerenciamento de filtros
- Paginação
- Modal de detalhes
- Atualização manual de dados

### 2. StockFilters.jsx
**Localização:** `src/components/Stock/StockFilters.jsx`

Componente de filtros para busca e filtragem de itens.

#### Props
- `onFiltersChange`: Callback quando filtros mudam
- `onClearFilters`: Callback para limpar filtros

#### Filtros Disponíveis
- **Busca**: Texto livre para SKU, nome ou categoria
- **Categoria**: Dropdown com categorias disponíveis
- **Status**: OK ou Baixo estoque
- **Localização**: Dropdown com localizações

#### Funcionalidades
- Carregamento automático de opções de filtro
- Validação de filtros ativos
- Botão para limpar todos os filtros
- Indicador visual de filtros ativos

### 3. StockStats.jsx
**Localização:** `src/components/Stock/StockStats.jsx`

Componente para exibir estatísticas do estoque em cards.

#### Props
- `stats`: Objeto com estatísticas do estoque
- `loading`: Estado de carregamento

#### Estatísticas Exibidas
- **Total de Itens**: Número total de itens no estoque
- **Estoque Baixo**: Itens abaixo do mínimo
- **Sem Estoque**: Itens com quantidade zero
- **Itens Ativos**: Itens ativos no sistema

#### Funcionalidades
- Loading states com skeletons
- Cores diferenciadas por status
- Chips informativos para alertas
- Hover effects nos cards

### 4. StockItemsList.jsx
**Localização:** `src/components/Stock/StockItemsList.jsx`

Tabela para listar itens do estoque com paginação.

#### Props
- `items`: Array de itens para exibir
- `pagination`: Objeto de paginação
- `loading`: Estado de carregamento
- `onPageChange`: Callback para mudança de página
- `onRowsPerPageChange`: Callback para mudança de itens por página
- `onViewItem`: Callback para visualizar item

#### Colunas da Tabela
- SKU (ID do item)
- Nome
- Categoria
- Unidade
- Localização
- Saldo Disponível
- Mínimo
- Status
- Ações

#### Funcionalidades
- Loading states com skeletons
- Estados vazios informativos
- Paginação integrada
- Hover effects nas linhas
- Indicadores visuais de status
- Botão de ação para ver detalhes

### 5. StockItemDetailModal.jsx
**Localização:** `src/components/Stock/StockItemDetailModal.jsx`

Modal para exibir detalhes completos de um item e seu histórico.

#### Props
- `open`: Estado de abertura do modal
- `onClose`: Callback para fechar modal
- `itemId`: ID do item para carregar detalhes

#### Funcionalidades
- **Aba Detalhes**: Informações gerais do item
- **Aba Movimentações**: Histórico de entradas/saídas
- Carregamento automático de dados
- Estados de loading e erro
- Formatação de datas
- Indicadores visuais de status

## Serviços

### StockService
**Localização:** `src/services/stockService.js`

Classe de serviço para comunicação com as APIs de estoque.

#### Métodos Disponíveis
- `listStockItems(params)`: Listar itens com filtros
- `getStockItemById(id)`: Buscar item por ID
- `listStockMovements(params)`: Listar movimentações
- `getLowStockAlerts()`: Buscar alertas de estoque baixo
- `getStockStats()`: Buscar estatísticas
- `getStockCategories()`: Buscar categorias
- `getStockLocations()`: Buscar localizações
- `searchStockItems(query, limit)`: Busca para autocomplete

## Estrutura de Dados

### Item de Estoque
```typescript
interface StockItem {
  id: number;
  sku: string;
  nome: string;
  categoria: string;
  unidade: string;
  localizacao: string;
  saldo_disponivel: number;
  reservado: number;
  minimo: number;
  status: 'ok' | 'baixo';
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
```

### Movimentação
```typescript
interface StockMovement {
  id: number;
  ingrediente_id: number;
  item_nome: string;
  tipo: 'ENTRADA' | 'SAIDA';
  quantidade: number;
  motivo: string;
  data_hora: string;
  responsavel: string;
  status: string;
}
```

### Estatísticas
```typescript
interface StockStats {
  total_items: number;
  low_stock: number;
  out_of_stock: number;
  active_items: number;
  total_quantity: number;
}
```

## Estados da Interface

### Loading States
- Skeletons para estatísticas
- Skeletons para tabela
- Loading no modal de detalhes
- Botão de refresh desabilitado durante carregamento

### Estados de Erro
- Snackbar para erros gerais
- Alertas específicos no modal
- Fallbacks para dados ausentes

### Estados Vazios
- Mensagem informativa quando não há itens
- Estados vazios para movimentações
- Indicadores visuais para filtros ativos

## Responsividade

### Breakpoints
- **xs**: Mobile (12 colunas)
- **sm**: Tablet (6 colunas para estatísticas)
- **md**: Desktop (3 colunas para estatísticas)
- **xl**: Desktop grande (container expandido)

### Adaptações Mobile
- Filtros empilhados verticalmente
- Tabela com scroll horizontal
- Modal em tela cheia
- Botões de ação otimizados para touch

## Integração com Backend

### APIs Consumidas
- `GET /api/stock/items` - Listagem principal
- `GET /api/stock/items/:id` - Detalhes do item
- `GET /api/stock/movements` - Histórico de movimentações
- `GET /api/stock/stats` - Estatísticas
- `GET /api/stock/categories` - Categorias
- `GET /api/stock/locations` - Localizações

### Tratamento de Erros
- Try-catch em todas as chamadas de API
- Estados de erro específicos
- Mensagens de erro amigáveis
- Fallbacks para dados ausentes

### Cache e Performance
- Dados carregados sob demanda
- Paginação para grandes volumes
- Filtros aplicados no backend
- Estados de loading para feedback visual

## Customização

### Tema
- Cores do Material-UI
- Variantes de componentes
- Hover effects
- Transições suaves

### Componentes Reutilizáveis
- Cards de estatísticas
- Tabela com paginação
- Modal com tabs
- Filtros avançados

## Próximos Passos

### Funcionalidades Futuras
- Exportação de dados (CSV/PDF)
- Gráficos de tendências
- Notificações em tempo real
- Integração com sistema de compras
- Gestão de lotes e validades
- Múltiplos depósitos

### Melhorias Técnicas
- Virtualização para grandes listas
- Cache local com React Query
- Otimizações de performance
- Testes unitários e de integração
