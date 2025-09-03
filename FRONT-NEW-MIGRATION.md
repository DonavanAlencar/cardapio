# Migração do Frontend para Front New

## Visão Geral

Este documento descreve a migração do sistema de deploy do `frontend` (React) para o `front_new` (Vite + React).

## Principais Mudanças

### 1. Arquivos Atualizados

#### deploy.sh
- Substituído todas as referências de `frontend` para `front_new`
- Atualizada função `fix_frontend_css()` para `fix_front_new_css()`
- Configuração adaptada para Vite em vez de Tailwind/PostCSS
- Script de build alterado para `build-and-push-front-new.sh`
- **NOVO**: Adicionado suporte completo ao MySQL StatefulSet
- **NOVO**: Opções `--mysql-only`, `--mysql-backup`, `--mysql-restore`

#### Scripts de Build
- **Novo**: `scripts/build-and-push-front-new.sh` - Para o front_new
- **Mantido**: `scripts/build-and-push-frontend.sh` - Para compatibilidade (legacy)

#### Kubernetes
- **Deployment**: `k8s/frontend-deployment.yaml` → `cardapio-front-new`
- **Service**: `k8s/frontend-service.yaml` → `cardapio-front-new-service`
- **ConfigMap**: `k8s/frontend-configmap.yaml` → `front-new-api-config`
- **Ingress**: Atualizado para usar front_new como principal
- **NOVO**: **MySQL StatefulSet**: `k8s/mysql-statefulset.yaml`
- **NOVO**: **MySQL Service**: `k8s/mysql-service.yaml`
- **NOVO**: **MySQL Secrets**: `k8s/mysql-secret.yaml`
- **NOVO**: **MySQL ConfigMaps**: `k8s/mysql-init-configmap.yaml`, `k8s/mysql-backup-configmap.yaml`

### 2. Configurações do Front New

#### Dockerfile
- Multi-stage build otimizado
- Nginx para servir arquivos estáticos
- Porta 80 (padrão nginx)
- Configuração de health check em `/health`

#### Vite Config
- Otimizações para produção
- Chunk splitting para melhor performance
- Variáveis de ambiente configuradas
- Host configurado para `0.0.0.0`

#### Nginx Config
- Configuração otimizada para SPA
- Headers de segurança
- Compressão gzip
- Cache para assets estáticos
- Health check endpoint

### 3. Variáveis de Ambiente

#### Antigo (React)
```bash
REACT_APP_API_BASE_URL=http://cardapio-backend-service:80/api
```

#### Novo (Vite)
```bash
VITE_API_BASE_URL=http://cardapio-backend-service:80/api
```

### 4. Portas

#### Desenvolvimento
- **Frontend (legacy)**: Porta 3000
- **Front New**: Porta 5173

#### Produção
- **Frontend (legacy)**: Porta 3000
- **Front New**: Porta 80 (nginx)

## Comandos de Deploy

### Deploy Completo
```bash
./deploy.sh [versao]
```

### Apenas Front New
```bash
./deploy.sh [versao] --frontend-only
```

### Apenas Backend
```bash
./deploy.sh [versao] --backend-only
```

### Apenas MySQL
```bash
./deploy.sh [versao] --mysql-only
```

### Backup do MySQL
```bash
./deploy.sh [versao] --mysql-backup
```

### Restaurar MySQL
```bash
./deploy.sh [versao] --mysql-restore
```

### Corrigir CSS/Configuração
```bash
./deploy.sh [versao] --fix-css
```

## Estrutura de URLs

### Produção
- **Front New**: `https://food.546digitalservices.com/` (principal)
- **Frontend Legacy**: `https://food.546digitalservices.com/old`
- **API**: `https://food.546digitalservices.com/api`

### Desenvolvimento Local
- **Front New**: `http://localhost:5173`
- **Frontend Legacy**: `http://localhost:3000`
- **API**: `http://localhost:4000`

## Comandos Úteis

### Verificar Status
```bash
kubectl get pods -n cardapio
kubectl get services -n cardapio
kubectl get statefulset -n cardapio
kubectl get pvc -n cardapio
```

### Logs
```bash
# MySQL
kubectl logs -f mysql-0 -n cardapio

# Front New
kubectl logs -f deployment/cardapio-front-new -n cardapio

# Frontend Legacy
kubectl logs -f deployment/cardapio-frontend -n cardapio

# Backend
kubectl logs -f deployment/cardapio-backend -n cardapio
```

### Port Forward
```bash
# MySQL
kubectl port-forward service/mysql 3306:3306 -n cardapio

# Front New
kubectl port-forward service/cardapio-front-new-service 5173:80 -n cardapio

# Frontend Legacy
kubectl port-forward service/cardapio-frontend-service 3000:80 -n cardapio

# API
kubectl port-forward service/cardapio-backend-service 4000:80 -n cardapio
```

## Rollback

Para fazer rollback para o frontend antigo:

1. Atualizar o ingress para usar `cardapio-frontend-service` como principal
2. Reverter as mudanças no `deploy.sh`
3. Executar `./deploy.sh [versao] --frontend-only`

## Notas Importantes

1. **Vite**: O front_new usa Vite como bundler, que é mais rápido que Create React App
2. **Nginx**: Em produção, usa nginx para servir arquivos estáticos (mais eficiente)
3. **Health Check**: Endpoint `/health` para verificações de saúde do Kubernetes
4. **Compatibilidade**: O frontend antigo ainda está disponível em `/old` para transição gradual
5. **Variáveis de Ambiente**: Mudança de `REACT_APP_` para `VITE_` (padrão Vite)
6. **MySQL**: StatefulSet com backup automático e restauração
7. **Persistência**: Dados do MySQL são mantidos em PVC de 10Gi
8. **Backup**: Sistema automático de backup com timestamp

## Troubleshooting

### Build Falha
```bash
cd front_new
npm install
npm run build
```

### Container Não Inicia
```bash
docker logs [container-id]
kubectl describe pod [pod-name] -n cardapio
```

### Health Check Falha
- Verificar se o nginx está rodando
- Verificar se os arquivos foram copiados para `/usr/share/nginx/html`
- Verificar logs do nginx: `docker exec [container] tail -f /var/log/nginx/error.log`

### MySQL Não Inicia
```bash
# Verificar eventos
kubectl describe pod mysql-0 -n cardapio

# Verificar logs
kubectl logs mysql-0 -n cardapio

# Verificar PVC
kubectl describe pvc mysql-data-mysql-0 -n cardapio
```

### Backup Falha
```bash
# Verificar se MySQL está rodando
kubectl get pod mysql-0 -n cardapio

# Verificar logs
kubectl logs mysql-0 -n cardapio

# Testar conexão
kubectl exec mysql-0 -n cardapio -- mysqladmin ping -u root -p
```
