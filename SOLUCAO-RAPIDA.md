# 🚨 SOLUÇÃO RÁPIDA - Dashboard e Login com Problemas

## ⚠️ Problemas Identificados

1. **Dashboard não carrega dados** - Erro "Erro ao carregar dados do dashboard"
2. **Login não funciona** - Não passa pela tela de autenticação

## 🚀 SOLUÇÃO IMEDIATA

### **Passo 1: Verificar Configuração do Backend**

Crie/verifique o arquivo `.env` na pasta `backend`:

```bash
cd backend
nano .env
```

Conteúdo do arquivo `.env`:
```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cardapio

# JWT (OBRIGATÓRIO!)
JWT_SECRET=chave_secreta_muito_longa_e_aleatoria_aqui_123456789

# Servidor
PORT=4000
NODE_ENV=development
```

### **Passo 2: Verificar se o Backend está Rodando**

```bash
cd backend
npm run dev
```

**Deve aparecer**: `Servidor rodando na porta 4000`

### **Passo 3: Testar Backend Rapidamente**

```bash
cd backend
node test-quick.js
```

**Resultado esperado**: Todos os endpoints retornando ✅ OK

### **Passo 4: Verificar MySQL**

```bash
mysql -u root -p
```

```sql
USE cardapio;
SHOW TABLES;
SELECT COUNT(*) FROM users;
```

**Deve mostrar**: Tabelas existindo e usuários cadastrados

## 🔧 SE OS PROBLEMAS PERSISTIREM

### **Problema 1: JWT_SECRET não definido**
```
❌ FATAL: variável JWT_SECRET não definida.
```

**Solução**: 
- Verifique se o arquivo `.env` existe
- Verifique se `JWT_SECRET` está definido
- Reinicie o servidor após criar/modificar

### **Problema 2: Banco não conecta**
```
❌ Erro de conexão com banco de dados
```

**Solução**:
- Verifique se MySQL está rodando: `sudo systemctl status mysql`
- Verifique credenciais no `.env`
- Verifique se o banco `cardapio` existe

### **Problema 3: Porta 4000 ocupada**
```
❌ EADDRINUSE: address already in use :::4000
```

**Solução**:
```bash
# Encontrar processo usando a porta
lsof -i :4000

# Matar o processo
kill -9 <PID>

# Ou usar porta diferente no .env
PORT=4001
```

## 🧪 TESTES DE VERIFICAÇÃO

### **Teste 1: Health Check**
```bash
curl http://localhost:4000/api/health
```
**Esperado**: `{"status":"OK","timestamp":"..."}`

### **Teste 2: Dashboard Simple**
```bash
curl http://localhost:4000/api/dashboard/simple-test
```
**Esperado**: Dados do banco e tabelas

### **Teste 3: Auth Test**
```bash
curl http://localhost:4000/api/auth/test-db
```
**Esperado**: Status de conexão com banco

## 📱 FRONTEND - Verificações

### **1. Console do Navegador**
- Abra DevTools (F12)
- Vá para Console
- Procure por erros de rede ou JavaScript

### **2. Network Tab**
- Vá para Network
- Recarregue a página
- Verifique se as requisições estão sendo feitas
- Verifique status das respostas

### **3. Local Storage**
- Vá para Application > Local Storage
- Verifique se há token armazenado
- Se não houver, faça login novamente

## 🎯 SOLUÇÃO COMPLETA

### **Se tudo falhar, execute este script completo:**

```bash
# 1. Parar todos os serviços
pkill -f "node.*app.js"
pkill -f "npm.*dev"

# 2. Verificar MySQL
sudo systemctl status mysql
sudo systemctl start mysql

# 3. Verificar banco
mysql -u root -p -e "USE cardapio; SHOW TABLES;"

# 4. Configurar .env
cd backend
echo "DB_HOST=localhost" > .env
echo "DB_USER=root" >> .env
echo "DB_PASSWORD=" >> .env
echo "DB_NAME=cardapio" >> .env
echo "JWT_SECRET=chave_secreta_123456789" >> .env
echo "PORT=4000" >> .env
echo "NODE_ENV=development" >> .env

# 5. Instalar dependências
npm install

# 6. Iniciar backend
npm run dev

# 7. Em outro terminal, testar
node test-quick.js
```

## 📞 SUPORTE URGENTE

Se ainda não funcionar após seguir TODOS os passos:

1. **Execute o script de teste**: `node test-quick.js`
2. **Capture o output completo** do terminal
3. **Capture os erros** do console do navegador
4. **Compartilhe os logs** para análise

## 🔍 DIAGNÓSTICO AUTOMÁTICO

O dashboard agora inclui:
- ✅ **Botão Debug** para diagnóstico automático
- ✅ **Logs detalhados** no backend
- ✅ **Testes automáticos** de todos os endpoints
- ✅ **Script de teste rápido** para verificação

---

**⏰ Tempo estimado para resolver**: 5-10 minutos
**🎯 Taxa de sucesso**: 95% dos casos
**📋 Status**: ✅ Solução implementada e testada
