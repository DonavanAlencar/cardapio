# Guia de Deploy - Cardápio Backend

## Pré-requisitos

- Docker instalado
- kubectl configurado e conectado ao cluster
- Acesso ao registry de imagens
- MySQL StatefulSet já implantado com:
  - Nome: `mysql-0`
  - Secret: `mysql-root-password`
  - Banco: `cardapio`

## Estrutura de Arquivos

```
cardapio/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
├── k8s/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
├── scripts/
│   ├── build-and-push.sh
│   └── deploy-k8s.sh
└── docker-compose.yml
```

## Passos para Deploy

### 1. Clone o Repositório

```bash
git clone <seu-repositorio>
cd cardapio
```

### 2. Configurar Registry

Edite os arquivos para usar seu registry:

- `scripts/build-and-push.sh` - linha 8: `DEFAULT_REGISTRY="seu-registry.com"`
- `scripts/deploy-k8s.sh` - linha 8: `DEFAULT_REGISTRY="seu-registry.com"`
- `k8s/deployment.yaml` - linha 15: `image: seu-registry.com/cardapio-backend:latest`

### 3. Build e Push da Imagem

```bash
# Tornar scripts executáveis
chmod +x scripts/*.sh

# Build e push (substitua pelo seu registry)
./scripts/build-and-push.sh seu-registry.com v1.0.0
```

### 4. Deploy no Kubernetes

```bash
# Deploy completo
./scripts/deploy-k8s.sh seu-registry.com v1.0.0
```

### 5. Verificar Deploy

```bash
# Verificar pods
kubectl get pods -n cardapio

# Verificar serviços
kubectl get services -n cardapio

# Verificar logs
kubectl logs -f deployment/cardapio-backend -n cardapio

# Testar health check
kubectl port-forward service/cardapio-backend-service 4000:80 -n cardapio
curl http://localhost:4000/api/health
```

## Configurações Importantes

### Banco de Dados
- **Host**: `mysql-0.mysql` (StatefulSet existente)
- **Usuário**: `root` (usando secret mysql-root-password)
- **Banco**: `cardapio` (já criado)

### Recursos
- **Replicas**: 3
- **CPU Request**: 100m
- **CPU Limit**: 500m
- **Memory Request**: 128Mi
- **Memory Limit**: 512Mi

### Health Checks
- **Liveness Probe**: `/api/health` a cada 30s
- **Readiness Probe**: `/api/health` a cada 5s

## Troubleshooting

### Verificar Conectividade com MySQL
```bash
# Testar conexão com o banco
kubectl run mysql-test --rm -it --image=mysql:8.0 -- mysql -h mysql-0.mysql -u root -p
```

### Verificar Secrets
```bash
# Listar secrets
kubectl get secrets -n cardapio

# Verificar secret mysql-root-password
kubectl get secret mysql-root-password -o yaml
```

### Logs Detalhados
```bash
# Logs do pod
kubectl logs -f deployment/cardapio-backend -n cardapio

# Descrever pod para ver eventos
kubectl describe pod -l app=cardapio-backend -n cardapio
```

## Rollback

```bash
# Rollback para versão anterior
kubectl rollout undo deployment/cardapio-backend -n cardapio

# Verificar histórico
kubectl rollout history deployment/cardapio-backend -n cardapio
```

## Limpeza

```bash
# Remover todos os recursos
kubectl delete namespace cardapio

# Ou remover individualmente
kubectl delete -f k8s/
``` 