# Guia de Instalação - Sistema de Reservas

## Pré-requisitos

- Node.js 16+ instalado
- MySQL 8.0+ funcionando
- Backend rodando na porta 4000
- Frontend configurado e funcionando
- Sistema de autenticação funcionando

## Passo a Passo da Instalação

### 1. Preparar o Banco de Dados

Execute o script de migração para atualizar a estrutura da tabela:

```bash
# Conectar ao MySQL
mysql -u [usuario] -p [nome_do_banco]

# Ou executar diretamente
mysql -u [usuario] -p [nome_do_banco] < backend/update_reservations_table.sql
```

**Verificar se a migração foi bem-sucedida:**

```sql
-- Verificar se as novas colunas foram criadas
DESCRIBE table_reservations;

-- Verificar se os índices foram criados
SHOW INDEX FROM table_reservations;

-- Verificar se os triggers foram criados
SHOW TRIGGERS LIKE 'table_reservations';
```

### 2. Verificar Backend

Certifique-se de que o backend está funcionando:

```bash
cd backend

# Verificar se as dependências estão instaladas
npm install

# Verificar se o servidor está rodando
npm start
# ou
node src/app.js
```

**Testar endpoints básicos:**

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/dashboard/test
```

### 3. Verificar Frontend

Certifique-se de que o frontend está funcionando:

```bash
cd front_new

# Instalar dependências se necessário
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

**Verificar se está acessível:**
- Abrir http://localhost:5173 no navegador
- Fazer login no sistema
- Verificar se o dashboard carrega

### 4. Testar Funcionalidades

#### 4.1 Teste Básico da API

```bash
# Usar o script de teste (requer token válido)
export TEST_TOKEN="seu-token-jwt-aqui"
node test-reservations.js
```

#### 4.2 Teste Manual no Frontend

1. **Acessar Dashboard:**
   - Fazer login no sistema
   - Navegar para o dashboard

2. **Verificar Botão de Reservas:**
   - Clicar em "📋 Ver Reservas"
   - Verificar se a seção aparece

3. **Criar Primeira Reserva:**
   - Clicar em "+ Nova Reserva"
   - Preencher formulário
   - Salvar reserva

4. **Verificar Lista:**
   - Verificar se a reserva aparece na lista
   - Testar filtros por status e data

## Configurações Importantes

### Variáveis de Ambiente

**Backend (.env):**
```env
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=seu_banco
JWT_SECRET=seu_secret_jwt
PORT=4000
```

**Frontend (config/apiConfig.js):**
```javascript
// Verificar se a URL está correta
BASE_URL: 'http://localhost:4000/api'
```

### Configuração do Banco

**Verificar tabelas necessárias:**
```sql
-- Tabelas que devem existir
SHOW TABLES LIKE 'table_reservations';
SHOW TABLES LIKE 'tables';
SHOW TABLES LIKE 'customers';
SHOW TABLES LIKE 'branches';
SHOW TABLES LIKE 'users';
```

**Verificar dados de teste:**
```sql
-- Deve ter pelo menos um cliente
SELECT * FROM customers LIMIT 1;

-- Deve ter pelo menos uma mesa
SELECT * FROM tables LIMIT 1;

-- Deve ter pelo menos um usuário
SELECT * FROM users LIMIT 1;
```

## Solução de Problemas

### Problemas Comuns

#### 1. Erro de Conexão com Banco

**Sintoma:** Erro "ECONNREFUSED" ou "ER_ACCESS_DENIED"

**Solução:**
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Verificar credenciais
mysql -u [usuario] -p

# Verificar se o banco existe
SHOW DATABASES;
```

#### 2. Erro de Autenticação

**Sintoma:** Erro 401 "Token de autorização não fornecido"

**Solução:**
- Verificar se está logado no frontend
- Verificar se o token está sendo enviado
- Verificar se JWT_SECRET está configurado

#### 3. Erro de CORS

**Sintoma:** Erro "CORS policy" no navegador

**Solução:**
- Verificar se o backend tem CORS habilitado
- Verificar se as URLs estão corretas
- Verificar se o frontend está na origem permitida

#### 4. Erro de Triggers

**Sintoma:** Erro ao criar/atualizar reservas

**Solução:**
```sql
-- Verificar se os triggers existem
SHOW TRIGGERS LIKE 'table_reservations';

-- Recriar triggers se necessário
-- Executar novamente o script update_reservations_table.sql
```

### Logs e Debug

**Backend:**
```bash
# Ver logs do servidor
tail -f backend/server.log

# Ver logs de erro
tail -f backend/app.log
```

**Frontend:**
- Abrir DevTools do navegador
- Verificar Console para erros
- Verificar Network para requisições

## Verificação Final

### Checklist de Instalação

- [ ] Banco de dados migrado com sucesso
- [ ] Backend rodando na porta 4000
- [ ] Frontend rodando e acessível
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] Botão de reservas visível
- [ ] Modal de criação funcionando
- [ ] Lista de reservas exibindo
- [ ] Filtros funcionando
- [ ] Edição de reservas funcionando
- [ ] Cancelamento funcionando

### Testes Recomendados

1. **Criar reserva para hoje**
2. **Criar reserva para amanhã**
3. **Editar uma reserva existente**
4. **Cancelar uma reserva**
5. **Filtrar por status**
6. **Filtrar por data**
7. **Verificar conflitos de horário**

## Suporte

### Recursos Úteis

- **Documentação:** `RESERVAS-IMPLEMENTACAO.md`
- **Script de Teste:** `test-reservations.js`
- **Logs:** Verificar arquivos de log do backend
- **Console:** Verificar DevTools do navegador

### Contato

Para problemas específicos:
1. Verificar logs e console
2. Testar com script de teste
3. Verificar configurações
4. Consultar documentação

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0.0
