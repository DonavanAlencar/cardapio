# 🚀 Guia Rápido - Deploy Cardápio Backend

## ✅ Configuração Atual
- **Registry**: `donavanalencar`
- **Imagem**: `donavanalencar/cardapio-backend:1.0`
- **MySQL**: StatefulSet `mysql-0` (já implantado)
- **Namespace**: `cardapio`

## 🚀 Deploy em 1 Comando

```bash
# Deploy completo (versão 1.0)
./deploy.sh

# Ou especificar versão
./deploy.sh 1.1
```

## 📋 O que o script faz:

1. ✅ Verifica se Docker está logado
2. ✅ Verifica se kubectl está configurado  
3. ✅ Verifica se MySQL está rodando
4. 🔨 Build da imagem Docker
5. 📤 Push para Docker Hub
6. 🚀 Deploy no Kubernetes
7. ✅ Verifica se tudo está funcionando

## 🔍 Verificar Deploy

```bash
# Ver pods
kubectl get pods -n cardapio

# Ver logs
kubectl logs -f deployment/cardapio-backend -n cardapio

# Testar API
kubectl port-forward service/cardapio-backend-service 4000:80 -n cardapio
curl http://localhost:4000/api/health
```

## 🔄 Rollback (Se algo der errado)

```bash
# Rollback para versão anterior
./scripts/rollback.sh

# Rollback para revision específica
./scripts/rollback.sh 1.0 2

# Ver histórico de versões
kubectl rollout history deployment/cardapio-backend -n cardapio
```

## 🧹 Limpeza Segura

```bash
# Remove apenas recursos do backend (preserva MySQL)
./scripts/cleanup.sh

# Remove tudo (incluindo MySQL - CUIDADO!)
kubectl delete namespace cardapio
```

## 🛠️ Comandos Manuais (se precisar)

```bash
# Build e push manual
docker build -t donavanalencar/cardapio-backend:1.0 ./backend
docker push donavanalencar/cardapio-backend:1.0

# Deploy manual
kubectl apply -f k8s/

# Atualizar imagem
kubectl set image deployment/cardapio-backend cardapio-backend=donavanalencar/cardapio-backend:1.1 -n cardapio
```

## 🔄 Atualizar Versão

```bash
# Para nova versão (ex: 1.1)
./deploy.sh 1.1
```

## ⚠️ Pré-requisitos

- ✅ Docker logado (`docker login`)
- ✅ kubectl configurado
- ✅ MySQL rodando (`mysql-0`)
- ✅ Namespace `cardapio` existe

## 🆘 Troubleshooting

### Problema: Health check falha no build
- **Solução**: Normal, o teste local não tem banco. O deploy continuará.

### Problema: Deployment excede progress deadline
```bash
# 1. Fazer diagnóstico completo
./scripts/debug.sh

# 2. Verificar logs específicos
kubectl logs -f deployment/cardapio-backend -n cardapio

# 3. Verificar eventos
kubectl get events -n cardapio --sort-by='.lastTimestamp'

# 4. Forçar restart
./scripts/restart.sh
```

### Problema: Pod não inicia
```bash
# Verificar logs
kubectl logs -f deployment/cardapio-backend -n cardapio

# Verificar eventos
kubectl describe pod -l app=cardapio-backend -n cardapio

# Fazer diagnóstico completo
./scripts/debug.sh
```

### Problema: Erro de conexão com MySQL
```bash
# Verificar se MySQL está rodando
kubectl get pods -n cardapio | grep mysql

# Testar conexão
kubectl run mysql-test --rm -it --image=mysql:8.0 -- mysql -h mysql-0.mysql -u root -p

# Verificar secret
kubectl get secret mysql-root-password -n cardapio
```

### Problema: Pods em CrashLoopBackOff
```bash
# Verificar logs do pod específico
kubectl logs -f pod/[nome-do-pod] -n cardapio

# Verificar descrição do pod
kubectl describe pod [nome-do-pod] -n cardapio

# Fazer restart
./scripts/restart.sh
```

## 🔧 Scripts de Manutenção

```bash
# Diagnóstico completo
./scripts/debug.sh

# Restart do deployment
./scripts/restart.sh

# Rollback seguro
./scripts/rollback.sh

# Limpeza segura
./scripts/cleanup.sh
```

---

**🎯 Resumo**: Execute `./deploy.sh` e pronto! 🎉 