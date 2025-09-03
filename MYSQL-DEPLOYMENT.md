# Deployment do MySQL StatefulSet

## Visão Geral

Este documento descreve a implementação do MySQL StatefulSet no Kubernetes, incluindo backup automático e restauração.

## Arquivos Criados

### 1. **StatefulSet**
- **Arquivo**: `k8s/mysql-statefulset.yaml`
- **Recursos**: 1 replica com volume persistente de 10Gi
- **Imagem**: `mysql:8.0`
- **Porta**: 3306
- **Health Checks**: Liveness e Readiness probes configurados

### 2. **Service**
- **Arquivo**: `k8s/mysql-service.yaml`
- **Tipo**: ClusterIP
- **Porta**: 3306
- **Seletor**: `app: mysql`

### 3. **Secret**
- **Arquivo**: `k8s/mysql-secret.yaml`
- **Dados**: Senhas do MySQL em base64
- **⚠️ IMPORTANTE**: Substitua as senhas antes de usar em produção

### 4. **ConfigMaps**
- **mysql-init-configmap.yaml**: Script de inicialização
- **mysql-backup-configmap.yaml**: Backup do banco de dados

## Configuração das Senhas

### Gerar Senhas em Base64
```bash
# Para senha root
echo -n "sua_senha_root" | base64

# Para usuário do banco
echo -n "seu_usuario" | base64

# Para senha do usuário
echo -n "sua_senha_usuario" | base64
```

### Atualizar Secret
```bash
# Editar k8s/mysql-secret.yaml
# Substituir os valores em base64 pelas suas senhas
```

## Scripts Disponíveis

### 1. **prepare-mysql-backup.sh**
Prepara o backup para o ConfigMap.

```bash
./scripts/prepare-mysql-backup.sh
```

### 2. **mysql-backup.sh**
Faz backup do banco de dados.

```bash
# Backup simples
./scripts/mysql-backup.sh

# Backup e atualizar ConfigMap
./scripts/mysql-backup.sh --force
```

### 3. **mysql-restore.sh**
Restaura o banco de dados.

```bash
# Restaurar dump.sql padrão
./scripts/mysql-restore.sh

# Restaurar arquivo específico
./scripts/mysql-restore.sh caminho/para/arquivo.sql

# Forçar restauração
./scripts/mysql-restore.sh --force
```

## Comandos de Deploy

### Deploy Completo (inclui MySQL)
```bash
./deploy.sh [versao]
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

## Verificação do Status

### Verificar Pods
```bash
kubectl get pods -n cardapio
```

### Verificar StatefulSet
```bash
kubectl get statefulset -n cardapio
```

### Verificar PVCs
```bash
kubectl get pvc -n cardapio
```

### Verificar Services
```bash
kubectl get services -n cardapio
```

## Logs e Debugging

### Logs do MySQL
```bash
kubectl logs -f mysql-0 -n cardapio
```

### Descrever Pod
```bash
kubectl describe pod mysql-0 -n cardapio
```

### Executar Comando no MySQL
```bash
kubectl exec -it mysql-0 -n cardapio -- mysql -u root -p
```

## Conectividade

### Port Forward para MySQL
```bash
kubectl port-forward service/mysql 3306:3306 -n cardapio
```

### Conectar via MySQL Client
```bash
mysql -h localhost -P 3306 -u root -p
```

## Backup e Restauração

### Estrutura de Arquivos
```
backend/backup_db/
├── dump.sql              # Backup mais recente
├── dump_20250101_120000.sql  # Backup com timestamp
└── dump_20250101_130000.sql  # Backup com timestamp
```

### Backup Automático
O backup é feito automaticamente:
- Antes de restaurações
- Quando solicitado via `--mysql-backup`
- Pode ser agendado via cron

### Restauração
- Restaura o banco completo
- Preserva dados existentes (faz backup antes)
- Pode ser forçada com `--force`

## Troubleshooting

### Pod Não Inicia
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

### Restauração Falha
```bash
# Verificar arquivo de backup
ls -la backend/backup_db/

# Verificar permissões
kubectl exec mysql-0 -n cardapio -- ls -la /docker-entrypoint-initdb.d/

# Verificar logs de inicialização
kubectl logs mysql-0 -n cardapio | grep -i "init\|restore"
```

## Monitoramento

### Health Checks
- **Liveness Probe**: `mysqladmin ping` a cada 30s
- **Readiness Probe**: `mysqladmin ping` a cada 2s

### Recursos
- **Requests**: 256Mi RAM, 250m CPU
- **Limits**: 1Gi RAM, 500m CPU

### Volumes
- **Persistente**: 10Gi para dados do MySQL
- **ConfigMap**: Scripts de inicialização e backup

## Segurança

### Secrets
- Senhas armazenadas em base64 (não é criptografia)
- Acesso restrito via RBAC
- Rotação de senhas recomendada

### Network
- Service tipo ClusterIP (não exposto externamente)
- Acesso apenas dentro do cluster
- Port forward para desenvolvimento

## Manutenção

### Atualizar Backup
```bash
./scripts/mysql-backup.sh --force
```

### Reiniciar MySQL
```bash
kubectl rollout restart statefulset/mysql -n cardapio
```

### Escalar (não recomendado para MySQL)
```bash
kubectl scale statefulset/mysql --replicas=2 -n cardapio
```

## Notas Importantes

1. **Persistência**: Dados são mantidos em PVC, sobrevivem a reinicializações
2. **Backup**: Sempre faça backup antes de operações críticas
3. **Senhas**: Troque as senhas padrão antes de usar em produção
4. **Recursos**: Ajuste limites de CPU/memória conforme necessário
5. **Backup**: O backup é incluído no ConfigMap, limitado a 1MB no Kubernetes
6. **Inicialização**: O banco é inicializado automaticamente com o backup existente
