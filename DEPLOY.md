# 🚀 Deploy ScaleX para Produção

## ✅ Pré-requisitos

### Sistema Pronto para Deploy:
- ✅ Backend compilando sem erros
- ✅ Frontend buildando com sucesso
- ✅ Todas as migrations aplicadas (7 migrations)
- ✅ Docker Compose configurado
- ✅ Variáveis de ambiente documentadas

---

## 📋 Checklist de Deploy

### 1️⃣ Preparar Variáveis de Ambiente

Crie um arquivo `.env` baseado no [.env.example](.env.example):

#### Backend (NestJS):
```bash
NODE_ENV=production
PORT=3000

# Database PostgreSQL
DB_HOST=scalex-postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=SEU_PASSWORD_SEGURO_AQUI
DB_DATABASE=scalex

# Firebase Authentication (Service Account)
FIREBASE_PROJECT_ID=seu-projeto-firebase
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@seu-projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----"

# Application URLs
FRONTEND_URL=https://app.seudominio.com
BACKEND_URL=https://api.seudominio.com
```

#### Frontend (React + Vite):
```bash
# IMPORTANTE: Variáveis devem começar com VITE_

# API Backend
VITE_API_URL=https://api.seudominio.com

# Jitsi Video Call
VITE_JITSI_URL=https://meet.seudominio.com

# Firebase Web Config (credenciais públicas - OK expor)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

#### Jitsi Meet:
```bash
PUBLIC_URL=https://meet.seudominio.com
JICOFO_SECRET=$(openssl rand -hex 32)
JICOFO_PASSWORD=$(openssl rand -hex 32)
JVB_PASSWORD=$(openssl rand -hex 32)
```

---

### 2️⃣ Configurar DNS

Configure os seguintes registros DNS apontando para o IP do seu servidor:

```
A    app.seudominio.com   →  SEU_IP_SERVIDOR
A    api.seudominio.com   →  SEU_IP_SERVIDOR
A    meet.seudominio.com  →  SEU_IP_SERVIDOR
```

---

### 3️⃣ Deploy com Docker Compose

```bash
# 1. Clone o repositório no servidor
git clone <seu-repositorio>
cd scalex

# 2. Configure as variáveis de ambiente
cp .env.example .env
nano .env  # Preencha todas as variáveis

# 3. Build das imagens
docker compose build

# 4. Suba os serviços
docker compose up -d

# 5. Verifique os logs
docker compose logs -f

# 6. Execute as migrations
docker exec scalex-backend npm run migration:run
```

---

### 4️⃣ Verificar Saúde dos Serviços

```bash
# PostgreSQL
docker exec scalex-postgres pg_isready -U postgres

# Backend
curl http://localhost:3000
# Deve retornar: {"message":"ScaleX API is running!"}

# Frontend
curl http://localhost:5173
# Deve retornar HTML

# Jitsi
curl https://localhost:8443
# Deve retornar página Jitsi
```

---

### 5️⃣ Configurar SSL/HTTPS (Produção)

Para produção, use Nginx como reverse proxy com Let's Encrypt:

```nginx
# /etc/nginx/sites-available/scalex

# API Backend
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name app.seudominio.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Jitsi Meet
server {
    listen 80;
    server_name meet.seudominio.com;

    location / {
        proxy_pass https://localhost:8443;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_ssl_verify off;
    }
}
```

```bash
# Instalar Certbot e obter certificados SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.seudominio.com
sudo certbot --nginx -d app.seudominio.com
sudo certbot --nginx -d meet.seudominio.com
```

---

## 🔧 Comandos Úteis

### Logs
```bash
# Ver logs de todos os serviços
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f postgres
docker compose logs -f backend
```

### Migrations
```bash
# Ver migrations executadas
docker exec scalex-backend npm run migration:show

# Executar migrations pendentes
docker exec scalex-backend npm run migration:run

# Reverter última migration
docker exec scalex-backend npm run migration:revert
```

### Banco de Dados
```bash
# Acessar PostgreSQL
docker exec -it scalex-postgres psql -U postgres -d scalex

# Backup
docker exec scalex-postgres pg_dump -U postgres scalex > backup.sql

# Restore
cat backup.sql | docker exec -i scalex-postgres psql -U postgres scalex
```

### Restart
```bash
# Reiniciar todos os serviços
docker compose restart

# Reiniciar um serviço específico
docker compose restart backend
```

---

## 🆕 Atualizações de Código

```bash
# 1. Baixar última versão
git pull origin main

# 2. Rebuild e restart
docker compose down
docker compose build
docker compose up -d

# 3. Executar migrations (se houver)
docker exec scalex-backend npm run migration:run
```

---

## 🐛 Troubleshooting

### Backend não sobe:
```bash
# Verificar logs
docker compose logs backend

# Verificar variáveis de ambiente
docker exec scalex-backend env | grep FIREBASE
docker exec scalex-backend env | grep DB_
```

### Banco de dados não conecta:
```bash
# Verificar se PostgreSQL está rodando
docker compose ps postgres

# Verificar saúde
docker exec scalex-postgres pg_isready -U postgres

# Verificar se database existe
docker exec scalex-postgres psql -U postgres -c "\l"
```

### Jitsi não carrega:
```bash
# Verificar logs
docker compose logs jitsi-web
docker compose logs jitsi-prosody

# Verificar se portas estão abertas
sudo ufw allow 8443/tcp
sudo ufw allow 10000/udp
```

---

## 📊 Monitoramento

### Healthchecks Recomendados:

1. **Backend API**: `GET https://api.seudominio.com/`
2. **Frontend**: `GET https://app.seudominio.com/`
3. **PostgreSQL**: Verificar via docker healthcheck
4. **Jitsi**: `GET https://meet.seudominio.com/`

### Ferramentas Sugeridas:
- **UptimeRobot**: Monitoramento de uptime
- **Sentry**: Tracking de erros (backend + frontend)
- **Grafana + Prometheus**: Métricas de sistema

---

## 🔐 Segurança

### Checklist de Segurança:

- ✅ Variáveis de ambiente nunca commitadas no Git
- ✅ Firebase Service Account Key segura
- ✅ PostgreSQL password forte
- ✅ SSL/HTTPS configurado (Let's Encrypt)
- ✅ Firewall configurado (UFW)
- ✅ Apenas portas necessárias abertas
- ✅ Backup automático do banco de dados
- ✅ Rate limiting no Nginx
- ✅ CORS configurado corretamente

---

## 📦 Estrutura de Deploy

```
scalex/
├── docker-compose.yml        # Orquestração de serviços
├── .env                       # Variáveis de ambiente (NÃO commitar!)
├── .env.example              # Template de variáveis
├── back-end/
│   ├── Dockerfile            # Build do backend
│   └── src/migrations/       # Migrations do banco
├── front-end/
│   └── Dockerfile            # Build do frontend
└── jitsi-custom/             # Customizações Jitsi
```

---

## 🎯 Próximos Passos Após Deploy

1. **Testar Funcionalidades Críticas:**
   - ✅ Login com Firebase
   - ✅ Criação de usuário
   - ✅ Sistema de video call
   - ✅ Queue de espera
   - ✅ Estatísticas
   - ✅ Períodos ativos

2. **Configurar Monitoramento:**
   - Healthchecks nos endpoints
   - Alertas para downtime
   - Logs centralizados

3. **Backup Automático:**
   - Cron job para backup diário do PostgreSQL
   - Backup remoto (S3, Google Cloud Storage)

4. **Performance:**
   - Configurar cache (Redis)
   - CDN para assets estáticos
   - Otimizar queries do banco

---

## 📞 Suporte

Em caso de problemas durante o deploy:

1. Verifique os logs: `docker compose logs -f`
2. Verifique as variáveis de ambiente
3. Verifique a conectividade com o banco de dados
4. Verifique as migrations: `npm run migration:show`

---

**Status do Sistema**: ✅ Pronto para Deploy em Produção

**Última Atualização**: 29/10/2025
