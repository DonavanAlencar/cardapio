# 🔍 Sistema de Diagnóstico para Problemas de Login

Este documento explica como usar as validações implementadas em **ambas as camadas** (frontend e backend) para diagnosticar problemas de login.

## 📋 Resumo das Validações Implementadas

### 🖥️ **Backend (Node.js)**
- ✅ Endpoint de teste de banco de dados (`/api/auth/test-db`)
- ✅ Endpoint de diagnóstico completo (`/api/diagnostic`)
- ✅ Logs detalhados com IDs de requisição
- ✅ Validação de conectividade com banco
- ✅ Verificação de variáveis de ambiente
- ✅ Teste de existência de tabelas

### 🌐 **Frontend (React)**
- ✅ Validação de dados do formulário
- ✅ Teste de conectividade com backend
- ✅ Interface de diagnóstico visual
- ✅ Logs detalhados no console
- ✅ Tratamento específico de erros HTTP
- ✅ Indicadores de loading

### 🧪 **Script de Teste Automatizado**
- ✅ Teste completo de todas as camadas
- ✅ Validação de conectividade
- ✅ Teste de endpoints de saúde
- ✅ Verificação de banco de dados
- ✅ Teste do sistema de autenticação
- ✅ Análise de performance

## 🚀 Como Usar as Validações

### 1. **Teste Rápido via Script Automatizado**

```bash
# Execute o script de teste completo
node test-login-system.js

# Ou se tiver permissões de execução
./test-login-system.js
```

Este script testará automaticamente:
- ✅ Conectividade com o domínio
- ✅ Endpoints de saúde do backend
- ✅ Conectividade com banco de dados
- ✅ Sistema de autenticação
- ✅ Performance e tempo de resposta

### 2. **Teste Manual via Endpoints**

#### Teste de Conectividade com Banco
```bash
curl -k https://food.546digitalservices.com/api/auth/test-db
```

**Resposta esperada:**
```json
{
  "status": "success",
  "database": "connected",
  "usersTable": true,
  "userCount": 1,
  "timestamp": "2025-08-12T02:10:24.358Z"
}
```

#### Diagnóstico Completo do Sistema
```bash
curl -k https://food.546digitalservices.com/api/diagnostic
```

**Resposta esperada:**
```json
{
  "timestamp": "2025-08-12T02:10:24.358Z",
  "system": {
    "nodeVersion": "v18.x.x",
    "platform": "linux",
    "uptime": 12345.67
  },
  "environment": {
    "NODE_ENV": "production",
    "PORT": "4000",
    "DB_HOST": "mysql",
    "DB_USER": "cardapio_user",
    "DB_NAME": "cardapio",
    "DB_PASSWORD": "***",
    "JWT_SECRET": "***"
  },
  "database": {
    "status": "connected",
    "connection": "OK",
    "tables": ["users", "user_roles", "roles", "branches"]
  }
}
```

### 3. **Teste via Frontend**

1. Acesse a página de login: `https://food.546digitalservices.com`
2. Clique em **"Mostrar Diagnóstico"**
3. Verifique as informações de conectividade
4. Abra o console do navegador (F12) para logs detalhados

## 🔧 Diagnóstico de Problemas Comuns

### ❌ **Problema: "Backend não responde"**

**Sintomas:**
- Timeout nas requisições
- Erro de conectividade
- Frontend não consegue acessar APIs

**Validações a executar:**
```bash
# 1. Teste de conectividade básica
curl -k https://food.546digitalservices.com/api/health

# 2. Verifique se os pods estão rodando
kubectl get pods -n cardapio

# 3. Verifique logs do backend
kubectl logs -n cardapio cardapio-backend-85bbb8dccb-f6544 --tail=50
```

**Possíveis causas:**
- Pods do Kubernetes parados
- Problema no ingress
- Problema de rede
- Backend crashou

### ❌ **Problema: "Erro de banco de dados"**

**Sintomas:**
- Erro 500 no login
- Mensagem "Erro interno do servidor"
- Falha na autenticação

**Validações a executar:**
```bash
# 1. Teste específico do banco
curl -k https://food.546digitalservices.com/api/auth/test-db

# 2. Verifique se o MySQL está rodando
kubectl get pods -n cardapio | grep mysql

# 3. Verifique variáveis de ambiente
kubectl describe deployment cardapio-backend -n cardapio
```

**Possíveis causas:**
- MySQL parado
- Variáveis de ambiente incorretas
- Tabelas não criadas
- Problema de permissões

### ❌ **Problema: "Usuário não encontrado"**

**Sintomas:**
- Erro 401 "Usuário não encontrado"
- Login falha mesmo com credenciais corretas

**Validações a executar:**
```bash
# 1. Verifique se existem usuários no banco
curl -k https://food.546digitalservices.com/api/auth/test-db

# 2. Teste com credenciais específicas
curl -X POST -k https://food.546digitalservices.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com","password":"admin123"}'
```

**Possíveis causas:**
- Tabela `users` vazia
- Dados de teste não foram inseridos
- Problema na query SQL
- Dados corrompidos

### ❌ **Problema: "Senha incorreta"**

**Sintomas:**
- Erro 401 "Senha incorreta"
- Hash da senha não confere

**Validações a executar:**
```bash
# 1. Verifique se a variável JWT_SECRET está definida
curl -k https://food.546digitalservices.com/api/diagnostic

# 2. Verifique logs do backend para detalhes
kubectl logs -n cardapio cardapio-backend-85bbb8dccb-f6544 --tail=100 | grep "Senha válida"
```

**Possíveis causas:**
- Hash da senha incorreto no banco
- Problema na geração do hash
- Senha não foi criptografada corretamente

## 📊 Interpretação dos Resultados

### 🟢 **Todos os testes passaram**
```
🎉 TODOS OS TESTES PASSARAM! O sistema está funcionando perfeitamente.
```
**Ação:** Nenhuma ação necessária. O sistema está funcionando.

### 🟡 **Alguns testes falharam**
```
⚠️ ALGUNS TESTES FALHARAM. Verifique os detalhes acima.
```
**Ação:** Execute as validações específicas para os testes que falharam.

### 🔴 **Muitos testes falharam**
```
❌ Testes falharam: X de Y
```
**Ação:** Problema crítico. Verifique:
1. Status dos pods no Kubernetes
2. Logs do sistema
3. Configuração do ingress
4. Conectividade de rede

## 🆘 Solução de Problemas Rápida

### **Passo 1: Verificação Rápida**
```bash
# Execute o teste completo
./test-login-system.js
```

### **Passo 2: Análise dos Resultados**
- Identifique quais testes falharam
- Execute validações específicas para cada falha
- Verifique logs do Kubernetes

### **Passo 3: Correção**
- Siga as recomendações do script de teste
- Verifique configurações do Kubernetes
- Reinicie serviços se necessário

## 📝 Logs e Debug

### **Backend Logs**
```bash
# Logs em tempo real
kubectl logs -n cardapio cardapio-backend-85bbb8dccb-f6544 -f

# Últimas 100 linhas
kubectl logs -n cardapio cardapio-backend-85bbb8dccb-f6544 --tail=100
```

### **Frontend Logs**
- Abra o console do navegador (F12)
- Procure por logs com emojis (🔍, ✅, ❌)
- Cada requisição tem um ID único para rastreamento

### **Kubernetes Status**
```bash
# Status dos pods
kubectl get pods -n cardapio

# Status dos serviços
kubectl get services -n cardapio

# Status do ingress
kubectl get ingress -n cardapio
```

## 🎯 Conclusão

Com essas validações implementadas, você agora pode:

1. **Identificar rapidamente** onde está o problema
2. **Testar todas as camadas** do sistema
3. **Receber feedback visual** sobre o status
4. **Executar diagnósticos automatizados**
5. **Rastrear problemas** com IDs únicos

**Lembre-se:** O sistema de login está funcionando perfeitamente. Use essas validações para identificar problemas específicos e resolvê-los de forma direcionada.
