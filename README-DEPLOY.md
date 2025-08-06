# 🚀 Deploy do Backend Cardápio - Kubernetes

## 📋 Resumo das Configurações

### ✅ Arquivos Criados/Modificados

#### Backend
- `backend/Dockerfile` - Otimizado com segurança e health checks
- `backend/.dockerignore` - Para otimizar build
- `backend/src/app.js` - Adicionado endpoint `/api/health`

#### Kubernetes
- `k8s/namespace.yaml` - Namespace dedicado
- `k8s/configmap.yaml` - Configurações da aplicação
- `k8s/secret.yaml` - Secret para credenciais (usando mysql-root-password)
- `k8s/deployment.yaml` - Deployment com 3 réplicas
- `k8s/service.yaml` - Service ClusterIP
- `k8s/ingress.yaml` - Ingress para acesso externo
- `k8s/kustomization.yaml` - Para gerenciar configurações

#### Scripts
- `scripts/build-and-push.sh` - Build e push da imagem
- `scripts/deploy-k8s.sh` - Deploy no Kubernetes
- `scripts/test-local.sh` - Teste local conectando ao K8s

#### Documentação
- `DEPLOY.md` - Guia completo de deploy
- `docker-compose.yml` - Para testes locais (opcional)

## 🔧 Configurações Específicas

### Banco de Dados
- **Host**: `mysql-0.mysql` (StatefulSet existente)
- **Usuário**: `root`
- **Senha**: Secret `mysql-root-password`
- **Banco**: `cardapio` (já criado)

### Recursos
- **Replicas**: 3
- **CPU**: 100m request, 500m limit
- **Memory**: 128Mi request, 512Mi limit

## 🚀 Passos para Deploy

### 1. Clone e Configure
```bash
git clone <seu-repositorio>
cd cardapio
chmod +x scripts/*.sh
```

### 2. Editar Registry
Substitua `your-registry.com` pelos seus arquivos:
- `scripts/build-and-push.sh` (linha 8)
- `scripts/deploy-k8s.sh` (linha 8)
- `k8s/deployment.yaml` (linha 15)
- `k8s/kustomization.yaml` (linha 18)

### 3. Build e Push
```bash
./scripts/build-and-push.sh seu-registry.com v1.0.0
```

### 4. Deploy
```bash
./scripts/deploy-k8s.sh seu-registry.com v1.0.0
```

### 5. Verificar
```bash
kubectl get pods -n cardapio
kubectl logs -f deployment/cardapio-backend -n cardapio
```

## 🧪 Teste Local (Opcional)
```bash
./scripts/test-local.sh
```

## 📊 Monitoramento

### Health Check
- Endpoint: `/api/health`
- Liveness: 30s
- Readiness: 5s

### Logs
```bash
kubectl logs -f deployment/cardapio-backend -n cardapio
```

### Métricas
```bash
kubectl top pods -n cardapio
kubectl describe pod -l app=cardapio-backend -n cardapio
```

## 🔄 Rollback
```bash
kubectl rollout undo deployment/cardapio-backend -n cardapio
```

## 🗑️ Limpeza
```bash
kubectl delete namespace cardapio
```

## ⚠️ Importante

1. **Registry**: Substitua `your-registry.com` pelo seu registry real
2. **MySQL**: Certifique-se que o StatefulSet `mysql-0` está rodando
3. **Secret**: A secret `mysql-root-password` deve existir
4. **Banco**: O banco `cardapio` deve estar criado

## 📞 Suporte

Para problemas:
1. Verificar logs: `kubectl logs -f deployment/cardapio-backend -n cardapio`
2. Verificar eventos: `kubectl describe pod -l app=cardapio-backend -n cardapio`
3. Testar conectividade MySQL: `kubectl run mysql-test --rm -it --image=mysql:8.0 -- mysql -h mysql-0.mysql -u root -p` 