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

## 🛠️ Comandos Manuais (se precisar)

```bash
# Build e push manual
docker build -t donavanalencar/cardapio-backend:1.0 ./backend
docker push donavanalencar/cardapio-backend:1.0

# Deploy manual
kubectl apply -f k8s/
```

## 🔄 Atualizar Versão

```bash
# Para nova versão (ex: 1.1)
./deploy.sh 1.1
```

## 🗑️ Limpeza

```bash
# Remover tudo
kubectl delete namespace cardapio
```

## ⚠️ Pré-requisitos

- ✅ Docker logado (`docker login`)
- ✅ kubectl configurado
- ✅ MySQL rodando (`mysql-0`)
- ✅ Namespace `cardapio` existe

---

**🎯 Resumo**: Execute `./deploy.sh` e pronto! 🎉 