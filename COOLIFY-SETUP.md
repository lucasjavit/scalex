# 🚀 Guia Completo: Deploy ScaleX no Coolify

## ✅ Pré-requisitos Completados
- ✅ Conta no Coolify criada
- ✅ Dockerfiles criados (backend e frontend)
- ✅ Nginx configurado para frontend

---

## 📋 PASSO 1: Preparar o Repositório Git

### 1.1 Fazer Commit dos Novos Arquivos

```bash
# No diretório raiz do projeto
git add .
git commit -m "feat: add Dockerfiles for Coolify deployment"
git push origin main
```

**Arquivos criados:**
- ✅ `back-end/Dockerfile` - Build do backend NestJS
- ✅ `back-end/.dockerignore` - Ignora arquivos desnecessários
- ✅ `front-end/Dockerfile` - Build do frontend React + Nginx
- ✅ `front-end/nginx.conf` - Configuração do Nginx para SPA
- ✅ `front-end/.dockerignore` - Ignora arquivos desnecessários

---

## 🗄️ PASSO 2: Criar Banco de Dados PostgreSQL

### 2.1 No Coolify Dashboard

1. **Acesse:** [https://app.coolify.io](https://app.coolify.io)
2. **Clique em:** `+ New` → `Database`
3. **Selecione:** `PostgreSQL`
4. **Configure:**
   ```
   Name: scalex-postgres
   Version: 15 (latest)
   Database Name: scalex
   Username: scalex_user
   Password: <será gerado automaticamente>
   ```
5. **Clique em:** `Create Database`
6. **Aguarde:** ~30 segundos até ficar "Running" 🟢

### 2.2 Anotar Credenciais

**Após criar, clique no database e copie:**
- **Internal URL**: `postgresql://scalex_user:SENHA@scalex-postgres:5432/scalex`
- **Host**: `scalex-postgres` (para conectar de outros containers)
- **Port**: `5432`
- **Database**: `scalex`
- **Username**: `scalex_user`
- **Password**: `<gerado automaticamente>`

> 💡 **Dica:** Coolify injeta automaticamente essas variáveis como `DATABASE_URL`

---

## 🔧 PASSO 3: Deploy do Backend (NestJS)

### 3.1 Criar Aplicação Backend

1. **No Coolify Dashboard:** `+ New` → `Application`
2. **Source:** `Public Repository`
3. **Configure:**
   ```
   Repository URL: https://github.com/SEU_USUARIO/scalex
   Branch: main
   Build Pack: Dockerfile
   Base Directory: back-end
   Dockerfile: Dockerfile
   ```
4. **Clique em:** `Continue`

### 3.2 Configurar Build

1. **Name:** `scalex-backend`
2. **Port Exposes:** `3000`
3. **Health Check Path:** `/health` (se você tiver esse endpoint)

### 3.3 Configurar Variáveis de Ambiente

**Clique na aba `Environment Variables` e adicione:**

```bash
# Node.js
NODE_ENV=production
PORT=3000

# Database (use o internal URL do PostgreSQL criado)
DB_HOST=scalex-postgres
DB_PORT=5432
DB_USERNAME=scalex_user
DB_PASSWORD=<cole a senha gerada pelo Coolify>
DB_DATABASE=scalex

# Firebase (suas credenciais)
FIREBASE_PROJECT_ID=seu-projeto-firebase
FIREBASE_CLIENT_EMAIL=seu-service-account@...iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_AQUI\n-----END PRIVATE KEY-----"

# URLs (você configurará o domínio depois)
FRONTEND_URL=https://app.seudominio.com
BACKEND_URL=https://api.seudominio.com
```

> 💡 **Dica:** Marque variáveis sensíveis como `DB_PASSWORD` e `FIREBASE_PRIVATE_KEY` como **Secret** (ícone de cadeado)

### 3.4 Configurar Domínio (Opcional por enquanto)

**Domains:**
- Adicione: `api.seudominio.com`
- Coolify gerará SSL automaticamente via Let's Encrypt

### 3.5 Deploy!

1. **Clique em:** `Deploy`
2. **Aguarde:** 3-5 minutos para build
3. **Monitore:** Logs em tempo real na aba `Deployments`

**Status esperado:**
```
Building... ⏳
Pushing... ⏳
Deploying... ⏳
Running ✅
```

---

## 🎨 PASSO 4: Deploy do Frontend (React)

### 4.1 Criar Aplicação Frontend

1. **No Coolify Dashboard:** `+ New` → `Application`
2. **Source:** `Public Repository` (mesmo repo)
3. **Configure:**
   ```
   Repository URL: https://github.com/SEU_USUARIO/scalex
   Branch: main
   Build Pack: Dockerfile
   Base Directory: front-end
   Dockerfile: Dockerfile
   ```

### 4.2 Configurar Build

1. **Name:** `scalex-frontend`
2. **Port Exposes:** `80`

### 4.3 Configurar Build Arguments

**Na aba `Environment Variables`, adicione variáveis de BUILD:**

> ⚠️ **IMPORTANTE:** Para Vite, variáveis devem começar com `VITE_` e são usadas no BUILD TIME

```bash
# API URL (use a URL do backend)
VITE_API_URL=https://api.seudominio.com

# Jitsi URL (configuraremos depois)
VITE_JITSI_URL=https://meet.seudominio.com

# Firebase (credenciais públicas)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=scalex-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=scalex-xxx
VITE_FIREBASE_STORAGE_BUCKET=scalex-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abc123
```

### 4.4 Configurar Domínio

**Domains:**
- Adicione: `app.seudominio.com`
- SSL automático ✅

### 4.5 Deploy!

1. **Clique em:** `Deploy`
2. **Aguarde:** 2-3 minutos

---

## 🎥 PASSO 5: Deploy do Jitsi Meet

### 5.1 Preparar docker-compose.yml

Primeiro, vamos ajustar o `docker-compose.yml` para funcionar no Coolify:

**Crie:** `jitsi/docker-compose.yml`

```yaml
version: '3.8'

services:
  prosody:
    image: jitsi/prosody:stable-9258
    restart: unless-stopped
    expose:
      - 5222
      - 5347
      - 5280
    environment:
      - XMPP_DOMAIN=meet.jitsi
      - XMPP_AUTH_DOMAIN=auth.meet.jitsi
      - XMPP_MUC_DOMAIN=muc.meet.jitsi
      - XMPP_INTERNAL_MUC_DOMAIN=internal-muc.meet.jitsi
      - XMPP_GUEST_DOMAIN=guest.meet.jitsi
      - JICOFO_COMPONENT_SECRET=${JICOFO_SECRET}
      - JICOFO_AUTH_USER=focus
      - JICOFO_AUTH_PASSWORD=${JICOFO_PASSWORD}
      - JVB_AUTH_USER=jvb
      - JVB_AUTH_PASSWORD=${JVB_PASSWORD}
      - PUBLIC_URL=${PUBLIC_URL}
      - ENABLE_AUTH=0
      - ENABLE_GUESTS=1
    volumes:
      - prosody-config:/config
      - prosody-plugins:/prosody-plugins-custom

  web:
    image: jitsi/web:stable-9258
    restart: unless-stopped
    ports:
      - '8443:443'
      - '8080:80'
    environment:
      - XMPP_DOMAIN=meet.jitsi
      - XMPP_AUTH_DOMAIN=auth.meet.jitsi
      - XMPP_MUC_DOMAIN=muc.meet.jitsi
      - XMPP_BOSH_URL_BASE=http://prosody:5280
      - PUBLIC_URL=${PUBLIC_URL}
      - ENABLE_LETSENCRYPT=0
      - ENABLE_HTTP_REDIRECT=1
    depends_on:
      - prosody
    volumes:
      - web-config:/config

  jicofo:
    image: jitsi/jicofo:stable-9258
    restart: unless-stopped
    environment:
      - XMPP_DOMAIN=meet.jitsi
      - XMPP_AUTH_DOMAIN=auth.meet.jitsi
      - XMPP_MUC_DOMAIN=muc.meet.jitsi
      - XMPP_INTERNAL_MUC_DOMAIN=internal-muc.meet.jitsi
      - XMPP_SERVER=prosody
      - JICOFO_COMPONENT_SECRET=${JICOFO_SECRET}
      - JICOFO_AUTH_USER=focus
      - JICOFO_AUTH_PASSWORD=${JICOFO_PASSWORD}
    depends_on:
      - prosody
    volumes:
      - jicofo-config:/config

  jvb:
    image: jitsi/jvb:stable-9258
    restart: unless-stopped
    ports:
      - '10000:10000/udp'
    environment:
      - XMPP_DOMAIN=meet.jitsi
      - XMPP_AUTH_DOMAIN=auth.meet.jitsi
      - XMPP_INTERNAL_MUC_DOMAIN=internal-muc.meet.jitsi
      - XMPP_SERVER=prosody
      - JVB_AUTH_USER=jvb
      - JVB_AUTH_PASSWORD=${JVB_PASSWORD}
      - JVB_PORT=10000
      - JVB_STUN_SERVERS=meet-jit-si-turnrelay.jitsi.net:443
      - PUBLIC_URL=${PUBLIC_URL}
    depends_on:
      - prosody
    volumes:
      - jvb-config:/config

volumes:
  prosody-config:
  prosody-plugins:
  web-config:
  jicofo-config:
  jvb-config:
```

### 5.2 Criar Serviço no Coolify

1. **No Coolify Dashboard:** `+ New` → `Docker Compose`
2. **Configure:**
   ```
   Name: scalex-jitsi
   Repository: https://github.com/SEU_USUARIO/scalex
   Branch: main
   Compose File Path: jitsi/docker-compose.yml
   ```

### 5.3 Configurar Variáveis de Ambiente

```bash
PUBLIC_URL=https://meet.seudominio.com
JICOFO_SECRET=sua-senha-segura-1
JICOFO_PASSWORD=sua-senha-segura-2
JVB_PASSWORD=sua-senha-segura-3
```

> 💡 Gere senhas fortes: `openssl rand -hex 32`

### 5.4 Configurar Domínio

**Domains:**
- Adicione: `meet.seudominio.com`
- Porta: `8443` (HTTPS do Jitsi)

### 5.5 Deploy!

1. **Clique em:** `Deploy`
2. **Aguarde:** 5-7 minutos (4 containers)

---

## 🌐 PASSO 6: Configurar DNS

### 6.1 No Seu Provedor de DNS (Cloudflare, Namecheap, etc)

**Obtenha o IP do seu servidor Coolify:**
- No Coolify: Settings → Server → IP Address

**Adicione os seguintes registros A:**

```
Tipo    Nome    Valor           TTL
────────────────────────────────────
A       app     SEU_IP_COOLIFY  300
A       api     SEU_IP_COOLIFY  300
A       meet    SEU_IP_COOLIFY  300
```

### 6.2 Aguarde Propagação

```bash
# Verifique se DNS propagou (no seu terminal local)
nslookup app.seudominio.com
nslookup api.seudominio.com
nslookup meet.seudominio.com

# Todos devem retornar SEU_IP_COOLIFY
```

---

## 🔐 PASSO 7: Configurar SSL Automático

### 7.1 Para Cada Aplicação

**Backend:**
1. Vá em: `scalex-backend` → `Domains`
2. Clique em: `Generate SSL Certificate`
3. Aguarde: ~30 segundos
4. Status: 🔒 SSL Active

**Frontend:**
1. Vá em: `scalex-frontend` → `Domains`
2. Clique em: `Generate SSL Certificate`
3. Aguarde: ~30 segundos
4. Status: 🔒 SSL Active

**Jitsi:**
1. Vá em: `scalex-jitsi` → `Domains`
2. Clique em: `Generate SSL Certificate`
3. Aguarde: ~30 segundos
4. Status: 🔒 SSL Active

---

## 🧪 PASSO 8: Testar a Aplicação

### 8.1 Testar Backend

```bash
# Substitua pela sua URL
curl https://api.seudominio.com/health

# Resposta esperada:
{"status":"ok"}
```

### 8.2 Testar Frontend

Abra no navegador:
```
https://app.seudominio.com
```

**Deve carregar:**
- ✅ Página de login
- ✅ Sem erros de CORS
- ✅ SSL ativo (cadeado verde)

### 8.3 Testar Jitsi

Abra no navegador:
```
https://meet.seudominio.com
```

**Deve carregar:**
- ✅ Interface do Jitsi
- ✅ Consegue criar sala
- ✅ SSL ativo

---

## 🔄 PASSO 9: Configurar Deploy Automático

### 9.1 Webhook do GitHub

**Para cada aplicação (backend, frontend, jitsi):**

1. **No Coolify:** Application → Settings → Webhooks
2. **Copie:** Webhook URL (ex: `https://app.coolify.io/api/v1/deploy/...`)

3. **No GitHub:**
   - Vá em: Repository → Settings → Webhooks
   - Add webhook
   - **Payload URL:** Cole o webhook do Coolify
   - **Content type:** `application/json`
   - **Events:** Just the push event
   - **Active:** ✅

4. **Teste:**
   ```bash
   git commit --allow-empty -m "test: trigger deploy"
   git push origin main

   # Veja o deploy acontecendo no Coolify!
   ```

---

## 📊 PASSO 10: Monitoramento e Logs

### 10.1 Ver Logs em Tempo Real

**Para cada aplicação:**
1. Clique na aplicação
2. Aba `Logs`
3. Veja logs em tempo real (como `tail -f`)

### 10.2 Verificar Recursos

**Dashboard:**
- CPU usage
- Memory usage
- Disk usage
- Network traffic

### 10.3 Alertas (Opcional)

**Settings → Notifications:**
- Configure Slack, Discord, Email
- Receba alertas se app cair

---

## 🔧 PASSO 11: Configuração de Backup

### 11.1 Backup do Banco de Dados

1. **Vá em:** `scalex-postgres` → `Backups`
2. **Configure:**
   ```
   Frequency: Daily
   Time: 03:00 AM
   Retention: 7 days
   ```
3. **Ative:** Enable Automatic Backups

### 11.2 Backup de Volumes (Jitsi)

1. **Vá em:** `scalex-jitsi` → `Volumes`
2. **Para cada volume:**
   - Click → Create Snapshot
   - Agende snapshots semanais

---

## ✅ Checklist Final

- [ ] PostgreSQL criado e rodando 🟢
- [ ] Backend deployed e acessível
- [ ] Frontend deployed e acessível
- [ ] Jitsi deployed e funcionando
- [ ] DNS configurado (app, api, meet)
- [ ] SSL ativo em todos os domínios 🔒
- [ ] Webhooks do GitHub configurados
- [ ] Backups automáticos configurados
- [ ] Testado login no frontend
- [ ] Testado chamada de vídeo no Jitsi

---

## 🆘 Troubleshooting

### Backend não inicia

**Verifique logs:**
```
Coolify → scalex-backend → Logs
```

**Erros comuns:**
- `Database connection failed`: Verifique `DB_HOST`, `DB_PASSWORD`
- `Port already in use`: Verifique se `Port Exposes` está correto (3000)
- `FIREBASE_PRIVATE_KEY invalid`: Verifique se está entre aspas duplas

### Frontend mostra erro CORS

**Verifique:**
1. `VITE_API_URL` no frontend aponta para `https://api.seudominio.com`
2. Backend está configurado com CORS permitindo o domínio do frontend

**Adicione no backend (se necessário):**
```typescript
// back-end/src/main.ts
app.enableCors({
  origin: [
    'https://app.seudominio.com',
    'http://localhost:5173' // para dev
  ],
  credentials: true
});
```

### Jitsi não carrega vídeo

**Verifique:**
1. Porta UDP `10000` está aberta no servidor
2. `PUBLIC_URL` está correto nas variáveis
3. Firewall não está bloqueando UDP

**No servidor Coolify (via SSH):**
```bash
sudo ufw allow 10000/udp
```

### SSL não gera

**Verifique:**
1. DNS propagou (aguarde até 1 hora)
2. Porta 80 e 443 estão abertas
3. Domínio aponta para IP correto

```bash
# Teste DNS
dig app.seudominio.com +short
# Deve retornar o IP do servidor
```

---

## 🎯 Próximos Passos

### Performance

1. **Configure CDN** (Cloudflare):
   - Proxy através do Cloudflare
   - Cache de assets estáticos
   - DDoS protection grátis

2. **Otimize Imagens Docker**:
   - Use multi-stage builds (já configurado ✅)
   - Minimize camadas

### Segurança

1. **Rate Limiting** no Backend:
   ```typescript
   // Adicione throttler no NestJS
   ```

2. **Firewall** no Coolify:
   - Settings → Firewall
   - Apenas portas necessárias

### Escalabilidade

Quando crescer:
1. **Horizontal Scaling**: Coolify suporta múltiplas instâncias
2. **Database Upgrade**: Aumente recursos do PostgreSQL
3. **Load Balancer**: Coolify gerencia automaticamente

---

## 💰 Custos Mensais

```
┌────────────────────────────────────────┐
│  Coolify Server (4GB RAM)              │
│  Hetzner CPX21: €7.59/mês (~$8/mês)    │
│                                        │
│  Ou Digital Ocean: $12/mês             │
├────────────────────────────────────────┤
│  TOTAL: $8-12/mês                      │
│                                        │
│  Incluído:                             │
│  ✅ Backend + PostgreSQL               │
│  ✅ Frontend com SSL                   │
│  ✅ Jitsi completo                     │
│  ✅ Backups automáticos                │
│  ✅ Monitoramento                      │
│  ✅ Deploy automático                  │
└────────────────────────────────────────┘
```

---

## 📞 Suporte

- **Coolify Docs:** https://coolify.io/docs
- **Discord Coolify:** https://discord.gg/coolify
- **GitHub Issues:** https://github.com/coollabsio/coolify

---

🎉 **Parabéns! ScaleX está rodando no Coolify!**

Agora todo `git push` faz deploy automático. Foco em desenvolver features! 🚀
