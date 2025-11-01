# Guia de Deploy - Frontend (React + Vite)

Este guia documenta o processo completo de deploy do frontend da aplicação ScaleX (React + Vite + TailwindCSS) no Coolify.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Deploy do Frontend](#deploy-do-frontend)
4. [Configuração do Firebase](#configuração-do-firebase)
5. [Erros Comuns e Soluções](#erros-comuns-e-soluções)
6. [Checklist Final](#checklist-final)

---

## 🎯 Visão Geral

**Frontend Stack:**
- Framework: React 19
- Build Tool: Vite
- Styling: TailwindCSS
- Auth: Firebase Authentication (Client SDK)
- Server: Nginx
- Deploy: Coolify (self-hosted)

**Servidor:** Hetzner (IP do seu servidor)

---

## ✅ Pré-requisitos

### 1. Backend Deployado
- ✅ Backend já deve estar rodando e acessível
- ✅ Ter o domínio do backend anotado (ex: `http://r0sccgw8goog4so00c00kc8o.91.98.121.31.sslip.io`)

### 2. Repositório Git
- ✅ Código versionado no GitHub/GitLab
- ✅ Branch `main` como principal
- ✅ Dockerfile configurado em `front-end/Dockerfile`
- ✅ nginx.conf configurado em `front-end/nginx.conf`

### 3. Firebase Project
- ✅ Projeto criado no Firebase Console
- ✅ Web App configurado
- ✅ Credenciais do Web App anotadas

---

## 🚀 Deploy do Frontend

### Passo 1: Criar Aplicação no Coolify

1. No Coolify, clique em **"New Resource"** → **"Application"**
2. Configure:
   - **Name:** `scalex-frontend`
   - **Source:** GitHub Repository (mesmo repositório do backend)
   - **Repository:** URL do seu repositório (ex: `https://github.com/usuario/scalex.git`)
   - **Branch:** `main`
   - **Build Pack:** `Dockerfile`
   - **Dockerfile Location:** `front-end/Dockerfile`
   - **Base Directory:** `front-end`

3. Clique em **"Continue"** ou **"Create"**

### Passo 2: Configurar Portas

⚠️ **CRÍTICO:** Frontend usa Nginx na porta 80, **não** 3000!

Na aba de configuração da aplicação:

- **Ports Exposes:** `80` (Nginx roda na porta 80)
- **Ports Mappings:** `80:80` ou deixe vazio
- **Network Aliases:** (deixe vazio)

### Passo 3: Configurar Environment Variables

⚠️ **IMPORTANTE:**
- Variáveis do Vite são injetadas em **BUILD TIME** (durante o `npm run build`)
- Se mudar as variáveis depois do deploy, precisa fazer **REDEPLOY** (não apenas Restart)
- Configure **ANTES** do primeiro deploy!

No Coolify, vá em **"Environment Variables"** e adicione:

```bash
# API Backend (domínio gerado pelo Coolify no deploy do backend)
VITE_API_URL=http://r0sccgw8goog4so00c00kc8o.91.98.121.31.sslip.io

# Firebase Web App (obter do Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSyD1LdsUhT7lrBQ4fEd6kHqD9U0Z3Wp88eQ
VITE_FIREBASE_APP_ID=1:809513575477:web:3b2a437079adbc57d1fd7c
VITE_FIREBASE_AUTH_DOMAIN=auth-firebase-65d96.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=auth-firebase-65d96

# Jitsi (opcional - para videochamadas)
VITE_JITSI_DOMAIN=meet.jit.si
VITE_JITSI_JWT=
VITE_JITSI_TENANT=
```

#### Como obter as credenciais do Firebase:

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **⚙️ Project Settings** → **General**
4. Role até **"Your apps"**
5. Se ainda não tem um Web App, clique em **"Add app"** (ícone `</>`), senão clique no app existente
6. Copie as credenciais:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",              // → VITE_FIREBASE_API_KEY
  authDomain: "projeto.firebaseapp.com",  // → VITE_FIREBASE_AUTH_DOMAIN
  projectId: "projeto-id",           // → VITE_FIREBASE_PROJECT_ID
  appId: "1:123456:web:abc123",      // → VITE_FIREBASE_APP_ID
};
```

⚠️ **Nota:** Essas são credenciais **públicas** (usadas no navegador do usuário), não confundir com o Service Account do backend.

### Passo 4: Verificar Dockerfile

⚠️ **CRÍTICO:** O Dockerfile **DEVE** ter os `ARG` e `ENV` declarados **ANTES** do `npm run build`.

**Por quê?** O Vite injeta as variáveis `VITE_*` durante o build, transformando `import.meta.env.VITE_API_URL` em strings literais no código JavaScript compilado.

```dockerfile
# front-end/Dockerfile

# ========== Estágio 1: Build ==========
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código
COPY . .

# ⚠️ CRÍTICO: Declarar ARG para receber variáveis do Coolify
ARG VITE_API_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_JITSI_DOMAIN
ARG VITE_JITSI_JWT
ARG VITE_JITSI_TENANT

# ⚠️ CRÍTICO: Exportar como ENV para o Vite acessar
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_JITSI_DOMAIN=$VITE_JITSI_DOMAIN
ENV VITE_JITSI_JWT=$VITE_JITSI_JWT
ENV VITE_JITSI_TENANT=$VITE_JITSI_TENANT

# Build (Vite injeta as variáveis aqui)
RUN npm run build

# ========== Estágio 2: Produção ==========
FROM nginx:alpine

# Instalar wget para healthcheck
RUN apk add --no-cache wget

# Copiar build do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

**Pontos importantes:**

1. **Multi-stage build**: Primeiro estágio para build (Node.js), segundo para servir (Nginx)
2. **ARG antes de ENV**: ARG recebe do Coolify, ENV exporta para o processo
3. **Build depois de ENV**: O `npm run build` só funciona depois de ter as variáveis
4. **COPY --from=builder**: Copia apenas o resultado do build (`/app/dist`) para o Nginx
5. **Health check na porta 80**: Nginx roda na 80, não na 3000

### Passo 5: Verificar nginx.conf

O Nginx precisa estar configurado para servir a aplicação React (SPA):

```nginx
# front-end/nginx.conf

server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Configuração para garantir que o nginx responda corretamente
    absolute_redirect off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA routing - todas as rotas servem index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos (JS, CSS, imagens)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Não cachear index.html (para sempre pegar a versão mais nova)
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }
}
```

**Pontos importantes:**

1. **listen 80**: Nginx escuta na porta 80 (padrão HTTP)
2. **try_files**: Todas as rotas do React Router servem o `index.html`
3. **Gzip**: Compressão para reduzir tamanho dos arquivos
4. **Security headers**: Headers de segurança básicos
5. **Cache de assets**: JS/CSS em cache por 1 ano (imutáveis)
6. **No cache do index.html**: Sempre pega a versão mais nova após deploy

### Passo 6: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build terminar (pode levar alguns minutos)
3. Monitore os logs em **"Deployment Logs"**

Você verá algo como:

```
✓ Pulling latest code...
✓ Building with Docker...
✓ Installing dependencies... (npm ci)
✓ Building application... (npm run build)
  ✓ 171 modules transformed.
  dist/index.html                   0.57 kB
  dist/assets/index-HjUWM5AG.css   65.91 kB
  dist/assets/index-Cmpid6Ox.js   785.93 kB
  ✓ built in 3.99s
✓ Creating container...
✓ Starting container...
✓ Healthcheck passed (healthy)
✓ Deployment successful
```

### Passo 7: Obter o Domínio Gerado

Após o deploy, o Coolify gera um domínio automático tipo:

```
http://b080kskooos0g04gc84s00oc.91.98.121.31.sslip.io
```

**Anote este domínio!** Você precisará dele para:
- Configurar o domínio autorizado no Firebase
- Atualizar `FRONTEND_URL` no backend

### Passo 8: Atualizar Backend

Volte no **Backend** (no Coolify) e atualize a variável de ambiente:

```bash
FRONTEND_URL=http://b080kskooos0g04gc84s00oc.91.98.121.31.sslip.io
```

Clique em **"Save"** e depois em **"Restart"** no backend.

### Passo 9: Testar Frontend

Acesse o domínio do frontend no navegador:

```
http://b080kskooos0g04gc84s00oc.91.98.121.31.sslip.io
```

**Resposta esperada:** A aplicação React deve carregar normalmente!

Se aparecer erro 502 Bad Gateway, veja a seção [Erros Comuns](#erros-comuns-e-soluções).

---

## 🔐 Configuração do Firebase

### Adicionar Domínio Autorizado

⚠️ **Obrigatório para o login funcionar!**

Após o deploy, você precisa adicionar o domínio do frontend nos domínios autorizados do Firebase:

#### Erro que aparece se não configurar:

```
Firebase: Error (auth/unauthorized-domain)
Info: The current domain is not authorized for OAuth operations. Add your domain (b080kskooos0g04gc84s00oc.91.98.121.31.sslip.io) to the OAuth redirect domains list in the Firebase console.
```

#### Como resolver:

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Authentication** → **Settings** → **Authorized domains**
4. Clique em **"Add domain"**
5. Adicione o domínio do frontend gerado pelo Coolify:
   ```
   b080kskooos0g04gc84s00oc.91.98.121.31.sslip.io
   ```
6. Clique em **"Add"**
7. Recarregue a página do frontend e teste o login novamente

✅ **Resolvido!** O Firebase agora aceita logins desse domínio.

---

## 🐛 Erros Comuns e Soluções

### 1. ❌ 502 Bad Gateway

**Sintoma:** Ao acessar o domínio do frontend, recebe erro 502.

#### Causa A: Dockerfile sem `ARG` para variáveis Vite

**Sintoma:** O frontend não carrega, 502 Bad Gateway logo após deploy.

**Diagnóstico:** No log de build do Coolify, você **NÃO** vê as variáveis `VITE_*` sendo passadas como `--build-arg`.

**Solução:** Adicione os `ARG` e `ENV` no Dockerfile **antes do `npm run build`** (ver [Passo 4](#passo-4-verificar-dockerfile)).

Depois:

```bash
git add front-end/Dockerfile
git commit -m "fix: add build args for Vite env vars"
git push
```

No Coolify, clique em **"Redeploy"**.

---

#### Causa B: Porta errada no Coolify

**Sintoma:** Container iniciando mas Coolify não consegue se conectar.

**Diagnóstico:** Configurou `Ports Exposes: 3000` mas o Nginx roda na porta 80.

**Solução:**

1. No Coolify, vá na aplicação do frontend
2. Vá em **"Configuration"** ou **"Ports"**
3. Altere:
   - **Ports Exposes:** `80`
   - **Ports Mappings:** `80:80` ou deixe vazio

4. Clique em **"Restart"** (ou Redeploy se necessário)

---

#### Causa C: Health check falhando

**Sintoma:** Logs mostram "Healthcheck status: unhealthy".

**Diagnóstico:** O health check está testando a porta errada ou com timeout muito curto.

**Solução:** Ajuste o health check no Dockerfile:

```dockerfile
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1
```

Pontos importantes:
- `--start-period=10s`: Dá 10 segundos para o Nginx iniciar antes de testar
- `http://localhost:80/`: Testa na porta 80 (não 3000)
- `--retries=3`: Tenta 3 vezes antes de marcar como unhealthy

---

#### Causa D: Arquivos não copiados corretamente

**Sintoma:** Nginx inicia mas retorna 404 ou página vazia.

**Diagnóstico:** Os arquivos não foram copiados para `/usr/share/nginx/html`.

**Solução:** Verifique no Dockerfile:

```dockerfile
# Copiar build do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html
```

**Verifique também se o build gerou os arquivos:**

No log de build, procure por:

```
✓ built in 3.99s
dist/index.html                   0.57 kB
dist/assets/...
```

Se não aparecer, há erro no código React ou na configuração do Vite.

---

### 2. ❌ Variáveis de Ambiente Undefined

**Sintoma:** No console do navegador (F12):

```javascript
console.log(import.meta.env.VITE_API_URL);
// undefined
```

**Causa:** As variáveis foram definidas **depois** do build, mas Vite precisa delas **durante** o build.

**Solução:**

#### Passo 1: Definir variáveis no Coolify

Vá em **"Environment Variables"** e adicione todas as variáveis `VITE_*`.

#### Passo 2: Redeploy (não apenas Restart!)

**Importante:** Mudar variáveis de ambiente do Vite requer **REDEPLOY**, não apenas Restart.

- **Restart:** Apenas reinicia o container existente (mantém o build antigo)
- **Redeploy:** Refaz o build completo com as novas variáveis

Clique em **"Redeploy"** no Coolify.

#### Passo 3: Verificar no build

No log de build, você deve ver:

```
--build-arg VITE_API_URL='http://r0sccgw8goog4so00c00kc8o.91.98.121.31.sslip.io'
--build-arg VITE_FIREBASE_API_KEY='AIzaSyD...'
...
```

Se não aparecer, o Dockerfile não tem os `ARG` declarados.

---

### 3. ❌ Firebase: auth/unauthorized-domain

**Sintoma:** No console do navegador (F12):

```
FirebaseError: Firebase: Error (auth/unauthorized-domain)
```

**Causa:** O domínio do frontend não está autorizado no Firebase Console.

**Solução:** Ver seção [Configuração do Firebase](#configuração-do-firebase).

---

### 4. ❌ API Requests Failing (404 ou CORS)

**Sintoma:** No console do navegador (F12):

```
Failed to fetch
TypeError: Failed to fetch
```

ou

```
Access to fetch at 'http://...' has been blocked by CORS policy
```

#### Causa A: VITE_API_URL incorreto

**Diagnóstico:** A variável `VITE_API_URL` está vazia ou apontando para o lugar errado.

**Solução:**

1. Verifique no console do navegador:

```javascript
console.log(import.meta.env.VITE_API_URL);
```

2. Se estiver errado, atualize no Coolify e faça **Redeploy**.

---

#### Causa B: CORS não configurado no backend

**Diagnóstico:** Requisição chega no backend mas é bloqueada por CORS.

**Solução:** Configure CORS no backend (ver guia de deploy do backend).

---

### 5. ❌ Rotas do React Router Retornam 404

**Sintoma:** Página inicial carrega, mas ao acessar `/dashboard`, `/login`, etc. retorna 404.

**Causa:** Nginx não está configurado para SPA routing.

**Solução:** Verifique o `nginx.conf`:

```nginx
# SPA routing - todas as rotas servem index.html
location / {
    try_files $uri $uri/ /index.html;
}
```

Essa configuração faz com que qualquer rota que não seja um arquivo real (JS, CSS, imagens) retorne o `index.html`, permitindo o React Router funcionar.

---

## ✅ Checklist Final

### Configuração

- [ ] Dockerfile com `ARG` e `ENV` para todas variáveis `VITE_*`
- [ ] nginx.conf configurado para SPA routing
- [ ] Porta 80 configurada no Coolify (não 3000)
- [ ] Todas as variáveis de ambiente definidas **antes** do deploy

### Variáveis de Ambiente

- [ ] `VITE_API_URL` apontando para domínio do backend
- [ ] `VITE_FIREBASE_API_KEY` configurada
- [ ] `VITE_FIREBASE_APP_ID` configurada
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` configurada
- [ ] `VITE_FIREBASE_PROJECT_ID` configurada

### Deploy

- [ ] Build do Vite completado com sucesso
- [ ] Arquivos copiados para `/usr/share/nginx/html`
- [ ] Nginx rodando na porta 80
- [ ] Health check passando (status: healthy)
- [ ] Domínio gerado pelo Coolify anotado

### Backend

- [ ] `FRONTEND_URL` atualizada no backend
- [ ] CORS configurado no backend
- [ ] Backend respondendo corretamente

### Firebase

- [ ] Domínio do frontend adicionado em "Authorized domains"
- [ ] Login funcionando sem erros

### Testes

- [ ] Aplicação carrega no navegador
- [ ] Console do navegador sem erros (F12)
- [ ] Login com Firebase funciona
- [ ] Requisições para backend funcionam
- [ ] Navegação entre rotas funciona (React Router)

---

## 🔄 Workflow de Deploy

### Quando Fazer Redeploy vs Restart

**Restart (apenas reinicia o container):**
- ❌ **NÃO funciona** para variáveis Vite
- ❌ Mantém o build antigo

**Redeploy (rebuild completo):**
- ✅ Mudou código da aplicação
- ✅ Mudou Dockerfile ou nginx.conf
- ✅ **Mudou variáveis de ambiente `VITE_*`**
- ✅ Atualizou dependências (package.json)

### Git Workflow

Sempre que fizer mudanças no código:

```bash
# 1. Commitar mudanças
git add .
git commit -m "descrição da mudança"
git push

# 2. No Coolify, clicar em "Redeploy"
```

### Mudou Variáveis de Ambiente?

```bash
# 1. No Coolify, atualizar as variáveis VITE_*
# 2. Clicar em "Redeploy" (não Restart!)
# 3. Aguardar build completar
# 4. Testar no navegador
```

---

## 📝 Variáveis de Ambiente - Resumo

```bash
# Backend API
VITE_API_URL=<dominio-backend>

# Firebase Web App
VITE_FIREBASE_API_KEY=<api-key>
VITE_FIREBASE_APP_ID=<app-id>
VITE_FIREBASE_AUTH_DOMAIN=<auth-domain>
VITE_FIREBASE_PROJECT_ID=<project-id>

# Jitsi (opcional)
VITE_JITSI_DOMAIN=meet.jit.si
VITE_JITSI_JWT=
VITE_JITSI_TENANT=
```

**⚠️ Importante:** Todas devem ter o prefixo `VITE_` para serem injetadas pelo Vite.

---

## 🎉 Conclusão

Após seguir todos os passos, seu frontend estará rodando em produção!

**Teste final:**

1. Acesse o domínio do frontend no navegador
2. Abra o Console (F12)
3. Verifique se não há erros
4. Teste o login com Firebase
5. Teste navegação entre páginas

**URLs finais:**

- **Frontend:** `http://b080kskooos0g04gc84s00oc.91.98.121.31.sslip.io`
- **Backend API:** `http://r0sccgw8goog4so00c00kc8o.91.98.121.31.sslip.io`

---

## 🆘 Precisa de Ajuda?

Se encontrar algum erro não documentado aqui:

1. Verifique os **logs do container** no Coolify
2. Verifique o **log de build** no Coolify
3. Abra o **Console do navegador** (F12)
4. Compare com os erros documentados acima
5. Verifique se seguiu todos os passos do checklist

---

## 📚 Conceitos Importantes

### Build Time vs Runtime

**Build Time (Vite):**
- Variáveis são injetadas **durante** o `npm run build`
- `import.meta.env.VITE_API_URL` é substituído por uma string literal no JS compilado
- Exemplo: `const url = import.meta.env.VITE_API_URL` vira `const url = "http://..."`
- **Mudar variável = Redeploy obrigatório**

**Runtime (Backend NestJS):**
- Variáveis são lidas **quando a aplicação inicia**
- `process.env.DB_HOST` é lido do ambiente do container
- **Mudar variável = Restart suficiente**

### Nginx vs Node.js

**Frontend (Nginx):**
- Serve arquivos estáticos (HTML, CSS, JS)
- Porta 80 (padrão HTTP)
- Muito leve e rápido
- Não processa JavaScript (apenas envia para o navegador)

**Backend (Node.js):**
- Processa requisições dinâmicas
- Porta 3000 (customizável)
- Executa código JavaScript no servidor
- Conecta no banco de dados

---

**Última atualização:** 31/10/2025
**Projeto:** ScaleX - Frontend React
