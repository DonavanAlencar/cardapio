# 🚀 Setup e Configuração do Sistema de Cardápio

## 📋 Pré-requisitos

### Sistema Operacional
- **Linux** (Ubuntu 18.04+ / CentOS 7+)
- **Windows** (10+ com WSL2)
- **macOS** (10.14+)

### Software Necessário
- **Node.js** 16.x ou superior
- **npm** 8.x ou superior
- **MySQL** 8.0 ou superior
- **Git** para controle de versão

## 🔧 Instalação das Dependências

### 1. Node.js e npm
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# macOS (com Homebrew)
brew install node

# Windows
# Baixe o instalador do site oficial: https://nodejs.org/
```

### 2. MySQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# CentOS/RHEL
sudo yum install mysql-server

# macOS
brew install mysql

# Windows
# Baixe o instalador do site oficial: https://dev.mysql.com/
```

### 3. Git
```bash
# Ubuntu/Debian
sudo apt install git

# CentOS/RHEL
sudo yum install git

# macOS
brew install git

# Windows
# Baixe o instalador do site oficial: https://git-scm.com/
```

## 🗄️ Configuração do Banco de Dados

### 1. Iniciar MySQL
```bash
# Ubuntu/Debian
sudo systemctl start mysql
sudo systemctl enable mysql

# CentOS/RHEL
sudo systemctl start mysqld
sudo systemctl enable mysqld

# macOS
brew services start mysql

# Windows
# Inicie o serviço MySQL
```

### 2. Configurar Segurança
```bash
sudo mysql_secure_installation
```

### 3. Criar Banco e Usuário
```sql
-- Conectar como root
mysql -u root -p

-- Criar banco de dados
CREATE DATABASE cardapio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário
CREATE USER 'cardapio_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';

-- Conceder privilégios
GRANT ALL PRIVILEGES ON cardapio_db.* TO 'cardapio_user'@'localhost';
FLUSH PRIVILEGES;

-- Sair
EXIT;
```

### 4. Importar Schema
```bash
# Navegar para o diretório do projeto
cd /home/donavan/cardapio

# Importar schema (se existir arquivo .sql)
mysql -u cardapio_user -p cardapio_db < schema.sql

# Ou executar as queries manualmente
mysql -u cardapio_user -p cardapio_db
```

## 📁 Estrutura do Projeto

```
cardapio/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── routes/         # Endpoints da API
│   │   ├── middleware/     # Autenticação e validação
│   │   └── config/         # Configurações
│   ├── package.json
│   └── .env
├── front_new/              # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços de API
│   │   ├── hooks/          # Hooks personalizados
│   │   └── styles/         # Arquivos CSS
│   ├── package.json
│   └── .env
└── docs/                   # Documentação
```

## ⚙️ Configuração do Backend

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Criar arquivo .env
cp .env.example .env

# Editar .env com suas configurações
nano .env
```

#### Conteúdo do .env
```env
# Configurações do Servidor
PORT=4000
NODE_ENV=development

# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=cardapio_user
DB_PASSWORD=sua_senha_segura
DB_NAME=cardapio_db

# Configurações de JWT
JWT_SECRET=sua_chave_secreta_muito_segura
JWT_EXPIRES_IN=24h

# Configurações de CORS
CORS_ORIGIN=http://localhost:3000

# Configurações de Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 3. Verificar Configuração do Banco
```bash
# Testar conexão
npm run test:db

# Se houver erro, verificar:
# - MySQL está rodando
# - Credenciais estão corretas
# - Banco existe
# - Usuário tem permissões
```

### 4. Inicializar Banco (se necessário)
```bash
# Criar tabelas
npm run db:init

# Inserir dados de exemplo
npm run db:seed
```

## ⚙️ Configuração do Frontend

### 1. Instalar Dependências
```bash
cd front_new
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Criar arquivo .env
cp .env.example .env

# Editar .env com suas configurações
nano .env
```

#### Conteúdo do .env
```env
# URL da API Backend
REACT_APP_API_URL=http://localhost:4000/api

# Configurações da Aplicação
REACT_APP_NAME=Cardápio Digital
REACT_APP_VERSION=1.0.0

# Configurações de Desenvolvimento
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug
```

## 🚀 Executando o Sistema

### 1. Iniciar Backend
```bash
cd backend

# Desenvolvimento
npm run dev

# Produção
npm start

# Com nodemon (recomendado para desenvolvimento)
npm run dev:watch
```

### 2. Iniciar Frontend
```bash
cd front_new

# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview da build
npm run preview
```

### 3. Verificar Status
```bash
# Backend
curl http://localhost:4000/health

# Frontend
curl http://localhost:3000
```

## 🔐 Configuração de Autenticação

### 1. Criar Usuário Admin
```bash
# Via API (se endpoint existir)
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Administrador",
    "email": "admin@cardapio.com",
    "password": "senha123",
    "role": "admin"
  }'

# Ou via banco de dados
mysql -u cardapio_user -p cardapio_db
```

```sql
INSERT INTO users (name, email, password, role, created_at, updated_at) 
VALUES (
  'Administrador',
  'admin@cardapio.com',
  '$2b$10$...', -- Hash bcrypt da senha
  'admin',
  NOW(),
  NOW()
);
```

### 2. Testar Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cardapio.com",
    "password": "senha123"
  }'
```

## 🧪 Testes e Validação

### 1. Testes do Backend
```bash
cd backend

# Testes unitários
npm test

# Testes de integração
npm run test:integration

# Testes de API
npm run test:api
```

### 2. Testes do Frontend
```bash
cd front_new

# Testes unitários
npm test

# Testes de componentes
npm run test:components

# Testes E2E (se configurado)
npm run test:e2e
```

### 3. Validação de Funcionalidades
- [ ] Login funciona
- [ ] Lista de produtos carrega
- [ ] Criação de produto funciona
- [ ] Edição de produto funciona
- [ ] Deleção de produto funciona
- [ ] Filtros funcionam
- [ ] Busca funciona
- [ ] Responsividade funciona

## 🐛 Solução de Problemas Comuns

### Backend não inicia
```bash
# Verificar porta
netstat -tulpn | grep :4000

# Verificar logs
tail -f backend/logs/app.log

# Verificar dependências
npm list --depth=0
```

### Frontend não carrega
```bash
# Verificar porta
netstat -tulpn | grep :3000

# Verificar build
npm run build

# Verificar dependências
npm list --depth=0
```

### Erro de conexão com banco
```bash
# Verificar MySQL
sudo systemctl status mysql

# Testar conexão
mysql -u cardapio_user -p -h localhost

# Verificar configurações
cat backend/.env
```

### CORS errors
```bash
# Verificar configuração CORS no backend
# Verificar URL no frontend .env
# Verificar se backend está rodando
```

## 📊 Monitoramento

### 1. Logs do Sistema
```bash
# Backend logs
tail -f backend/logs/app.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log

# System logs
sudo journalctl -u mysql -f
```

### 2. Métricas de Performance
```bash
# CPU e memória
htop

# Disco
df -h

# Rede
netstat -i
```

### 3. Status dos Serviços
```bash
# Backend
curl http://localhost:4000/health

# MySQL
sudo systemctl status mysql

# Frontend
curl http://localhost:3000
```

## 🔄 Atualizações

### 1. Atualizar Código
```bash
git pull origin main
```

### 2. Atualizar Dependências
```bash
# Backend
cd backend
npm update

# Frontend
cd front_new
npm update
```

### 3. Rebuild e Restart
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd front_new
npm run build
npm run preview
```

## 🚀 Deploy em Produção

### 1. Configurações de Produção
```env
NODE_ENV=production
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=cardapio_user
DB_PASSWORD=senha_producao_segura
DB_NAME=cardapio_db
JWT_SECRET=chave_producao_muito_segura
CORS_ORIGIN=https://seudominio.com
```

### 2. Process Manager (PM2)
```bash
# Instalar PM2
npm install -g pm2

# Configurar PM2
pm2 start backend/src/app.js --name "cardapio-backend"
pm2 start front_new/dist --name "cardapio-frontend"

# Configurar startup automático
pm2 startup
pm2 save
```

### 3. Nginx (Reverso Proxy)
```nginx
server {
    listen 80;
    server_name seudominio.com;

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📚 Recursos Adicionais

### Documentação
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://reactjs.org/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

### Ferramentas Úteis
- **Postman**: Testar APIs
- **MySQL Workbench**: Gerenciar banco
- **VS Code**: Editor recomendado
- **Docker**: Containerização (opcional)

### Comunidade
- Stack Overflow
- GitHub Issues
- Fóruns de desenvolvimento
- Grupos de usuários

---

**🎯 Próximo Passo**: Após completar o setup, acesse `http://localhost:3000` e faça login com as credenciais de admin para começar a usar o sistema!
