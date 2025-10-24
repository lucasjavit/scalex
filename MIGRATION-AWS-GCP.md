# 🔄 Guia de Migração: Digital Ocean → AWS/GCP

Este guia mostra como migrar sua aplicação ScaleX do Digital Ocean para AWS ou GCP quando estiver pronto para escalar.

---

## 📊 Quando Migrar?

Considere migrar quando:
- ✅ Mais de 1000 usuários ativos mensais
- ✅ Necessidade de múltiplas regiões geográficas
- ✅ Requisitos de compliance específicos (SOC2, HIPAA, etc)
- ✅ Necessidade de serviços avançados (ML, AI, Analytics)
- ✅ Budget > $500/mês (onde AWS/GCP se tornam mais eficientes)

---

## 🔵 Migração para AWS

### Arquitetura Alvo

```
┌─────────────────────────────────────────────────────────┐
│                         AWS                              │
│                                                          │
│  ┌─────────────┐    ┌──────────────┐   ┌────────────┐  │
│  │     S3      │    │  CloudFront  │   │   Route53  │  │
│  │  (Storage)  │←───│     (CDN)    │←──│    (DNS)   │  │
│  └─────────────┘    └──────────────┘   └────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Application Load Balancer               │  │
│  └──────────────────────────────────────────────────┘  │
│           │                            │                │
│  ┌────────▼────────┐         ┌────────▼────────┐      │
│  │  ECS/Fargate    │         │  ECS/Fargate    │      │
│  │   (Backend 1)   │         │   (Backend 2)   │      │
│  └─────────────────┘         └─────────────────┘      │
│           │                            │                │
│           └────────────┬───────────────┘                │
│                        │                                │
│              ┌─────────▼─────────┐                     │
│              │   RDS PostgreSQL  │                     │
│              │  (Multi-AZ)       │                     │
│              └───────────────────┘                     │
│                                                          │
│  ┌─────────────────────────────────────────────────┐  │
│  │   EC2 (Jitsi) ou AWS Chime SDK                  │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Passo 1: Migrar Frontend (S3 + CloudFront)

#### 1.1 Criar Bucket S3

```bash
# Instale AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure credenciais
aws configure
# AWS Access Key ID: AKIA...
# AWS Secret Access Key: ...
# Default region: us-east-1
# Default output format: json

# Crie bucket
aws s3 mb s3://scalex-frontend-prod

# Configure para website estático
aws s3 website s3://scalex-frontend-prod \
  --index-document index.html \
  --error-document index.html

# Faça upload do build
cd front-end
npm run build
aws s3 sync dist/ s3://scalex-frontend-prod --delete
```

#### 1.2 Configurar CloudFront

```bash
# Crie distribuição CloudFront
aws cloudfront create-distribution \
  --origin-domain-name scalex-frontend-prod.s3.us-east-1.amazonaws.com \
  --default-root-object index.html

# Anote o Domain Name: d1234abcd.cloudfront.net
```

**OU via Console AWS:**
1. CloudFront → Create Distribution
2. Origin: `scalex-frontend-prod.s3.us-east-1.amazonaws.com`
3. Viewer Protocol Policy: Redirect HTTP to HTTPS
4. Compress Objects Automatically: Yes
5. Default Root Object: `index.html`
6. Create Distribution

#### 1.3 Configurar Domínio Customizado

```bash
# Crie certificado SSL (deve ser em us-east-1)
aws acm request-certificate \
  --domain-name app.seudominio.com \
  --validation-method DNS \
  --region us-east-1

# Configure Route 53
aws route53 create-hosted-zone \
  --name seudominio.com \
  --caller-reference $(date +%s)

# Adicione record para CloudFront
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234... \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "app.seudominio.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "d1234abcd.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

### Passo 2: Migrar Backend (ECS Fargate)

#### 2.1 Criar Dockerfile (se ainda não tem)

```dockerfile
# back-end/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000
CMD ["node", "dist/main"]
```

#### 2.2 Push para ECR (Elastic Container Registry)

```bash
# Crie repositório ECR
aws ecr create-repository --repository-name scalex-backend

# Faça login no ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.us-east-1.amazonaws.com

# Build e push
cd back-end
docker build -t scalex-backend .
docker tag scalex-backend:latest \
  123456789012.dkr.ecr.us-east-1.amazonaws.com/scalex-backend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/scalex-backend:latest
```

#### 2.3 Criar RDS PostgreSQL

```bash
# Crie subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name scalex-db-subnet \
  --db-subnet-group-description "ScaleX DB Subnet" \
  --subnet-ids subnet-12345 subnet-67890

# Crie RDS instance
aws rds create-db-instance \
  --db-instance-identifier scalex-postgres \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username scalex_admin \
  --master-user-password "SENHA_SUPER_SEGURA" \
  --allocated-storage 20 \
  --db-subnet-group-name scalex-db-subnet \
  --vpc-security-group-ids sg-12345678 \
  --backup-retention-period 7 \
  --publicly-accessible false

# Aguarde criação (5-10 minutos)
aws rds wait db-instance-available --db-instance-identifier scalex-postgres

# Obtenha endpoint
aws rds describe-db-instances \
  --db-instance-identifier scalex-postgres \
  --query 'DBInstances[0].Endpoint.Address'
```

#### 2.4 Migrar Dados do PostgreSQL

**No seu Droplet Digital Ocean:**
```bash
# Exporte o banco
pg_dump -U scalex_user -h localhost scalex > scalex_dump.sql

# Baixe para sua máquina local
scp root@IP_DO_DROPLET:/root/scalex_dump.sql ./
```

**Na sua máquina local:**
```bash
# Importe para RDS (use endpoint do RDS)
psql -h scalex-postgres.abc123.us-east-1.rds.amazonaws.com \
  -U scalex_admin -d postgres < scalex_dump.sql
```

#### 2.5 Criar Task Definition ECS

```bash
# Crie arquivo task-definition.json
cat > task-definition.json <<EOF
{
  "family": "scalex-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [{
    "name": "scalex-backend",
    "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/scalex-backend:latest",
    "portMappings": [{
      "containerPort": 3000,
      "protocol": "tcp"
    }],
    "environment": [
      {"name": "NODE_ENV", "value": "production"},
      {"name": "PORT", "value": "3000"},
      {"name": "DB_HOST", "value": "scalex-postgres.abc123.us-east-1.rds.amazonaws.com"},
      {"name": "DB_PORT", "value": "5432"},
      {"name": "DB_USERNAME", "value": "scalex_admin"},
      {"name": "DB_DATABASE", "value": "scalex"}
    ],
    "secrets": [
      {
        "name": "DB_PASSWORD",
        "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:scalex/db-password"
      }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/scalex-backend",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }]
}
EOF

# Registre task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

#### 2.6 Criar ECS Service com Load Balancer

```bash
# Crie Application Load Balancer
aws elbv2 create-load-balancer \
  --name scalex-alb \
  --subnets subnet-12345 subnet-67890 \
  --security-groups sg-12345678 \
  --scheme internet-facing

# Crie Target Group
aws elbv2 create-target-group \
  --name scalex-backend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-12345 \
  --target-type ip \
  --health-check-path /health

# Crie Listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...

# Crie ECS Cluster
aws ecs create-cluster --cluster-name scalex-cluster

# Crie ECS Service
aws ecs create-service \
  --cluster scalex-cluster \
  --service-name scalex-backend-service \
  --task-definition scalex-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-12345678],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=scalex-backend,containerPort=3000"
```

### Passo 3: Migrar Jitsi (ou usar AWS Chime)

#### Opção A: Manter Jitsi em EC2

```bash
# Crie EC2 instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name scalex-key \
  --security-group-ids sg-12345678 \
  --subnet-id subnet-12345 \
  --user-data file://jitsi-setup.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=scalex-jitsi}]'
```

**jitsi-setup.sh:**
```bash
#!/bin/bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose

# Clone config e inicie Jitsi
git clone https://github.com/SEU_USUARIO/scalex.git /opt/scalex
cd /opt/scalex
docker-compose up -d
```

#### Opção B: Migrar para AWS Chime SDK (Recomendado)

```bash
# Instale SDK no backend
cd back-end
npm install @aws-sdk/client-chime-sdk-meetings

# Atualize código para usar Chime
# Ver documentação: https://docs.aws.amazon.com/chime-sdk/
```

**Vantagens do Chime:**
- ✅ Escalabilidade automática
- ✅ Sem gerenciamento de servidor
- ✅ Melhor qualidade de vídeo
- ✅ Pay-per-use (mais barato para começar)

**Custos:**
- $0.0017/min por participante (attendee)
- ~$0.10/hora por participante
- 100 horas/mês = $10/mês (vs $24/mês Jitsi droplet)

### Passo 4: Configurar Auto Scaling

```bash
# Configure auto scaling para ECS
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/scalex-cluster/scalex-backend-service \
  --min-capacity 2 \
  --max-capacity 10

# Crie política de scaling baseada em CPU
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/scalex-cluster/scalex-backend-service \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    }
  }'
```

### Custos Estimados AWS

```
┌──────────────────────────────────────────────────┐
│  INFRAESTRUTURA AWS (Produção)                   │
├──────────────────────────────────────────────────┤
│  S3 + CloudFront (Frontend)     →  $10-20/mês    │
│  ECS Fargate (2 tasks)          →  $30/mês       │
│  RDS PostgreSQL db.t3.micro     →  $15/mês       │
│  Application Load Balancer      →  $16/mês       │
│  AWS Chime SDK                  →  $10-50/mês    │
│  Route 53 (DNS)                 →  $1/mês        │
│  Data Transfer                  →  $10-30/mês    │
├──────────────────────────────────────────────────┤
│  TOTAL:                            $92-162/mês   │
└──────────────────────────────────────────────────┘

Com Reserved Instances (1 ano):
- RDS: $15 → $10/mês (-33%)
- Total: ~$80-140/mês
```

---

## 🟦 Migração para GCP

### Arquitetura Alvo

```
┌─────────────────────────────────────────────────────────┐
│                         GCP                              │
│                                                          │
│  ┌─────────────┐    ┌──────────────┐   ┌────────────┐  │
│  │Cloud Storage│    │  Cloud CDN   │   │ Cloud DNS  │  │
│  │  (Bucket)   │←───│              │←──│            │  │
│  └─────────────┘    └──────────────┘   └────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Cloud Load Balancing                     │  │
│  └──────────────────────────────────────────────────┘  │
│           │                            │                │
│  ┌────────▼────────┐         ┌────────▼────────┐      │
│  │   Cloud Run     │         │   Cloud Run     │      │
│  │   (Backend)     │         │   (Backend)     │      │
│  │  Auto-scaling   │         │  Auto-scaling   │      │
│  └─────────────────┘         └─────────────────┘      │
│           │                            │                │
│           └────────────┬───────────────┘                │
│                        │                                │
│              ┌─────────▼─────────┐                     │
│              │  Cloud SQL        │                     │
│              │  PostgreSQL 15    │                     │
│              └───────────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

### Passo 1: Migrar Frontend (Cloud Storage + CDN)

```bash
# Instale gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Crie bucket
gsutil mb -c STANDARD -l us-east1 gs://scalex-frontend

# Configure para website
gsutil web set -m index.html -e index.html gs://scalex-frontend

# Torne público
gsutil iam ch allUsers:objectViewer gs://scalex-frontend

# Upload do build
cd front-end
npm run build
gsutil -m rsync -r -d dist/ gs://scalex-frontend

# Configure CDN
gcloud compute backend-buckets create scalex-frontend-backend \
  --gcs-bucket-name=scalex-frontend \
  --enable-cdn
```

### Passo 2: Migrar Backend (Cloud Run)

```bash
# Build e push para Container Registry
cd back-end
gcloud builds submit --tag gcr.io/SEU_PROJECT_ID/scalex-backend

# Deploy no Cloud Run
gcloud run deploy scalex-backend \
  --image gcr.io/SEU_PROJECT_ID/scalex-backend \
  --platform managed \
  --region us-east1 \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 10 \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars "NODE_ENV=production,DB_HOST=/cloudsql/SEU_PROJECT_ID:us-east1:scalex-db" \
  --set-secrets "DB_PASSWORD=scalex-db-password:latest"
```

### Passo 3: Migrar Database (Cloud SQL)

```bash
# Crie instância Cloud SQL
gcloud sql instances create scalex-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-east1 \
  --backup \
  --backup-start-time=03:00

# Crie database
gcloud sql databases create scalex --instance=scalex-db

# Crie usuário
gcloud sql users create scalex_admin \
  --instance=scalex-db \
  --password=SENHA_SUPER_SEGURA

# Importe dados
gcloud sql import sql scalex-db gs://scalex-backups/scalex_dump.sql \
  --database=scalex
```

### Custos Estimados GCP

```
┌──────────────────────────────────────────────────┐
│  INFRAESTRUTURA GCP (Produção)                   │
├──────────────────────────────────────────────────┤
│  Cloud Storage + CDN            →  $8-15/mês     │
│  Cloud Run (serverless)         →  $15-40/mês    │
│  Cloud SQL db-f1-micro          →  $7/mês        │
│  Cloud Load Balancing           →  $18/mês       │
│  Cloud DNS                      →  $0.40/mês     │
│  Data Transfer                  →  $10-20/mês    │
├──────────────────────────────────────────────────┤
│  TOTAL:                            $58-100/mês   │
└──────────────────────────────────────────────────┘
```

---

## 📊 Comparação Final

| Recurso | Digital Ocean | AWS | GCP |
|---------|--------------|-----|-----|
| **Frontend** | $5 (Spaces) | $10-20 (S3+CF) | $8-15 (Storage+CDN) |
| **Backend** | $12 (Droplet) | $30 (Fargate) | $15-40 (Cloud Run) |
| **Database** | Incluído | $15 (RDS) | $7 (Cloud SQL) |
| **Load Balancer** | +$12 | $16 | $18 |
| **Vídeo** | $24 (Jitsi) | $10-50 (Chime) | Use Jitsi EC2 |
| **TOTAL** | **$41-56** | **$92-162** | **$58-100** |

---

## 🔄 Estratégia de Migração Recomendada

### Fase 1: Validação (Digital Ocean)
- ✅ MVP com Digital Ocean
- ✅ Validar produto-mercado
- ✅ Custo: $41-56/mês
- ✅ Tempo: 0-6 meses

### Fase 2: Crescimento (Híbrido)
- Frontend: Migrar para AWS CloudFront ou GCP CDN
- Backend: Manter no DO ou migrar para GCP Cloud Run
- Database: Upgrade para Managed Database DO ou Cloud SQL
- Custo: $60-100/mês
- Tempo: 6-12 meses

### Fase 3: Escala (AWS ou GCP)
- Migração completa quando atingir 1000+ usuários
- Auto-scaling configurado
- Múltiplas regiões
- Custo: $100-500/mês
- Tempo: 12+ meses

---

## ✅ Checklist de Migração

### Pré-Migração
- [ ] Backup completo do banco de dados
- [ ] Documentar todas as variáveis de ambiente
- [ ] Testar aplicação localmente com Docker
- [ ] Criar conta na cloud provider alvo
- [ ] Configurar billing alerts

### Durante Migração
- [ ] Migrar frontend primeiro (menor risco)
- [ ] Testar em domínio temporário
- [ ] Migrar database com downtime planejado
- [ ] Migrar backend gradualmente (blue-green)
- [ ] Atualizar DNS com TTL baixo

### Pós-Migração
- [ ] Monitorar logs por 48h
- [ ] Verificar performance (latência, throughput)
- [ ] Testar todas as features críticas
- [ ] Configurar backups automatizados
- [ ] Configurar alertas de monitoramento
- [ ] Manter ambiente antigo por 1 semana
- [ ] Cancelar recursos antigos

---

## 🆘 Rollback Plan

Se algo der errado:

```bash
# 1. Reverter DNS para Digital Ocean
# Altere A records para apontar para IPs antigos

# 2. Restaurar database se necessário
# No Digital Ocean:
psql -U scalex_user scalex < backup_pre_migration.sql

# 3. Reiniciar serviços
pm2 restart all
docker-compose restart
```

---

## 📚 Recursos Úteis

### AWS
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [RDS Migration Guide](https://docs.aws.amazon.com/dms/latest/userguide/)

### GCP
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Migration](https://cloud.google.com/sql/docs/mysql/migrate-data)
- [Best Practices](https://cloud.google.com/architecture/framework)

---

🎯 **Recomendação Final:**

Comece com **Digital Ocean** por 6-12 meses. Quando atingir 500+ usuários ativos ou $5k+ MRR, considere migrar para **GCP Cloud Run** (melhor custo-benefício) ou **AWS** (se precisar de serviços específicos como Chime, Cognito, etc).

A arquitetura atual com Docker facilita muito a migração futura!
