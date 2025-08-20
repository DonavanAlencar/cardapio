# Deploy do Front-new + Backend no Kubernetes

Este documento descreve como fazer o deploy do **front_new** (nova versão do frontend) junto com o **backend** no Kubernetes.

## 📁 Estrutura de Arquivos Criados

### Kubernetes Manifests
- `k8s/front-new-deployment.yaml` - Deployment do front_new
- `k8s/front-new-service.yaml` - Service do front_new
- `k8s/front-new-configmap.yaml` - Configurações do front_new
- `k8s/front-new-ingress.yaml` - Ingress para roteamento
- `k8s/front-new-kustomization.yaml` - Kustomization para o front_new

### Scripts de Deploy
- `scripts/deploy-front-new-k8s.sh` - Deploy no Kubernetes
- `scripts/build-and-push-front-new.sh` - Build e push da imagem Docker
- `scripts/deploy-front-new-complete.sh` - Script completo (build + deploy)

### Docker
- `front_new/Dockerfile` - Dockerfile para build da imagem (Node.js + serve)
- `front_new/package.json` - Dependências do projeto

## 🚀 Como Fazer o Deploy

### Opção 1: Deploy Completo (Recomendado)
```bash
# Deploy completo: build + push + deploy
./scripts/deploy-front-new-complete.sh [registry] [tag]

# Exemplo:
./scripts/deploy-front-new-complete.sh donavanalencar 1.0
```

### Opção 2: Deploy em Etapas
```bash
# 1. Build e push da imagem
./scripts/build-and-push-front-new.sh [registry] [tag]

# 2. Deploy no Kubernetes
./scripts/deploy-front-new-k8s.sh [registry] [tag]
```

### Opção 3: Deploy Manual
```bash
# Aplicar os manifestos manualmente
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/front-new-configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/front-new-deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/front-new-service.yaml
kubectl apply -f k8s/front-new-ingress.yaml
```

## 🌐 URLs de Acesso

Após o deploy, as aplicações estarão disponíveis em:

- **Front-new**: https://food.546digitalservices.com/new
- **API Backend**: https://food.546digitalservices.com/api
- **Frontend Original**: https://food.546digitalservices.com/ (mantido)

## 📊 Verificação do Deploy

### Status dos Pods
```bash
kubectl get pods -n cardapio
```

### Status dos Serviços
```bash
kubectl get services -n cardapio
```

### Status dos Ingress
```bash
kubectl get ingress -n cardapio
```

### Logs das Aplicações
```bash
# Logs do front_new
kubectl logs -f deployment/cardapio-front-new -n cardapio

# Logs do backend
kubectl logs -f deployment/cardapio-backend -n cardapio
```

## 🔧 Configurações

### Variáveis de Ambiente
- `VITE_API_BASE_URL`: URL da API (configurada via ConfigMap)
- `NODE_ENV`: Ambiente do backend
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Configurações do banco

### Recursos
- **Front-new**: 64Mi-256Mi RAM, 50m-200m CPU
- **Backend**: 128Mi-512Mi RAM, 100m-500m CPU

### Portas
- **Front-new**: 5173 (container) → 80 (service) - usando serve
- **Backend**: 4000 (container) → 80 (service)

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Imagem não encontrada
```bash
# Verificar se a imagem existe no registry
docker pull donavanalencar/cardapio-front-new:1.0
```

#### 2. Pods não iniciam
```bash
# Verificar eventos dos pods
kubectl describe pod <pod-name> -n cardapio

# Verificar logs
kubectl logs <pod-name> -n cardapio
```

#### 3. Ingress não funciona
```bash
# Verificar se o Traefik está rodando
kubectl get pods -n kube-system | grep traefik

# Verificar configuração do ingress
kubectl describe ingress cardapio-front-new-ingress -n cardapio
```

#### 4. Problemas de conectividade
```bash
# Testar conectividade interna
kubectl run test-pod --image=busybox -it --rm -n cardapio -- wget -O- http://cardapio-front-new-service

# Verificar DNS
kubectl run test-pod --image=busybox -it --rm -n cardapio -- nslookup cardapio-front-new-service
```

## 📝 Personalizações

### Alterar Registry
Edite os scripts e substitua `donavanalencar` pelo seu registry:
```bash
# Exemplo para registry próprio
./scripts/deploy-front-new-complete.sh registry.seudominio.com 1.0
```

### Alterar Tag
```bash
# Exemplo para tag específica
./scripts/deploy-front-new-complete.sh donavanalencar v2.0.0
```

### Alterar Configurações
Edite os arquivos de ConfigMap:
- `k8s/front-new-configmap.yaml` - Configurações do front_new
- `k8s/configmap.yaml` - Configurações do backend

## 🔄 Rollback

Para fazer rollback de uma versão:
```bash
# Rollback para versão anterior
kubectl rollout undo deployment/cardapio-front-new -n cardapio
kubectl rollout undo deployment/cardapio-backend -n cardapio

# Verificar status
kubectl rollout status deployment/cardapio-front-new -n cardapio
kubectl rollout status deployment/cardapio-backend -n cardapio
```

## 📚 Referências

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Traefik Ingress Controller](https://doc.traefik.io/traefik/providers/kubernetes-ingress/)
- [Docker Multi-stage Builds](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/#use-multi-stage-builds)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
