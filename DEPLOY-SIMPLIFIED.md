# 🚀 Deploy Simplificado - Ferramentas Modernas

## 🎯 Opções Mais Simples (1-Click Deploy)

---

## ⭐ **Opção 1: Coolify (RECOMENDADO)**

### O que é?
**Coolify** é um "Heroku self-hosted" - você instala em um servidor e faz deploy de tudo através de uma interface web.

### 💰 Custo
```
Servidor (Hetzner ou Digital Ocean): $7-12/mês
Total: $7-12/mês (TUDO incluído!)
```

### ✨ Vantagens
- ✅ Interface web bonita (tipo Vercel/Netlify)
- ✅ Deploy automático via Git push
- ✅ SSL automático (Let's Encrypt)
- ✅ Banco de dados com 1 clique
- ✅ Backups automáticos
- ✅ Monitoramento incluído
- ✅ Docker Compose nativo
- ✅ **Suporta Jitsi out-of-the-box**

### 📖 Como Funciona

#### Passo 1: Instalar Coolify

```bash
# Em qualquer servidor Ubuntu (Digital Ocean, Hetzner, AWS, etc)
ssh root@SEU_IP

# Instale com 1 comando
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# Acesse: http://SEU_IP:8000
# Configure senha de admin
```

#### Passo 2: Adicionar Projeto

1. **No Coolify Dashboard:**
   - New Project → "ScaleX"
   - Add Resource → Git Repository
   - Cole URL: `https://github.com/SEU_USUARIO/scalex`
   - Branch: `main`

2. **Configure Backend:**
   - Dockerfile path: `back-end/Dockerfile`
   - Port: `3000`
   - Environment Variables: (adicione via UI)
     ```
     NODE_ENV=production
     DB_HOST=scalex-postgres
     DB_PORT=5432
     DB_USERNAME=scalex_user
     DB_PASSWORD=<gerado automaticamente>
     ```

3. **Adicione PostgreSQL:**
   - Add Resource → Database → PostgreSQL 15
   - Nome: `scalex-postgres`
   - Coolify cria automaticamente!

4. **Configure Frontend:**
   - Add Resource → Static Site
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Base Directory: `front-end`

5. **Adicione Jitsi:**
   - Add Resource → Docker Compose
   - Cole seu `docker-compose.yml`
   - Deploy!

#### Passo 3: Deploy Automático

```bash
# Configure webhook no GitHub
# Settings → Webhooks → Add webhook
# URL: https://SEU_IP:8000/api/v1/deploy/WEBHOOK_ID
# Content type: application/json
# Events: Just the push event

# Agora todo git push faz deploy automático! 🚀
```

### 📊 Arquitetura com Coolify

```
┌────────────────────────────────────────────┐
│         Coolify Dashboard                   │
│         https://SEU_IP:8000                │
└────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   ┌────▼────┐            ┌────▼────┐
   │ Traefik │            │ Docker  │
   │ (Proxy) │            │ Engine  │
   └────┬────┘            └────┬────┘
        │                      │
   Auto SSL              ┌─────┴──────┬──────────┐
   Auto DNS              │            │          │
        │          ┌─────▼─────┐ ┌───▼───┐ ┌───▼───┐
        └─────────►│  Backend  │ │Postgres│ │ Jitsi │
                   │  (NestJS) │ │   DB   │ │ Stack │
                   └───────────┘ └────────┘ └───────┘
```

### 🎥 Exemplo Real de docker-compose.yml para Coolify

```yaml
version: '3.8'

services:
  backend:
    build: ./back-end
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=scalex
    depends_on:
      - postgres
    labels:
      - "coolify.managed=true"
      - "coolify.type=application"

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${DB_USERNAME}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=scalex
    volumes:
      - postgres_data:/var/lib/postgresql/data
    labels:
      - "coolify.managed=true"
      - "coolify.type=database"

  frontend:
    build:
      context: ./front-end
      dockerfile: Dockerfile.production
    labels:
      - "coolify.managed=true"
      - "coolify.type=static"

volumes:
  postgres_data:
```

---

## 🟣 **Opção 2: Railway.app**

### O que é?
Plataforma moderna tipo Heroku, mas melhor e mais barata.

### 💰 Custo
```
Hobby Plan: $5/mês (crédito) + uso
Backend (512MB): ~$5/mês
PostgreSQL: ~$5/mês
Frontend: GRÁTIS (via Vercel)
Total: ~$10-15/mês
```

### 🚀 Deploy em 5 Minutos

#### Setup Completo

```bash
# 1. Instale Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Inicie projeto
cd scalex
railway init

# 4. Configure backend
cd back-end
railway up

# 5. Adicione PostgreSQL
railway add postgresql

# 6. Configure variáveis (interface web)
# https://railway.app → Seu Projeto → Variables
# Railway já configurou DB_HOST, DB_PASSWORD automaticamente!

# 7. Deploy frontend no Vercel (grátis)
cd ../front-end
npm i -g vercel
vercel --prod
```

### 📋 Criar railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Configurar Jitsi (Droplet separado)

Para Jitsi, ainda use um droplet barato:
```
Railway: Backend + DB ($10-15/mês)
+
Hetzner: Jitsi (€4.50/mês = ~$5/mês)
────────────────────────────────
Total: $15-20/mês
```

---

## 🔵 **Opção 3: Render.com**

### O que é?
Similar ao Railway, interface simples e preços bons.

### 💰 Custo
```
Web Service: $7/mês
PostgreSQL: $7/mês
Static Site: GRÁTIS
Total: $14/mês
```

### 🚀 Deploy Blueprint (1 arquivo!)

Crie `render.yaml` na raiz do projeto:

```yaml
services:
  # Backend
  - type: web
    name: scalex-backend
    env: node
    region: oregon
    plan: starter
    buildCommand: cd back-end && npm install && npm run build
    startCommand: cd back-end && npm run start:prod
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: scalex-db
          property: connectionString
    autoDeploy: true

  # Frontend
  - type: web
    name: scalex-frontend
    env: static
    buildCommand: cd front-end && npm install && npm run build
    staticPublishPath: front-end/dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html

databases:
  # PostgreSQL
  - name: scalex-db
    databaseName: scalex
    plan: starter
    region: oregon
```

**Deploy:**
```bash
# 1. Conecte repositório GitHub ao Render
# 2. New Blueprint → Selecione repo
# 3. Deploy! 🚀

# Render detecta render.yaml e configura TUDO automaticamente!
```

---

## 🟢 **Opção 4: Dokploy (Open Source como Coolify)**

### O que é?
Alternativa open-source ao Coolify, muito similar ao Vercel.

### 💰 Custo
```
Servidor VPS: $5-12/mês
Total: $5-12/mês
```

### 🚀 Instalação

```bash
# Instale em qualquer VPS
curl -sSL https://dokploy.com/install.sh | sh

# Acesse UI: http://SEU_IP:3000
# Similar ao Coolify, mas com foco em simplicidade
```

---

## 🟡 **Opção 5: CapRover (Self-Hosted PaaS)**

### O que é?
PaaS self-hosted com 1-click apps (inclui PostgreSQL, Redis, etc).

### 💰 Custo
```
VPS mínimo: $5/mês (Hetzner)
Total: $5-12/mês
```

### 🚀 Setup

```bash
# 1. Instale em VPS
ssh root@SEU_IP
docker run -p 80:80 -p 443:443 -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /captain:/captain \
  caprover/caprover

# 2. Configure domínio
caprover serversetup

# 3. Faça deploy via CLI
npm install -g caprover
caprover deploy
```

**captain-definition:**
```json
{
  "schemaVersion": 2,
  "dockerfileLines": [
    "FROM node:20-alpine",
    "WORKDIR /app",
    "COPY ./back-end/package*.json ./",
    "RUN npm ci",
    "COPY ./back-end ./ ",
    "RUN npm run build",
    "CMD [\"npm\", \"run\", \"start:prod\"]"
  ]
}
```

---

## 📊 Comparação de Ferramentas

| Ferramenta | Custo/mês | Facilidade | Auto-Deploy | Jitsi Support | Database |
|------------|-----------|------------|-------------|---------------|----------|
| **Coolify** | **$7-12** | ⭐⭐⭐⭐⭐ | ✅ Git Push | ✅ Docker Compose | ✅ 1-Click |
| **Railway** | $10-15 | ⭐⭐⭐⭐⭐ | ✅ Git Push | ⚠️ Separado | ✅ 1-Click |
| **Render** | $14 | ⭐⭐⭐⭐ | ✅ Git Push | ⚠️ Separado | ✅ 1-Click |
| **Dokploy** | $5-12 | ⭐⭐⭐⭐ | ✅ Git Push | ✅ Docker Compose | ✅ 1-Click |
| **CapRover** | $5-12 | ⭐⭐⭐ | ✅ CLI | ⚠️ Manual | ✅ 1-Click |
| **Manual DO** | $41-56 | ⭐⭐ | ❌ Manual | ✅ Full Control | ⚠️ Manual |

---

## 🏆 **RECOMENDAÇÃO FINAL**

### Para Máxima Simplicidade + Menor Custo:

```
🥇 Coolify em Hetzner VPS
   └─ $7/mês (4GB RAM, 2 vCPU)
   └─ Backend + PostgreSQL + Jitsi + Frontend
   └─ Deploy via Git Push
   └─ Interface web linda
   └─ TUDO em 1 servidor
```

### Para Melhor Developer Experience:

```
🥈 Railway + Vercel
   └─ Backend + DB: Railway ($10-15/mês)
   └─ Frontend: Vercel (GRÁTIS)
   └─ Jitsi: Hetzner ($5/mês)
   └─ Total: $15-20/mês
   └─ Git push = deploy automático
   └─ Logs em tempo real
```

### Para Crescimento Futuro:

```
🥉 Render
   └─ $14/mês (backend + db)
   └─ Frontend grátis
   └─ Fácil escalar depois
   └─ Blueprint = infraestrutura como código
```

---

## 🚀 Guia Rápido: Deploy com Coolify

### Passo a Passo Completo

#### 1. Crie VPS na Hetzner (mais barato)

```
Vá em: https://hetzner.com
Server: CPX21 (€7.59/mês = ~$8/mês)
- 4GB RAM
- 2 vCPU
- 80GB SSD
- 20TB traffic
```

#### 2. Instale Coolify

```bash
# SSH no servidor
ssh root@SEU_IP

# Instale Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# Aguarde 2-3 minutos
```

#### 3. Configure via Browser

```
Acesse: http://SEU_IP:8000
- Crie conta admin
- Configure domínio (opcional)
- Ative SSL automático
```

#### 4. Adicione Projeto ScaleX

**Backend:**
1. Resources → New → Application
2. Git Repository: `https://github.com/SEU_USER/scalex`
3. Build Pack: Dockerfile
4. Dockerfile Location: `back-end/Dockerfile`
5. Port: `3000`
6. Deploy!

**PostgreSQL:**
1. Resources → New → Database → PostgreSQL
2. Nome: `scalex-db`
3. Versão: `15`
4. Start!

**Frontend:**
1. Resources → New → Application
2. Build Pack: Node.js
3. Base Directory: `front-end`
4. Install Command: `npm install`
5. Build Command: `npm run build`
6. Publish Directory: `dist`
7. Deploy!

**Jitsi:**
1. Resources → New → Docker Compose
2. Cole seu docker-compose.yml
3. Coolify gerencia tudo!

#### 5. Configure Domínios

```
Na interface do Coolify:
- Frontend: app.seudominio.com
- Backend: api.seudominio.com
- Jitsi: meet.seudominio.com

No seu DNS provider:
A  app   → SEU_IP
A  api   → SEU_IP
A  meet  → SEU_IP

Coolify configura SSL automaticamente!
```

### 🎉 Pronto!

```bash
# Todo git push agora faz deploy automático:
git add .
git commit -m "Nova feature"
git push origin main

# Coolify detecta, faz build e deploy! 🚀
```

---

## 📋 Criar Dockerfiles Simples

### back-end/Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### front-end/Dockerfile

```dockerfile
FROM node:20-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

### front-end/nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 💡 Dicas de Economia

### Hetzner vs Digital Ocean

```
Digital Ocean Droplet 4GB: $24/mês
Hetzner CPX21 (4GB):      €7.59/mês (~$8/mês)
────────────────────────────────────────────
Economia: $16/mês = $192/ano! 💰
```

### Railway Free Tier

```
Railway oferece $5/mês de crédito GRÁTIS
Suficiente para:
- Backend pequeno
- PostgreSQL com pouco uso
- Perfeito para testes!
```

---

## ❓ FAQ

**P: Coolify é confiável para produção?**
R: Sim! Usado por milhares de empresas. Código open-source auditável.

**P: E se o servidor cair?**
R: Configure backups automáticos no Coolify (1 clique). Coolify também oferece multi-server.

**P: Consigo migrar depois?**
R: Sim! Tudo é Docker, fácil migrar para qualquer cloud.

**P: E updates de segurança?**
R: Coolify atualiza automaticamente. Você só atualiza sua app.

---

## 🎯 Próximos Passos

1. **Experimente Coolify** em um VPS de $5/mês
2. Faça deploy de teste do ScaleX
3. Se gostar, use em produção
4. Escale quando necessário (Coolify suporta multi-server)

**Links Úteis:**
- [Coolify Docs](https://coolify.io/docs)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Hetzner Cloud](https://hetzner.cloud)

---

Quer que eu crie um tutorial específico para alguma dessas opções?
