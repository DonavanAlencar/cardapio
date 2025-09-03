# Cardápio - Sistema de Gerenciamento e Pedidos para Restaurantes

Este projeto é um sistema abrangente de gerenciamento e pedidos para restaurantes, desenvolvido para otimizar as operações diárias, desde o atendimento ao cliente até a administração interna.

## Funcionalidades Principais

O sistema abrange as seguintes áreas funcionais:

### 1. Autenticação e Gerenciamento de Usuários

*   **Login de Usuários:** Permite o acesso ao sistema através de credenciais (página de Login, rota `/auth/login`).
*   **Controle de Acesso Baseado em Papéis (RBAC):** Diferencia as permissões de usuários entre administradores e garçons.
*   **Gerenciamento de Garçons:** Funcionalidade para administrar os dados dos garçons (página `AdminGarcons`).

### 2. Administração do Restaurante (Painel Administrativo)

Esta seção permite o controle total sobre as operações do restaurante:

*   **Gestão de Equipe:**
    *   Gerenciamento de garçons (`AdminGarcons`).
    *   Acompanhamento e gestão de comissões (`AdminComissao`).
*   **Gestão de Mesas:**
    *   Administração das mesas do restaurante (`AdminMesas`, rota `/mesas`).
*   **Gestão de Produtos e Estoque:**
    *   Cadastro e gerenciamento de produtos (`AdminProdutos`, rota `/produtos`).
    *   Organização de produtos por categorias (`AdminProductCategories`, rota `/productCategories`).
    *   Definição e aplicação de modificadores de produtos (ex: adicionais, remoções) (`AdminProductModifiers`, rota `/productModifiers`).
    *   Controle de ingredientes (`AdminIngredients`, rota `/ingredients`).
    *   Registro e acompanhamento de movimentações de estoque (`AdminStockMovements`, rota `/stockMovements`).
*   **Configuração de Pedidos e Pagamentos:**
    *   Gerenciamento de métodos de pagamento (`/paymentMethods`).
    *   Configurações gerais do sistema (`/configuracoes`).
*   **Relatórios:**
    *   Geração de diversos relatórios para análise de desempenho (`AdminReports`, rota `/reports`).

### 3. Operações do Garçom

Ferramentas dedicadas para a equipe de atendimento (disponível apenas no front-new):

*   **Visualização e Gestão de Mesas:** Permite ao garçom ver o status das mesas e gerenciá-las.
*   **Registro e Gestão de Pedidos:** Funcionalidade para registrar e acompanhar os pedidos dos clientes.
*   **Consulta de Comissões:** Garçons podem verificar suas próprias comissões.

### 4. Menu para Clientes

*   **Cardápio Digital:** Exibição do cardápio do restaurante para os clientes (`Cardapio`).

### 5. Serviços de Backend

O backend fornece a infraestrutura para todas as funcionalidades:

*   **APIs RESTful:** Endpoints para todas as operações (ex: `/orders`, `/payments`, `/branches`).
*   **Conectividade com Banco de Dados:** Gerenciamento da conexão com o banco de dados (`db.js`).
*   **Sistema de Logs:** Registro de eventos e erros para monitoramento (`logger.js`).

## Tecnologias Utilizadas (Inferidas)

*   **Frontend:** React, React Router DOM, Tailwind CSS, Framer Motion.
*   **Backend:** Node.js, Express.js, JWT (JSON Web Tokens) para autenticação.
*   **Banco de Dados:** (Não especificado explicitamente, mas implícito pelas rotas do backend e `db.js`).

## Como Iniciar

Para configurar e executar o projeto localmente, siga as instruções nos diretórios `frontend` e `backend`.

## 🆕 Front-new (Nova Versão)

O projeto inclui uma nova versão do frontend (`front_new`) desenvolvida com Vite + React, que oferece:

- **Performance otimizada** com Vite
- **Interface moderna** com Material-UI
- **Roteamento avançado** com React Router
- **Componentes reutilizáveis** e bem estruturados
- **Deploy independente** no Kubernetes

### Acesso ao Front-new
- **URL**: https://food.546digitalservices.com/new
- **Porta interna**: 5173
- **Tecnologia**: Vite + React + Material-UI

### Deploy do Front-new
```bash
# Deploy completo (build + deploy)
./scripts/deploy-front-new-complete.sh [registry] [tag]

# Exemplo
./scripts/deploy-front-new-complete.sh donavanalencar 1.0
```

Para mais detalhes sobre o deploy, consulte [DEPLOY-FRONT-NEW.md](DEPLOY-FRONT-NEW.md).

## 🧹 Limpeza do Projeto (Atualizado)

**Arquivos removidos para otimização:**

### Scripts de teste removidos:
- `test-apis.js`
- `test-dashboard-dynamic.js` 
- `test-login-system.js`
- `test-reservations.js`

### Scripts antigos de deploy removidos:
- `cleanup-old-scripts.sh`
- `scripts/deploy-k8s.sh`
- `scripts/build-frontend.sh`
- `scripts/build-and-push.sh`
- `scripts/build-and-push-frontend.sh`
- `scripts/setup-registry.sh`
- `scripts/test-local.sh`
- `scripts/debug.sh`
- `scripts/restart.sh`
- `scripts/rollback.sh`
- `scripts/cleanup.sh`

### Arquivos Kubernetes obsoletos removidos:
- `k8s/frontend-deployment.yaml`
- `k8s/frontend-service.yaml`
- `k8s/frontend-configmap.yaml`
- `k8s/ingress_old.yaml`
- `k8s/kustomization.yaml`
- `k8s/front-new-kustomization.yaml`
- Arquivos com sufixo `-fixed` (versões duplicadas)
- Configurações antigas do Traefik

### Outros arquivos removidos:
- `docker-compose.example.yml`
- `package-lock.json` (vazio)
- `k8s/create-basic-tables.sql`
- Diretório `scripts/old-scripts-20250812-015918/`

**Scripts ativos mantidos:**
- `deploy.sh` (script principal - **LEGADO**)
- `scripts/deploy-complete-automated.sh` ✨ **PRINCIPAL - Deploy completo automatizado com todas as opções**
- `scripts/deploy-front-new-complete.sh`
- `scripts/deploy-front-new-k8s.sh`
- `scripts/build-and-push-front-new.sh`
- `scripts/mysql-backup.sh`
- `scripts/mysql-restore.sh`
- `scripts/prepare-mysql-backup.sh`

**⚠️ Recomendação:** Use `scripts/deploy-complete-automated.sh` como script principal. O `deploy.sh` é mantido apenas para compatibilidade.

## 🚀 Implantação em Produção com Traefik e Let's Encrypt

### Pré-requisitos

- Cluster Kubernetes funcionando
- Helm instalado
- kubectl configurado
- Domínio configurado (ex: `food.546digitalservices.com`)

### 1. Configuração do Traefik com Let's Encrypt

#### 1.1 Criar arquivo de valores Helm

Crie o arquivo `k8s/traefik-final-values.yaml`:

```yaml
# Traefik Helm Values para Let's Encrypt
ports:
  web:
    port: 80
    expose:
      enabled: true
      exposedPort: 80
    protocol: TCP
  websecure:
    port: 443
    expose:
      enabled: true
      exposedPort: 443
    protocol: TCP
    tls:
      enabled: true

providers:
  kubernetesCRD:
    enabled: true
  kubernetesIngress:
    enabled: true
    allowExternalNameServices: true

certificatesResolvers:
  le:
    acme:
      email: SEU_EMAIL_AQUI@exemplo.com  # ⚠️ ALTERAR PARA SEU EMAIL REAL
      storage: /data/acme.json
      httpChallenge:
        entryPoint: web

logs:
  general:
    level: INFO
  access:
    enabled: true
  file:
    enabled: true

dashboard:
  enabled: true
  service:
    type: ClusterIP
  ingress:
    enabled: false

persistence:
  enabled: true
  size: 128Mi
  storageClass: ""
  accessMode: ReadWriteOnce
  path: /data
```

#### 1.2 Instalar/Atualizar Traefik

```bash
# Adicionar repositório Helm
helm repo add traefik https://traefik.github.io/charts
helm repo update

# Instalar/Atualizar Traefik
helm upgrade traefik traefik/traefik \
  --namespace kube-system \
  --values k8s/traefik-final-values.yaml \
  --wait \
  --timeout 5m
```

### 2. Configuração do Ingress

#### 2.1 Configurar ingress com suporte a Let's Encrypt

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: cardapio-ingress
  namespace: cardapio
  annotations:
    kubernetes.io/ingress.class: traefik
    traefik.ingress.kubernetes.io/router.entrypoints: web,websecure
    traefik.ingress.kubernetes.io/router.tls: "true"
    traefik.ingress.kubernetes.io/router.tls.certresolver: le
    traefik.ingress.kubernetes.io/router.tls.options: "default"
spec:
  ingressClassName: traefik
  tls:
    - hosts:
        - food.546digitalservices.com
  rules:
    - host: food.546digitalservices.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: cardapio-frontend-service
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: cardapio-backend-service
                port:
                  number: 80
          - path: /new
            pathType: Prefix
            backend:
              service:
                name: cardapio-front-new-service
                port:
                  number: 80
```

#### 2.2 Aplicar o ingress

```bash
kubectl apply -f k8s/ingress.yaml
```

### 3. Verificação da Instalação

#### 3.1 Verificar status do Traefik

```bash
# Verificar pods
kubectl get pods -n kube-system -l app.kubernetes.io/name=traefik

# Verificar serviços
kubectl get svc -n kube-system -l app.kubernetes.io/name=traefik

# Verificar ingress
kubectl get ingress -n cardapio
```

#### 3.2 Monitorar logs do Let's Encrypt

```bash
# Obter nome do pod do Traefik
POD_NAME=$(kubectl get pods -n kube-system -l app.kubernetes.io/name=traefik -o jsonpath='{.items[0].metadata.name}')

# Monitorar logs para certificados
kubectl logs -f -n kube-system $POD_NAME | grep -i acme
```

#### 3.3 Testar o domínio

```bash
# Testar HTTP (deve redirecionar para HTTPS)
curl -I http://food.546digitalservices.com

# Testar HTTPS (deve funcionar com certificado válido)
curl -I https://food.546digitalservices.com
```

### 4. Solução de Problemas

#### 4.1 Certificado não sendo solicitado

- Verificar se o resolver `le` está configurado no Traefik
- Verificar se o ingress está usando `certresolver: le`
- Verificar logs do Traefik para erros ACME

#### 4.2 Erro 404 no desafio ACME

- Verificar se o ingress permite acesso HTTP ao endpoint `.well-known/acme-challenge`
- Verificar se os serviços estão rodando e acessíveis

#### 4.3 Problemas de permissões

- Verificar se o Traefik tem permissões para criar secrets
- Verificar se o namespace tem as permissões necessárias

### 5. Manutenção

#### 5.1 Atualizar Traefik

```bash
helm repo update
helm upgrade traefik traefik/traefik \
  --namespace kube-system \
  --values k8s/traefik-final-values.yaml
```

#### 5.2 Backup de certificados

Os certificados são armazenados em `/data/acme.json` no pod do Traefik. Para backup:

```bash
kubectl cp kube-system/traefik-<pod-name>:/data/acme.json ./acme-backup.json
```

---

## 🔄 Sistema MySQL Automatizado (Configuração de Produção)

### Configuração Automatizada Implementada

O sistema agora possui configuração totalmente automatizada do MySQL com backup automático:

#### ✅ Componentes Configurados:

1. **MySQL StatefulSet Automatizado** (`mysql-with-backup`)
   - Backup automático no startup
   - Volume persistente para dados
   - Volume ConfigMap para backup (`/cardapio/backend/backup_db/`)
   - Hook postStart para importação automática

2. **Secrets e ConfigMaps**
   - `mysql-pass-fixed`: Senhas do MySQL
   - `mysql-backup-current`: Backup atual do banco
   - `mysql-auto-init`: Script de inicialização automática

3. **Backend Automatizado** (`cardapio-backend-fixed`)
   - Configuração automática de conexão
   - Variáveis de ambiente corretas
   - Service discovery configurado

#### 🚀 Deploy Automatizado Completo

Para fazer deploy do zero com configuração automatizada:

```bash
# Deploy completo automatizado
./scripts/deploy-complete-automated.sh donavanalencar 3.0

# Deploy com correção de CSS
./scripts/deploy-complete-automated.sh donavanalencar 3.0 --fix-css

# Deploy apenas do frontend
./scripts/deploy-complete-automated.sh donavanalencar 3.0 --frontend-only

# Deploy apenas do backend
./scripts/deploy-complete-automated.sh donavanalencar 3.0 --backend-only

# Deploy apenas do MySQL
./scripts/deploy-complete-automated.sh donavanalencar 3.0 --mysql-only

# Backup do MySQL
./scripts/deploy-complete-automated.sh donavanalencar 3.0 --mysql-backup

# Restaurar MySQL
./scripts/deploy-complete-automated.sh donavanalencar 3.0 --mysql-restore
```

#### 🎛️ Opções do Script

**Parâmetros:**
- `[registry-url]` - URL do registry Docker (padrão: `donavanalencar`)
- `[tag]` - Tag da imagem (padrão: `3.0`)

**Flags disponíveis:**
- `--fix-css` - Corrige problemas de CSS no frontend antes do build
- `--frontend-only` - Deploy apenas do frontend
- `--backend-only` - Deploy apenas do backend
- `--mysql-only` - Deploy apenas do MySQL
- `--mysql-backup` - Faz backup do MySQL atual
- `--mysql-restore` - Restaura MySQL do backup
- `--mysql-resize=<TAMANHO>` - Redimensiona o PVC do MySQL (recriação controlada). Ex.: `--mysql-resize=20Gi`

**Exemplos de uso:**
```bash
# Deploy completo com versão específica
./scripts/deploy-complete-automated.sh donavanalencar 2.5

# Deploy apenas frontend com correção de CSS
./scripts/deploy-complete-automated.sh donavanalencar 3.0 --frontend-only --fix-css

# Backup do banco atual
./scripts/deploy-complete-automated.sh donavanalencar 3.0 --mysql-backup

# Redimensionar PVC do MySQL para 20Gi (com backup automático e recriação controlada)
./scripts/deploy-complete-automated.sh donavanalencar 3.0 --mysql-resize=20Gi
```

#### 📋 Credenciais de Sistema

**Usuários de Login:**
- **Admin:** `admin@empresa.com` / `password`
- **Garçom:** `garcom@empresa.com` / `password`

**MySQL:**
- **Root:** `root` / `newrootpassword`
- **User:** `cardapio` / `cardapiopass`

#### 🔧 Verificação do Sistema

```bash
# Verificar status dos pods
kubectl get pods -n cardapio

# Verificar banco de dados
kubectl exec -n cardapio mysql-with-backup-0 -- mysql -u root -pnewrootpassword -e "SHOW DATABASES;"

# Testar API
curl -k https://food.546digitalservices.com/api/auth/test-db

# Testar login
curl -k -X POST https://food.546digitalservices.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com","password":"password"}'
```

#### 🛠️ Configuração Técnica

**Automação do Backup:**
- O sistema verifica automaticamente se o banco possui tabelas
- Se não houver tabelas, importa o backup automaticamente
- Hook postStart garante importação mesmo após reinicializações
- Volume ConfigMap mantém o backup sempre disponível

**Fluxo de Inicialização:**
1. MySQL sobe com volumes configurados
2. PostStart hook aguarda MySQL estar pronto
3. Verifica se existem tabelas no banco `cardapio`
4. Se não existir, executa importação do dump.sql
5. Sistema fica pronto para uso

**Arquivos de Configuração:**
- `/cardapio/backend/backup_db/dump.sql` - Backup principal
- `/docker-entrypoint-initdb.d/init.sql` - Script de inicialização
- Variáveis de ambiente configuradas automaticamente

#### 🔄 Manutenção

**Backup Manual:**
```bash
# Criar backup atual
kubectl exec -n cardapio mysql-with-backup-0 -- mysqldump -u root -pnewrootpassword cardapio > backup_$(date +%Y%m%d).sql

# Atualizar ConfigMap com novo backup
kubectl create configmap mysql-backup-current -n cardapio --from-file=dump.sql=backup_$(date +%Y%m%d).sql -o yaml --dry-run=client | kubectl apply -f -
```

**Logs de Verificação:**
```bash
# Logs do MySQL (verificar importação)
kubectl logs -n cardapio mysql-with-backup-0 --tail=100

# Logs do backend (verificar conexão)
kubectl logs -n cardapio -l app=cardapio-backend-fixed --tail=50
```

#### 🌐 URLs de Acesso

- **Sistema Principal:** https://food.546digitalservices.com
- **Front-new:** https://food.546digitalservices.com/new  
- **API:** https://food.546digitalservices.com/api
- **WebSocket:** wss://food.546digitalservices.com/socket.io

#### ⚠️ Considerações de Produção

- Backup automático garante integridade dos dados
- Sistema tolera reinicializações sem perda de dados
- Configuração de secrets isolada e segura
- Volume persistente garante durabilidade
- Logs detalhados para troubleshooting

---

**Última atualização:** Setembro 2025 - Sistema MySQL Automatizado Implementado

**Nota:** Este README foi gerado automaticamente com base na estrutura do projeto e nos nomes dos arquivos/componentes. Para detalhes mais específicos, consulte a documentação interna ou o código-fonte de cada módulo.