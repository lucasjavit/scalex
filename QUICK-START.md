# ⚡ Quick Start - Deploy no Coolify

## 🎯 Resumo: 3 Passos para Deploy

### ✅ Pré-requisito
- Conta no Coolify criada: https://app.coolify.io

---

## 📦 PASSO 1: Preparar Repositório (5 min)

```bash
# 1. Faça commit dos novos arquivos criados
git add .
git commit -m "feat: add Coolify deployment files"
git push origin main

# Arquivos importantes:
# ✅ back-end/Dockerfile
# ✅ front-end/Dockerfile
# ✅ front-end/nginx.conf
# ✅ jitsi/docker-compose.yml
```

---

## 🗄️ PASSO 2: Criar Database no Coolify (2 min)

1. **Login:** https://app.coolify.io
2. **Clique:** `+ New` → `Database` → `PostgreSQL`
3. **Configure:**
   - Name: `scalex-postgres`
   - Version: `15`
   - Database: `scalex`
   - Username: `scalex_user`
4. **Clique:** `Create`
5. **Copie:** A senha gerada automaticamente

---

## 🚀 PASSO 3: Deploy Aplicações (10 min cada)

### A. Backend

1. `+ New` → `Application` → `Public Repository`
2. **URL:** `https://github.com/SEU_USUARIO/scalex`
3. **Branch:** `main`
4. **Build Pack:** `Dockerfile`
5. **Base Directory:** `back-end`
6. **Port:** `3000`
7. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=scalex-postgres
   DB_PORT=5432
   DB_USERNAME=scalex_user
   DB_PASSWORD=<cole a senha do database>
   DB_DATABASE=scalex
   FIREBASE_PROJECT_ID=seu-projeto
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY="..."
   FRONTEND_URL=https://app.seudominio.com
   BACKEND_URL=https://api.seudominio.com
   ```
8. **Domain:** `api.seudominio.com`
9. **Deploy!** 🚀

### B. Frontend

1. `+ New` → `Application` → `Public Repository`
2. **URL:** `https://github.com/SEU_USUARIO/scalex` (mesmo repo)
3. **Branch:** `main`
4. **Build Pack:** `Dockerfile`
5. **Base Directory:** `front-end`
6. **Port:** `80`
7. **Build Arguments (Environment Variables):**
   ```
   VITE_API_URL=https://api.seudominio.com
   VITE_JITSI_URL=https://meet.seudominio.com
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
8. **Domain:** `app.seudominio.com`
9. **Deploy!** 🚀

### C. Jitsi (Opcional - para video calls)

1. `+ New` → `Docker Compose`
2. **Repository:** `https://github.com/SEU_USUARIO/scalex`
3. **Compose File:** `jitsi/docker-compose.yml`
4. **Environment Variables:**
   ```
   PUBLIC_URL=https://meet.seudominio.com
   JICOFO_SECRET=<gere com: openssl rand -hex 32>
   JICOFO_PASSWORD=<gere com: openssl rand -hex 32>
   JVB_PASSWORD=<gere com: openssl rand -hex 32>
   ```
5. **Domain:** `meet.seudominio.com` (porta `8443`)
6. **Deploy!** 🚀

---

## 🌐 PASSO 4: Configurar DNS (5 min)

**No seu provedor de DNS (Cloudflare, Namecheap, etc):**

```
A    app.seudominio.com    →  IP_DO_SERVIDOR_COOLIFY
A    api.seudominio.com    →  IP_DO_SERVIDOR_COOLIFY
A    meet.seudominio.com   →  IP_DO_SERVIDOR_COOLIFY
```

> 💡 Veja o IP em: Coolify → Settings → Server

**Aguarde propagação:** ~10-30 minutos

---

## 🔒 PASSO 5: Ativar SSL (automático)

**Para cada aplicação:**
1. Vá em `Domains`
2. Clique `Generate SSL Certificate`
3. Aguarde ~30s
4. ✅ SSL Ativo!

---

## ✅ Checklist

- [ ] Repository pushed com Dockerfiles
- [ ] PostgreSQL criado no Coolify
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Jitsi deployed (opcional)
- [ ] DNS configurado
- [ ] SSL ativo em todos
- [ ] App acessível em https://app.seudominio.com

---

## 🧪 Testar

```bash
# Backend
curl https://api.seudominio.com/health

# Frontend
open https://app.seudominio.com

# Jitsi
open https://meet.seudominio.com
```

---

## 🔄 Deploy Automático

**Configure webhook do GitHub:**
1. GitHub → Settings → Webhooks → Add
2. **Payload URL:** (copie do Coolify → Settings → Webhooks)
3. **Content type:** `application/json`
4. **Events:** Push events
5. Save

Agora todo `git push` faz deploy automático! 🎉

---

## 📚 Documentação Completa

- **Passo a passo detalhado:** [COOLIFY-SETUP.md](COOLIFY-SETUP.md)
- **Troubleshooting:** [COOLIFY-SETUP.md#troubleshooting](COOLIFY-SETUP.md#troubleshooting)
- **Migração AWS/GCP:** [MIGRATION-AWS-GCP.md](MIGRATION-AWS-GCP.md)

---

## 💰 Custo Total

```
Servidor Coolify (4GB): $8-12/mês
TUDO incluído! 🎉
```

---

Precisa de ajuda? Consulte o [COOLIFY-SETUP.md](COOLIFY-SETUP.md) completo!
