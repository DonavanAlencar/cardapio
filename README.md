# Cardápio - Sistema de Gerenciamento e Pedidos para Restaurantes

Este projeto é um sistema abrangente de gerenciamento e pedidos para restaurantes, desenvolvido para otimizar as operações diárias, desde o atendimento ao cliente até a administração interna.

## Funcionalidades Principais

O sistema abrange as seguintes áreas funcionais:

### 1. Autenticação e Gerenciamento de Usuários

*   **Login de Usuários:** Permite o acesso ao sistema através de credenciais (página de Login, rota `/auth/login`).
*   **Controle de Acesso Baseado em Papéis (RBAC):** Diferencia as permissões de usuários entre administradores e garçons.
*   **Gerenciamento de Garçons:** Funcionalidade para administrar os dados dos garçons (página `AdminGarcons`).

### 2. Administração do Restaurante (Painel Administrativo)

Esta seção permite o controle total sobre as operações do restaurante:

*   **Gestão de Equipe:**
    *   Gerenciamento de garçons (`AdminGarcons`).
    *   Acompanhamento e gestão de comissões (`AdminComissao`).
*   **Gestão de Mesas:**
    *   Administração das mesas do restaurante (`AdminMesas`, rota `/mesas`).
*   **Gestão de Produtos e Estoque:**
    *   Cadastro e gerenciamento de produtos (`AdminProdutos`, rota `/produtos`).
    *   Organização de produtos por categorias (`AdminProductCategories`, rota `/productCategories`).
    *   Definição e aplicação de modificadores de produtos (ex: adicionais, remoções) (`AdminProductModifiers`, rota `/productModifiers`).
    *   Controle de ingredientes (`AdminIngredients`, rota `/ingredients`).
    *   Registro e acompanhamento de movimentações de estoque (`AdminStockMovements`, rota `/stockMovements`).
*   **Configuração de Pedidos e Pagamentos:**
    *   Gerenciamento de métodos de pagamento (`/paymentMethods`).
    *   Configurações gerais do sistema (`/configuracoes`).
*   **Relatórios:**
    *   Geração de diversos relatórios para análise de desempenho (`AdminReports`, rota `/reports`).

### 3. Operações do Garçom

Ferramentas dedicadas para a equipe de atendimento:

*   **Visualização e Gestão de Mesas:** Permite ao garçom ver o status das mesas e gerenciá-las (`GarcomMesas`).
*   **Registro e Gestão de Pedidos:** Funcionalidade para registrar e acompanhar os pedidos dos clientes (`GarcomPedido`, rota `/pedidos`).
*   **Consulta de Comissões:** Garçons podem verificar suas próprias comissões (`GarcomComissao`).

### 4. Menu para Clientes

*   **Cardápio Digital:** Exibição do cardápio do restaurante para os clientes (`Cardapio`).

### 5. Serviços de Backend

O backend fornece a infraestrutura para todas as funcionalidades:

*   **APIs RESTful:** Endpoints para todas as operações (ex: `/orders`, `/payments`, `/branches`).
*   **Conectividade com Banco de Dados:** Gerenciamento da conexão com o banco de dados (`db.js`).
*   **Sistema de Logs:** Registro de eventos e erros para monitoramento (`logger.js`).

## Tecnologias Utilizadas (Inferidas)

*   **Frontend:** React, React Router DOM, Tailwind CSS, Framer Motion.
*   **Backend:** Node.js, Express.js, JWT (JSON Web Tokens) para autenticação.
*   **Banco de Dados:** (Não especificado explicitamente, mas implícito pelas rotas do backend e `db.js`).

## Como Iniciar

Para configurar e executar o projeto localmente, siga as instruções nos diretórios `frontend` e `backend`.

---

**Nota:** Este README foi gerado automaticamente com base na estrutura do projeto e nos nomes dos arquivos/componentes. Para detalhes mais específicos, consulte a documentação interna ou o código-fonte de cada módulo.