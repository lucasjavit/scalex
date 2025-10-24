# 🚀 Guia de Deploy - ScaleX no Digital Ocean

## 💰 Custo Total Estimado: $41-56/mês

Este guia mostra como fazer deploy da aplicação ScaleX no Digital Ocean com uma arquitetura simples e pronta para escalar.

---

## 📋 Pré-requisitos

- [ ] Conta no Digital Ocean ([Crie aqui](https://www.digitalocean.com))
- [ ] Domínio próprio (opcional, mas recomendado)
- [ ] Conta Firebase (já configurada)
- [ ] Git instalado localmente

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                   Digital Ocean                      │
│                                                      │
│  ┌──────────────┐      ┌──────────────┐            │
│  │   Spaces     │      │  Droplet #1  │            │
│  │  (Frontend)  │      │   (Backend)  │            │
│  │   + CDN      │      │  + PostgreSQL│            │
│  │              │      │              │            │
│  │   $5/mês     │      │   $12/mês    │            │
│  └──────────────┘      └──────────────┘            │
│                                                      │
│                       ┌──────────────┐              │
│                       │  Droplet #2  │              │
│                       │    (Jitsi)   │              │
│                       │   4GB RAM    │              │
│                       │              │              │
│                       │   $24/mês    │              │
│                       └──────────────┘              │
│                                                      │
│  ┌──────────────────────────────────────────┐      │
│  │  Load Balancer (opcional - $12/mês)      │      │
│  └──────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────┘
```

---

## 📦 PARTE 1: Setup Inicial

### 1.1 Criar Conta e Configurar SSH

```bash
# 1. Gere uma chave SSH (se não tiver)
ssh-keygen -t ed25519 -C "seu-email@example.com"

# 2. Copie a chave pública
cat ~/.ssh/id_ed25519.pub
```

**No Digital Ocean:**
1. Acesse: Settings → Security → SSH Keys
2. Clique em "Add SSH Key"
3. Cole sua chave pública
4. Nomeie como "ScaleX Deploy Key"

---

## 🖥️ PARTE 2: Backend + Database (Droplet #1)

### 2.1 Criar Droplet para Backend

**No painel do Digital Ocean:**
1. Create → Droplets
2. Escolha:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic
   - **CPU**: Regular - $12/mês (2GB RAM, 1 vCPU, 50GB SSD)
   - **Datacenter**: São Paulo (LATAM) ou New York (USA)
   - **Authentication**: SSH Key (selecione a que criou)
   - **Hostname**: `scalex-backend`
3. Create Droplet

### 2.2 Configurar o Servidor Backend

```bash
# Conecte ao droplet
ssh root@SEU_IP_BACKEND

# Atualize o sistema
apt update && apt upgrade -y

# Instale Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Instale PostgreSQL 15
apt install -y postgresql postgresql-contrib

# Instale PM2 (gerenciador de processos)
npm install -g pm2

# Instale Nginx (reverse proxy)
apt install -y nginx

# Configure o firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### 2.3 Configurar PostgreSQL

```bash
# Entre no PostgreSQL
sudo -u postgres psql

# Dentro do psql, execute:
CREATE DATABASE scalex;
CREATE USER scalex_user WITH ENCRYPTED PASSWORD 'SENHA_SUPER_SEGURA_AQUI';
GRANT ALL PRIVILEGES ON DATABASE scalex TO scalex_user;
\q

# Edite o arquivo de configuração para aceitar conexões locais
nano /etc/postgresql/15/main/pg_hba.conf
```

Adicione esta linha (ou modifique a existente):
```
local   all             scalex_user                             md5
```

```bash
# Reinicie o PostgreSQL
systemctl restart postgresql
```

### 2.4 Deploy do Backend NestJS

```bash
# Crie diretório para a aplicação
mkdir -p /var/www/scalex-backend
cd /var/www/scalex-backend

# Clone o repositório (use seu repo)
git clone https://github.com/SEU_USUARIO/scalex.git .

# Entre na pasta do backend
cd back-end

# Instale dependências
npm install

# Crie o arquivo .env
nano .env
```

**Conteúdo do `.env`:**
```env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=scalex_user
DB_PASSWORD=SENHA_SUPER_SEGURA_AQUI
DB_DATABASE=scalex

# Firebase (copie do seu projeto)
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_CLIENT_EMAIL=seu-service-account@...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# URLs
FRONTEND_URL=https://seudominio.com
BACKEND_URL=https://api.seudominio.com
```

```bash
# Build da aplicação
npm run build

# Inicie com PM2
pm2 start dist/main.js --name scalex-backend

# Configure PM2 para iniciar no boot
pm2 startup systemd
pm2 save

# Verifique se está rodando
pm2 status
pm2 logs scalex-backend
```

### 2.5 Configurar Nginx como Reverse Proxy

```bash
nano /etc/nginx/sites-available/scalex-backend
```

**Conteúdo:**
```nginx
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ative o site
ln -s /etc/nginx/sites-available/scalex-backend /etc/nginx/sites-enabled/

# Teste a configuração
nginx -t

# Reinicie o Nginx
systemctl restart nginx
```

### 2.6 Configurar SSL com Let's Encrypt

```bash
# Instale Certbot
apt install -y certbot python3-certbot-nginx

# Obtenha certificado SSL
certbot --nginx -d api.seudominio.com

# Selecione opção 2 (redirect HTTP to HTTPS)
```

---

## 🎥 PARTE 3: Jitsi Meet (Droplet #2)

### 3.1 Criar Droplet para Jitsi

**No painel do Digital Ocean:**
1. Create → Droplets
2. Escolha:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic
   - **CPU**: Regular - $24/mês (4GB RAM, 2 vCPU, 80GB SSD)
   - **Datacenter**: Mesmo que o backend
   - **Authentication**: SSH Key
   - **Hostname**: `scalex-jitsi`
3. Create Droplet

### 3.2 Instalar Docker e Docker Compose

```bash
# Conecte ao droplet
ssh root@SEU_IP_JITSI

# Atualize o sistema
apt update && apt upgrade -y

# Instale Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instale Docker Compose
apt install -y docker-compose

# Configure o firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 10000/udp
ufw allow 4443/tcp
ufw enable
```

### 3.3 Deploy do Jitsi com Docker Compose

```bash
# Crie diretório para Jitsi
mkdir -p /var/www/jitsi
cd /var/www/jitsi

# Clone a configuração do seu projeto
git clone https://github.com/SEU_USUARIO/scalex.git temp
cp temp/docker-compose.yml .
cp -r temp/jitsi-cfg .
rm -rf temp

# Edite as variáveis de ambiente
nano docker-compose.yml
```

**Modifique estas linhas:**
```yaml
environment:
  - PUBLIC_URL=https://meet.seudominio.com
  - XMPP_WEBSOCKET=wss://meet.seudominio.com/xmpp-websocket
```

```bash
# Inicie o Jitsi
docker-compose up -d

# Verifique os logs
docker-compose logs -f
```

### 3.4 Configurar Nginx para Jitsi

```bash
apt install -y nginx

nano /etc/nginx/sites-available/jitsi
```

**Conteúdo:**
```nginx
server {
    listen 80;
    server_name meet.seudominio.com;

    location / {
        proxy_pass https://localhost:8443;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_read_timeout 86400;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/jitsi /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Configure SSL
certbot --nginx -d meet.seudominio.com
```

---

## 🌐 PARTE 4: Frontend (Spaces + CDN)

### 4.1 Criar Space (Object Storage)

**No painel do Digital Ocean:**
1. Create → Spaces
2. Escolha:
   - **Datacenter**: Mesmo que backend
   - **Enable CDN**: ✅ YES
   - **Name**: `scalex-frontend`
   - **Plan**: $5/mês (250GB storage, 1TB transfer)
3. Create Space

### 4.2 Configurar Access Keys

1. API → Spaces Keys → Generate New Key
2. Salve:
   - **Access Key ID**: `DO00ABC...`
   - **Secret Key**: `xyz123...` (só aparece uma vez!)

### 4.3 Build e Deploy do Frontend

**No seu computador local:**

```bash
cd front-end

# Instale as dependências
npm install

# Configure as variáveis de ambiente para produção
nano .env.production
```

**Conteúdo do `.env.production`:**
```env
VITE_API_URL=https://api.seudominio.com
VITE_JITSI_URL=https://meet.seudominio.com

# Firebase (suas credenciais)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=scalex-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=scalex-xxx
VITE_FIREBASE_STORAGE_BUCKET=scalex-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abc123
```

```bash
# Build de produção
npm run build

# Instale s3cmd para upload
sudo apt install s3cmd  # Linux
brew install s3cmd      # Mac
```

**Configure o s3cmd:**
```bash
s3cmd --configure
```

Preencha:
- **Access Key**: `DO00ABC...`
- **Secret Key**: `xyz123...`
- **S3 Endpoint**: `nyc3.digitaloceanspaces.com` (substitua pelo seu datacenter)
- **DNS-style**: `%(bucket)s.nyc3.digitaloceanspaces.com`

```bash
# Faça upload do build
s3cmd sync --acl-public --delete-removed dist/ s3://scalex-frontend/

# Configure index.html como página padrão
s3cmd modify --add-header="Content-Type:text/html" s3://scalex-frontend/index.html
```

### 4.4 Configurar CDN e Domínio

**No painel do Digital Ocean:**
1. Acesse seu Space `scalex-frontend`
2. Settings → CDN
3. Custom Domain: `app.seudominio.com`
4. Add Custom Domain

**No seu provedor de DNS (ex: Cloudflare, Namecheap):**
```
CNAME   app.seudominio.com   →   scalex-frontend.nyc3.cdn.digitaloceanspaces.com
```

### 4.5 Script de Deploy Automático

Crie um script para facilitar deploys futuros:

```bash
# front-end/deploy.sh
#!/bin/bash

echo "🚀 Starting deployment..."

# Build
echo "📦 Building..."
npm run build

# Upload to Spaces
echo "☁️ Uploading to Digital Ocean Spaces..."
s3cmd sync --acl-public --delete-removed dist/ s3://scalex-frontend/

# Fix content types
echo "🔧 Fixing content types..."
s3cmd modify --recursive --add-header="Cache-Control:public, max-age=31536000" 's3://scalex-frontend/assets/'
s3cmd modify --add-header="Cache-Control:no-cache" s3://scalex-frontend/index.html

echo "✅ Deployment complete!"
echo "🌐 Visit: https://app.seudominio.com"
```

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🔧 PARTE 5: Configurações DNS Completas

**Configure todos os registros DNS:**

```
A       @                    →   IP_DO_DROPLET_BACKEND
A       api.seudominio.com   →   IP_DO_DROPLET_BACKEND
A       meet.seudominio.com  →   IP_DO_DROPLET_JITSI
CNAME   app.seudominio.com   →   scalex-frontend.nyc3.cdn.digitaloceanspaces.com
```

---

## 🔒 PARTE 6: Segurança e Monitoramento

### 6.1 Configurar Firewall

**No Backend Droplet:**
```bash
ufw status
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw deny 3000/tcp  # Bloqueia acesso direto ao Node.js
ufw enable
```

**No Jitsi Droplet:**
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 10000/udp  # Jitsi video
ufw allow 4443/tcp   # Jitsi fallback
ufw enable
```

### 6.2 Configurar Backups Automáticos

**No painel do Digital Ocean:**
1. Acesse cada Droplet → Backups
2. Enable Backups (+20% do custo do droplet)
   - Backend: +$2.40/mês
   - Jitsi: +$4.80/mês

**Backup do Banco de Dados:**
```bash
# No droplet backend, crie script de backup
nano /root/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump -U scalex_user scalex > $BACKUP_DIR/scalex_$DATE.sql

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "scalex_*.sql" -mtime +7 -delete

echo "Backup completed: scalex_$DATE.sql"
```

```bash
chmod +x /root/backup-db.sh

# Agende backup diário (3 AM)
crontab -e
```

Adicione:
```
0 3 * * * /root/backup-db.sh >> /var/log/backup.log 2>&1
```

### 6.3 Monitoramento com PM2

```bash
# No backend droplet
pm2 install pm2-logrotate

# Configure limites de log
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 📊 PARTE 7: Resumo de Custos

```
┌──────────────────────────────────────────────────┐
│  INFRAESTRUTURA DIGITAL OCEAN                    │
├──────────────────────────────────────────────────┤
│  Frontend (Spaces + CDN)        →  $5.00/mês     │
│  Backend Droplet (2GB)          →  $12.00/mês    │
│  Jitsi Droplet (4GB)            →  $24.00/mês    │
│  Backups (opcional)             →  +$7.20/mês    │
│  Load Balancer (opcional)       →  +$12.00/mês   │
├──────────────────────────────────────────────────┤
│  TOTAL BÁSICO:                     $41.00/mês    │
│  TOTAL COM BACKUPS:                $48.20/mês    │
│  TOTAL COMPLETO:                   $60.20/mês    │
└──────────────────────────────────────────────────┘
```

---

## 🚀 PARTE 8: Comandos Úteis de Manutenção

### Backend

```bash
# Ver logs da aplicação
ssh root@IP_BACKEND
pm2 logs scalex-backend

# Reiniciar aplicação
pm2 restart scalex-backend

# Atualizar código
cd /var/www/scalex-backend/back-end
git pull
npm install
npm run build
pm2 restart scalex-backend

# Ver status do PostgreSQL
systemctl status postgresql
```

### Jitsi

```bash
# Ver logs do Jitsi
ssh root@IP_JITSI
cd /var/www/jitsi
docker-compose logs -f

# Reiniciar Jitsi
docker-compose restart

# Atualizar Jitsi
docker-compose pull
docker-compose up -d
```

### Frontend

```bash
# Deploy local
cd front-end
./deploy.sh

# OU manual
npm run build
s3cmd sync --acl-public dist/ s3://scalex-frontend/
```

---

## 🔄 PARTE 9: CI/CD com GitHub Actions (Opcional)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Digital Ocean

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Backend Droplet
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.BACKEND_HOST }}
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/scalex-backend
            git pull
            cd back-end
            npm install
            npm run build
            pm2 restart scalex-backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Build Frontend
        working-directory: ./front-end
        run: |
          npm install
          npm run build

      - name: Deploy to Spaces
        uses: BetaHuhn/do-spaces-action@v2
        with:
          access_key: ${{ secrets.DO_SPACES_ACCESS_KEY }}
          secret_key: ${{ secrets.DO_SPACES_SECRET_KEY }}
          space_name: scalex-frontend
          space_region: nyc3
          source: front-end/dist
          out_dir: /
```

**Configure os secrets no GitHub:**
- Settings → Secrets → Actions
- Adicione:
  - `BACKEND_HOST`: IP do droplet backend
  - `SSH_PRIVATE_KEY`: Sua chave SSH privada
  - `DO_SPACES_ACCESS_KEY`: Access key do Spaces
  - `DO_SPACES_SECRET_KEY`: Secret key do Spaces

---

## 📈 PARTE 10: Próximos Passos (Quando Crescer)

### Quando ter 500+ usuários simultâneos:

**1. Escalar Backend:**
```bash
# Upgrade do droplet (no painel DO)
$12/mês (2GB) → $24/mês (4GB) → $48/mês (8GB)

# OU adicionar mais droplets + Load Balancer
- 2x Droplets $12 = $24/mês
- 1x Load Balancer = $12/mês
- Total: $36/mês (alta disponibilidade)
```

**2. Database Gerenciado:**
```bash
# Migrar de PostgreSQL local para Managed Database
$15/mês (1GB) → $30/mês (2GB) → $60/mês (4GB)

Benefícios:
- Backups automáticos
- Alta disponibilidade
- Atualizações gerenciadas
```

**3. Múltiplos Servidores Jitsi:**
```bash
# Para muitas chamadas simultâneas
- Jitsi Droplet 1: $24/mês (até 50 chamadas)
- Jitsi Droplet 2: $24/mês (mais 50 chamadas)
- Load Balancer: $12/mês
- Total: $60/mês (100 chamadas simultâneas)
```

---

## ✅ Checklist Final

- [ ] Droplet Backend criado e configurado
- [ ] PostgreSQL instalado e configurado
- [ ] Backend NestJS deployed com PM2
- [ ] Nginx configurado com SSL
- [ ] Droplet Jitsi criado
- [ ] Docker e Jitsi rodando
- [ ] Space criado com CDN
- [ ] Frontend deployed no Space
- [ ] DNS configurado para todos os domínios
- [ ] SSL configurado (Let's Encrypt)
- [ ] Firewall configurado
- [ ] Backups automáticos configurados
- [ ] Monitoramento ativo (PM2)

---

## 🆘 Troubleshooting

### Backend não está acessível
```bash
# Verifique se está rodando
pm2 status

# Verifique logs
pm2 logs scalex-backend

# Verifique Nginx
nginx -t
systemctl status nginx

# Verifique firewall
ufw status
```

### Jitsi não carrega
```bash
# Verifique containers
docker-compose ps

# Verifique logs
docker-compose logs jitsi-web
docker-compose logs jitsi-jvb

# Reinicie tudo
docker-compose restart
```

### Frontend retorna 403
```bash
# Verifique permissões no Space
s3cmd setacl s3://scalex-frontend --acl-public --recursive

# Verifique DNS
dig app.seudominio.com
```

---

## 📚 Recursos Adicionais

- [Digital Ocean Docs](https://docs.digitalocean.com/)
- [Jitsi Meet Handbook](https://jitsi.github.io/handbook/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## 💡 Dicas Importantes

1. **Sempre teste em staging primeiro** - Crie um droplet menor ($6/mês) para testes
2. **Use snapshot antes de mudanças grandes** - No painel DO: Droplet → Snapshots
3. **Configure alertas** - No painel DO: Monitoring → Alerts
4. **Monitore custos** - Settings → Billing → Usage

---

🎉 **Parabéns!** Sua aplicação ScaleX agora está rodando no Digital Ocean por apenas **$41/mês**!
