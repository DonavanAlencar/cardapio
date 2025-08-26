# Configuração do Backend - Cardápio

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na pasta `backend` com as seguintes configurações:

```env
# Configurações do Banco de Dados MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cardapio

# Configurações do JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui

# Configurações do Servidor
PORT=4000
NODE_ENV=development
```

## Como Configurar

### 1. **Criar arquivo .env**
```bash
cd backend
touch .env
```

### 2. **Editar o arquivo .env**
```bash
nano .env
# ou
code .env
```

### 3. **Inserir as configurações**
Copie e cole o conteúdo acima, ajustando os valores conforme seu ambiente.

### 4. **Reiniciar o servidor**
```bash
npm run dev
```

## Verificações Importantes

### **Banco de Dados**
- ✅ MySQL está rodando na porta 3306
- ✅ Banco `cardapio` existe
- ✅ Usuário tem permissões de acesso
- ✅ Tabelas foram criadas (execute o script SQL)

### **JWT_SECRET**
- ✅ Deve ser uma string longa e aleatória
- ✅ Não pode estar vazia
- ✅ Deve ser única para cada ambiente

### **Porta do Servidor**
- ✅ Porta 4000 deve estar disponível
- ✅ Não deve haver conflito com outros serviços

## Teste de Configuração

Após configurar, teste com:

```bash
# Teste básico
curl http://localhost:4000/api/health

# Teste do dashboard
curl http://localhost:4000/api/dashboard/simple-test

# Teste de autenticação
curl http://localhost:4000/api/auth/test-db
```

## Solução de Problemas

### **Erro: "JWT_SECRET não definida"**
- Verifique se o arquivo `.env` existe
- Verifique se `JWT_SECRET` está definido
- Reinicie o servidor após criar/modificar o `.env`

### **Erro: "ECONNREFUSED"**
- Verifique se o MySQL está rodando
- Verifique se as credenciais estão corretas
- Verifique se o banco `cardapio` existe

### **Erro: "Access denied"**
- Verifique as permissões do usuário MySQL
- Verifique se a senha está correta
- Verifique se o usuário tem acesso ao banco `cardapio`
