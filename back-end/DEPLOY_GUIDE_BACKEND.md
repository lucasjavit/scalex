# Guia de Deploy - Backend (NestJS)

Este guia documenta o processo completo de deploy do backend da aplicação ScaleX (NestJS + TypeORM + PostgreSQL) no Coolify.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Deploy do PostgreSQL](#deploy-do-postgresql)
4. [Deploy do Backend](#deploy-do-backend)
5. [Configuração do Firebase](#configuração-do-firebase)
6. [Erros Comuns e Soluções](#erros-comuns-e-soluções)
7. [Checklist Final](#checklist-final)

---

## 🎯 Visão Geral

**Backend Stack:**
- Framework: NestJS
- ORM: TypeORM
- Database: PostgreSQL
- Auth: Firebase Admin SDK
- Deploy: Coolify (self-hosted)

**Servidor:** Hetzner (IP do seu servidor)

---

## ✅ Pré-requisitos

### 1. Servidor Configurado
- ✅ Coolify instalado e rodando (v4.0.0-beta.428 ou superior)
- ✅ Docker funcionando no servidor
- ✅ Acesso SSH ao servidor

### 2. Repositório Git
- ✅ Código versionado no GitHub/GitLab
- ✅ Branch `main` como principal
- ✅ Dockerfile configurado em `back-end/Dockerfile`

### 3. Firebase Project
- ✅ Projeto criado no Firebase Console
- ✅ Authentication habilitado
- ✅ Service Account JSON baixado

---

## 🗄️ Deploy do PostgreSQL

### Passo 1: Criar Database no Coolify

1. Acesse o Coolify: `http://<seu-ip>:8000`
2. Vá em **"Databases"** → **"New Database"**
3. Selecione **"PostgreSQL"**
4. Configure:
   - **Name:** `scalex-postgres` (ou o nome que preferir)
   - **Database Name:** `postgres`
   - **Username:** `postgres`
   - **Password:** (gerado automaticamente ou customizado)

5. Clique em **"Create"**

### Passo 2: Anotar Credenciais

Após criar o banco, anote as seguintes informações:

```bash
DB_HOST=<hostname-interno-gerado-pelo-coolify>  # Ex: vw84swc044ws4skw88s44o8g
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<senha-gerada-pelo-coolify>
DB_DATABASE=postgres
```

⚠️ **IMPORTANTE:**
- Use o **hostname interno** do Coolify (uma string aleatória tipo `vw84swc044ws4skw88s44o8g`)
- **NÃO** use `localhost`, `127.0.0.1` ou o IP externo do servidor
- Para encontrar o hostname: Vá em **Databases** → Seu PostgreSQL → Campo **"Internal Hostname"**

---

## 🚀 Deploy do Backend

### Passo 1: Criar Aplicação no Coolify

1. No Coolify, clique em **"New Resource"** → **"Application"**
2. Configure:
   - **Name:** `scalex-backend`
   - **Source:** GitHub Repository (ou GitLab/Bitbucket)
   - **Repository:** URL do seu repositório (ex: `https://github.com/usuario/scalex.git`)
   - **Branch:** `main`
   - **Build Pack:** `Dockerfile`
   - **Dockerfile Location:** `back-end/Dockerfile`
   - **Base Directory:** `back-end`

3. Clique em **"Continue"** ou **"Create"**

### Passo 2: Configurar Portas

Na aba de configuração da aplicação:

- **Ports Exposes:** `3000`
- **Ports Mappings:** `3000:3000`
- **Network Aliases:** (deixe vazio)

### Passo 3: Configurar Environment Variables

⚠️ **Configure as variáveis ANTES do primeiro deploy!**

No Coolify, vá em **"Environment Variables"** e adicione:

```bash
# Ambiente
NODE_ENV=production
PORT=3000

# Database (use o hostname interno do Coolify)
DB_HOST=<hostname-interno-do-postgres>
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<senha-do-postgres-no-coolify>
DB_DATABASE=postgres

# URLs (serão atualizadas depois)
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3000

# Firebase Admin SDK (obter do Firebase Console)
FIREBASE_PROJECT_ID=<seu-project-id>
FIREBASE_CLIENT_EMAIL=<service-account-email>
FIREBASE_PRIVATE_KEY=<private-key-com-\n-literal>
```

#### Como obter as credenciais do Firebase:

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **⚙️ Project Settings** → **Service Accounts**
4. Clique em **"Generate new private key"**
5. Baixe o arquivo JSON

Do arquivo JSON, extraia:

```json
{
  "project_id": "auth-firebase-xxxxx",           // → FIREBASE_PROJECT_ID
  "client_email": "firebase-adminsdk-xxx@...",   // → FIREBASE_CLIENT_EMAIL
  "private_key": "-----BEGIN PRIVATE KEY-----\n..." // → FIREBASE_PRIVATE_KEY
}
```

⚠️ **ATENÇÃO - Formato da FIREBASE_PRIVATE_KEY:**

A chave privada deve ter `\n` como **string literal** (dois caracteres: barra + n), **NÃO** como quebra de linha real.

**Exemplo correto:**

```bash
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC6Wasoxxxxx...\n-----END PRIVATE KEY-----
```

**Como fazer:**
1. Copie o valor de `"private_key"` do JSON
2. Cole diretamente no Coolify (já vem com `\n` literal)
3. O código do NestJS faz automaticamente `.replace(/\\n/g, '\n')` para converter

### Passo 4: Verificar Dockerfile

Certifique-se de que o Dockerfile está correto:

```dockerfile
# back-end/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código
COPY . .

# Build da aplicação (se usar TypeScript)
RUN npm run build

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node healthcheck.js || wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Iniciar aplicação
CMD ["node", "dist/main.js"]
```

### Passo 5: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build terminar (pode levar alguns minutos)
3. Monitore os logs em **"Deployment Logs"**

Você verá algo como:

```
✓ Building application...
✓ Installing dependencies...
✓ Running build...
✓ Creating container...
✓ Starting container...
✓ Healthcheck passed
✓ Deployment successful
```

### Passo 6: Obter o Domínio Gerado

Após o deploy, o Coolify gera um domínio automático tipo:

```
http://r0sccgw8goog4so00c00kc8o.91.98.121.31.sslip.io
```

**Anote este domínio!** Você precisará dele para:
- Configurar o frontend
- Atualizar a variável `BACKEND_URL`

### Passo 7: Atualizar URLs nas Environment Variables

Volte em **"Environment Variables"** e atualize:

```bash
BACKEND_URL=http://r0sccgw8goog4so00c00kc8o.91.98.121.31.sslip.io
FRONTEND_URL=<será-preenchido-depois-do-deploy-do-frontend>
```

Clique em **"Save"** e depois em **"Restart"** (não precisa de Redeploy para variáveis de runtime).

### Passo 8: Executar Migrações

⚠️ **IMPORTANTE:** Execute as migrations após o primeiro deploy!

**Opção 1 - Via Terminal do Coolify:**

1. No Coolify, vá na aplicação do backend
2. Clique em **"Terminal"** ou **"Shell"**
3. Execute:

```bash
npm run migration:run
```

**Opção 2 - Via SSH no servidor:**

1. Conecte via SSH no servidor
2. Liste os containers:

```bash
docker ps | grep scalex-backend
```

3. Execute a migration:

```bash
docker exec <container-id> npm run migration:run
```

**Opção 3 - Configurar Post-Deployment Command (Recomendado):**

No Coolify, na configuração da aplicação:

1. Vá em **"Advanced"** ou **"Post-Deployment Commands"**
2. Adicione:

```bash
npm run migration:run
```

3. Salve

Agora toda vez que fizer deploy, as migrations rodarão automaticamente.

### Passo 9: Testar Backend

Acesse o domínio do backend no navegador:

```
http://r0sccgw8goog4so00c00kc8o.91.98.121.31.sslip.io
```

**Resposta esperada:**

```
Hello World!
```

Se ver essa mensagem, o backend está funcionando! ✅

---

## 🔐 Configuração do Firebase

### Verificar se Firebase está Inicializado

Veja os logs do container no Coolify:

```
✅ Firebase Admin inicializado com variáveis de ambiente
```

Se ver essa mensagem, está tudo certo!

Se ver erro, veja a seção [Erros Comuns](#erros-comuns-e-soluções).

---

## 🐛 Erros Comuns e Soluções

### 1. ❌ Firebase Parse Error

**Sintoma:**

```
❌ Erro ao inicializar Firebase Admin: Failed to parse private key: Error: Invalid PEM formatted message
```

**Causa:** O formato da `FIREBASE_PRIVATE_KEY` está incorreto.

**Solução:**

A chave privada deve ter `\n` como **string literal** (dois caracteres: barra + n), **NÃO** como quebra de linha real.

**Formato correto:**

```bash
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG...\n-----END PRIVATE KEY-----
```

**O código já faz o replace automaticamente:**

```typescript
// back-end/src/common/firebase/firebase-admin.service.ts
const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
```

**Como fazer:**

1. Abra o arquivo JSON do Firebase Service Account
2. Copie o valor de `"private_key"` (já vem com `\n` literal)
3. Cole diretamente no Coolify

---

### 2. ❌ Database Connection Error

**Sintoma:**

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

ou

```
Error: getaddrinfo ENOTFOUND localhost
```

**Causa:** Tentando conectar no banco usando `localhost`, `127.0.0.1` ou hostname errado.

**Solução:**

Use o **hostname interno** gerado pelo Coolify:

```bash
DB_HOST=vw84swc044ws4skw88s44o8g  # Exemplo - o seu será diferente
```

**Como encontrar:**

1. No Coolify, vá em **"Databases"**
2. Clique no seu PostgreSQL
3. Veja o campo **"Internal Hostname"** ou **"Connection String"**
4. Copie apenas o hostname (ex: `vw84swc044ws4skw88s44o8g`)

**Verifique também:**
- `DB_PORT=5432` (padrão do PostgreSQL)
- `DB_USERNAME=postgres`
- `DB_PASSWORD=<senha-correta>`
- `DB_DATABASE=postgres`

---

### 3. ❌ Migration Failed - NOT NULL Constraint

**Sintoma:**

```
QueryFailedError: null value in column "birth_date" of relation "users" violates not-null constraint
```

**Causa:** Migration criando usuário sem campos obrigatórios.

**Solução:**

Adicione os campos faltantes na migration:

```typescript
// back-end/src/migrations/XXXXXX-CreateFirstAdminUser.ts
await queryRunner.query(`
  INSERT INTO users (
    email,
    role,
    full_name,
    birth_date,        -- ✅ Adicionar
    phone,             -- ✅ Adicionar
    preferred_language, -- ✅ Adicionar
    is_active,
    firebase_uid,
    created_at,
    updated_at
  ) VALUES (
    'admin@example.com',
    'admin',
    'Admin User',
    '2000-01-01',           -- ✅ Valor default
    '+55 00 00000-0000',    -- ✅ Valor default
    'pt-BR',                -- ✅ Valor default
    true,
    'pending-first-login',
    NOW(),
    NOW()
  )
  ON CONFLICT (email)
  DO UPDATE SET
    role = 'admin',
    updated_at = NOW()
`);
```

Depois:

```bash
git add .
git commit -m "fix: add required fields to user migration"
git push
```

No Coolify, clique em **"Redeploy"**.

---

### 4. ❌ Hardcoded Database Credentials

**Sintoma:** Mesmo com variáveis de ambiente corretas, backend conecta no banco errado ou dá erro de conexão.

**Causa:** Credenciais hardcoded em `data-source.ts`.

**Solução:**

Verifique o arquivo:

```typescript
// back-end/src/config/data-source.ts
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,        // ✅ Use variáveis de ambiente
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // ❌ NUNCA faça isso:
  // host: 'localhost',
  // password: 'senha123',

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false, // ✅ Sempre false em produção
  logging: process.env.NODE_ENV !== 'production',
});
```

**Validação adicional no código:**

```typescript
// back-end/src/config/data-source.ts
const requiredEnvVars = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`❌ Variável de ambiente obrigatória ausente: ${envVar}`);
  }
}
```

---

### 5. ❌ CORS Error

**Sintoma:** Frontend recebe erro:

```
Access to fetch at 'http://backend...' from origin 'http://frontend...' has been blocked by CORS policy
```

**Causa:** Backend não configurado para aceitar requisições do domínio do frontend.

**Solução:**

Configure o CORS no `main.ts`:

```typescript
// back-end/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Configurar CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

**Certifique-se de ter a variável correta:**

```bash
FRONTEND_URL=http://<dominio-do-frontend-no-coolify>
```

Depois, **Restart** o backend no Coolify.

---

### 6. ❌ Health Check Failing

**Sintoma:** Container fica reiniciando constantemente ou marcado como `unhealthy`.

**Causa:** Health check configurado incorretamente ou aplicação demorando para iniciar.

**Solução 1 - Aumentar start-period:**

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1
```

**Solução 2 - Criar script de health check customizado:**

```javascript
// back-end/healthcheck.js
const http = require('http');

const options = {
  host: 'localhost',
  port: 3000,
  path: '/',
  timeout: 2000,
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', () => {
  process.exit(1);
});

request.end();
```

No Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD node healthcheck.js
```

---

### 7. ❌ TypeORM Entity Not Found

**Sintoma:**

```
EntityMetadataNotFoundError: No metadata for "User" was found
```

**Causa:** Caminho das entities não está correto no `data-source.ts`.

**Solução:**

```typescript
// back-end/src/config/data-source.ts
export const AppDataSource = new DataSource({
  // ... outras configs

  // ✅ Use caminhos relativos à raiz do projeto
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],

  // Se isso não funcionar, tente:
  // entities: ['dist/**/*.entity.js'],
  // migrations: ['dist/migrations/*.js'],
});
```

---

## ✅ Checklist Final

### Database

- [ ] PostgreSQL deployado e rodando
- [ ] Hostname interno anotado
- [ ] Credenciais configuradas corretamente
- [ ] Consegue conectar no banco via cliente (opcional)

### Backend

- [ ] Aplicação deployada com sucesso
- [ ] Todas as variáveis de ambiente configuradas
- [ ] `FIREBASE_PRIVATE_KEY` no formato correto (com `\n` literal)
- [ ] `DB_HOST` usando hostname interno do Coolify
- [ ] Migrations executadas com sucesso
- [ ] Health check passando
- [ ] Logs não mostram erros

### Testes

- [ ] Endpoint raiz (`/`) retorna "Hello World!"
- [ ] Firebase Admin inicializado sem erros
- [ ] Consegue criar/ler dados no banco
- [ ] CORS configurado (após deploy do frontend)

---

## 🔄 Workflow de Deploy

### Quando Fazer Redeploy vs Restart

**Restart (apenas reinicia o container):**
- ✅ Mudou variáveis de ambiente de runtime
- ✅ Ajustou configuração de CORS
- ✅ Alterou `FRONTEND_URL` ou `BACKEND_URL`

**Redeploy (rebuild completo):**
- ✅ Mudou código da aplicação
- ✅ Mudou Dockerfile
- ✅ Adicionou/modificou migrations
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

### Executar Migrations

**Após cada deploy que adiciona novas migrations:**

```bash
docker exec <container-id> npm run migration:run
```

Ou configure **Post-Deployment Command** no Coolify para executar automaticamente.

---

## 📝 Variáveis de Ambiente - Resumo

```bash
# Ambiente
NODE_ENV=production
PORT=3000

# Database (hostname INTERNO do Coolify)
DB_HOST=<hostname-interno>
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<senha>
DB_DATABASE=postgres

# URLs
FRONTEND_URL=<dominio-frontend>
BACKEND_URL=<dominio-backend>

# Firebase Admin SDK
FIREBASE_PROJECT_ID=<project-id>
FIREBASE_CLIENT_EMAIL=<service-account-email>
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

---

## 🎉 Conclusão

Após seguir todos os passos, seu backend estará rodando em produção!

**Teste final:**

```bash
curl http://<seu-dominio-backend>
# Deve retornar: Hello World!
```

**Próximos passos:**

1. Fazer deploy do frontend
2. Atualizar `FRONTEND_URL` no backend
3. Testar integração completa

---

## 🆘 Precisa de Ajuda?

Se encontrar algum erro não documentado aqui:

1. Verifique os **logs do container** no Coolify
2. Verifique o **log de build** no Coolify
3. Compare com os erros documentados acima
4. Verifique se seguiu todos os passos do checklist

---

**Última atualização:** 31/10/2025
**Projeto:** ScaleX - Backend API
