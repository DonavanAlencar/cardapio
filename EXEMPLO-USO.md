# Guia Prático - Como Usar o Sistema de Cardápio

## 🚀 Iniciando o Sistema

### 1. Backend
```bash
cd backend
npm install
npm start
```

### 2. Frontend
```bash
cd front_new
npm install
npm run dev
```

## 📱 Interface Principal - Menu

### Acessando a Tela
- Navegue para `/menu` no frontend
- Faça login com credenciais de admin/gerente

### Funcionalidades Disponíveis

#### 🔍 Busca Inteligente
- **Campo de busca**: Digite o nome do produto
- **Autocomplete**: Resultados aparecem em tempo real
- **Navegação**: Use ↑↓ para navegar, Enter para selecionar
- **Limpar**: Clique no X para limpar a busca

#### 📊 Métricas em Tempo Real
- **Total de produtos**: Contagem atualizada
- **Produtos ativos**: Produtos disponíveis para venda
- **Categorias**: Número de categorias ativas
- **Estoque baixo**: Produtos com estoque crítico

#### 🏷️ Filtros Rápidos
- **Todos**: Mostra todos os produtos
- **Ativos**: Apenas produtos ativos
- **Inativos**: Produtos desabilitados

#### 🎯 Filtros Avançados
- **Categoria**: Dropdown com todas as categorias
- **Ordenação**: Nome, preço, data de criação
- **Status**: Ativo/Inativo

## ➕ Criando um Novo Produto

### 1. Abrir Modal
- Clique no botão **"Novo Produto"** (azul)
- Modal aparece com formulário completo

### 2. Preencher Dados Básicos
```javascript
Nome: "X-Burger Especial"
Descrição: "Hambúrguer artesanal com queijo cheddar"
SKU: "XBURG001"
Preço: 25.90
Categoria: "Lanches"
```

### 3. Configurações Avançadas
- **Status**: Ativo/Inativo
- **Preparo**: Tempo em minutos
- **Estoque**: Quantidade disponível
- **Imagens**: Upload de fotos do produto

### 4. Salvar
- Clique em **"Salvar"**
- Produto aparece na lista automaticamente
- Notificação de sucesso é exibida

## ✏️ Editando um Produto

### 1. Acessar Produto
- Clique no botão **"Editar"** (laranja) na linha do produto
- Modal abre com dados preenchidos

### 2. Modificar Campos
- Altere qualquer campo necessário
- Validações em tempo real
- Preview das mudanças

### 3. Atualizar
- Clique em **"Atualizar"**
- Mudanças são salvas no banco
- Lista é atualizada automaticamente

## 🗑️ Deletando um Produto

### 1. Selecionar Produto
- Clique no botão **"Deletar"** (vermelho)
- Confirmação é solicitada

### 2. Confirmar Ação
- **"Sim"**: Produto é removido permanentemente
- **"Cancelar"**: Operação é cancelada

### ⚠️ Importante
- Produtos com pedidos ativos não podem ser deletados
- Sistema verifica dependências antes de deletar

## 📋 Gerenciando Categorias

### 1. Acessar Categorias
- Use o dropdown de filtro por categoria
- Clique em **"Gerenciar Categorias"** (se disponível)

### 2. Criar Nova Categoria
```javascript
Nome: "Bebidas Artesanais"
Descrição: "Refrigerantes e sucos naturais"
Ordem: 3
Status: Ativo
```

### 3. Reordenar Categorias
- Arraste e solte para reordenar
- Ordem é salva automaticamente
- Afeta a exibição no menu

## 🧪 Gerenciando Ingredientes

### 1. Acessar Ingredientes
- Navegue para tela de ingredientes
- Ou use o modal de produto para associar

### 2. Criar Ingrediente
```javascript
Nome: "Queijo Cheddar"
Unidade: "kg"
Preço: 45.00
Estoque: 10.5
Status: Ativo
```

### 3. Associar ao Produto
- No modal do produto, seção "Ingredientes"
- Clique em **"Adicionar Ingrediente"**
- Selecione da lista ou crie novo

## 🔍 Funcionalidades de Busca

### Busca por Texto
- **Nome do produto**: "burger", "pizza"
- **Descrição**: "artesanal", "natural"
- **SKU**: "XBURG001"

### Busca por Categoria
- Selecione categoria no dropdown
- Lista filtra automaticamente
- Contador mostra total de produtos

### Busca Avançada
- Combine múltiplos filtros
- Filtros são aplicados em tempo real
- Estado é mantido durante navegação

## 📱 Responsividade

### Desktop (>1024px)
- Layout completo com todas as colunas
- Sidebar de filtros sempre visível
- Ações em hover

### Tablet (768px-1024px)
- Layout adaptado para telas médias
- Filtros em dropdown
- Colunas reorganizadas

### Mobile (<768px)
- Layout em coluna única
- Filtros em modal
- Botões de ação empilhados

## ⌨️ Navegação por Teclado

### Atalhos Principais
- **Tab**: Navegar entre elementos
- **Enter**: Selecionar/ativar
- **Escape**: Fechar modais
- **Arrow Keys**: Navegar em listas

### Busca
- **Digite**: Iniciar busca
- **↑↓**: Navegar resultados
- **Enter**: Selecionar resultado
- **Escape**: Limpar busca

## 🚨 Tratamento de Erros

### Erros de Validação
- Campos obrigatórios destacados
- Mensagens de erro específicas
- Validação em tempo real

### Erros de Rede
- Tentativa de reconexão automática
- Mensagens de erro claras
- Fallback para dados locais

### Erros de Permissão
- Verificação de role (admin/gerente)
- Mensagens de acesso negado
- Redirecionamento para login se necessário

## 📊 Relatórios e Estatísticas

### Estatísticas Gerais
- Total de produtos por categoria
- Produtos mais populares
- Produtos com estoque baixo
- Tendências de vendas

### Exportação
- Dados em CSV/Excel
- Filtros aplicados mantidos
- Formato personalizável

## 🔧 Configurações

### Preferências do Usuário
- Tema claro/escuro
- Idioma da interface
- Configurações de notificação
- Preferências de exibição

### Configurações do Sistema
- Limite de itens por página
- Timeout de sessão
- Configurações de backup
- Logs de auditoria

## 🆘 Solução de Problemas

### Produto não aparece
1. Verificar status (ativo/inativo)
2. Verificar filtros aplicados
3. Verificar permissões de usuário
4. Recarregar a página

### Erro ao salvar
1. Verificar campos obrigatórios
2. Verificar conexão com banco
3. Verificar permissões
4. Verificar logs do backend

### Busca não funciona
1. Verificar conexão com API
2. Verificar parâmetros de busca
3. Verificar logs do backend
4. Limpar cache do navegador

## 📞 Suporte

### Logs de Debug
- Console do navegador (F12)
- Logs do backend
- Network tab para requisições

### Informações do Sistema
- Versão do backend
- Versão do frontend
- Configurações do banco
- Status dos serviços

## 🎯 Dicas de Uso

### Performance
- Use filtros para reduzir resultados
- Aproveite a paginação
- Use busca em vez de scroll
- Mantenha listas organizadas

### Organização
- Use categorias consistentes
- Mantenha SKUs únicos
- Atualize estoques regularmente
- Use descrições claras

### Manutenção
- Revise produtos inativos
- Monitore estoques baixos
- Atualize preços regularmente
- Faça backup dos dados

## 🔮 Funcionalidades Futuras

### Próximas Versões
- Upload de imagens com drag & drop
- Importação em lote via CSV
- Relatórios com gráficos
- Notificações push
- API pública para integrações

### Melhorias Técnicas
- Cache Redis para performance
- WebSockets para tempo real
- PWA para funcionalidade offline
- Testes automatizados
- CI/CD pipeline

---

**🎉 Parabéns!** Você agora domina o sistema de cardápio completo. Use essas funcionalidades para gerenciar seu negócio de forma eficiente e profissional.
