# Estratégia de Microserviços - ScaleX Platform

## 🎯 Objetivo

Preparar a arquitetura atual para **fácil migração para microserviços**, onde cada módulo pode ser:
- Um **serviço backend independente** (NestJS separado)
- Um **microfrontend separado** (React app independente)
- Deployado e escalado **independentemente**

---

## 📐 Arquitetura de Transição

### Fase Atual: Monolito Modular
```
┌─────────────────────────────────────┐
│         Frontend (React)            │
│  ┌─────────────────────────────┐   │
│  │  Modules (feat-sliced)      │   │
│  │  ├── auth                    │   │
│  │  ├── accounting              │   │
│  │  ├── career                  │   │
│  │  └── ...                     │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
              ↓ API calls
┌─────────────────────────────────────┐
│        Backend (NestJS)             │
│  ┌─────────────────────────────┐   │
│  │  Modules (NestJS)           │   │
│  │  ├── AuthModule              │   │
│  │  ├── AccountingModule        │   │
│  │  ├── CareerModule            │   │
│  │  └── ...                     │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
              ↓
      ┌───────────────┐
      │   PostgreSQL  │
      └───────────────┘
```

### Fase Futura: Microserviços
```
┌────────────────────────────────────────────────────────┐
│              Frontend Shell (React)                     │
│         Module Federation / Single-SPA                  │
└────────────────────────────────────────────────────────┘
    ↓           ↓           ↓           ↓           ↓
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  Auth   │ │Accounting│ │ Career  │ │ English │ │  Jobs   │
│  React  │ │  React   │ │  React  │ │  React  │ │  React  │
│  App    │ │   App    │ │   App   │ │   App   │ │   App   │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
    ↓           ↓           ↓           ↓           ↓
┌─────────────────────────────────────────────────────────┐
│                API Gateway (NGINX/Kong)                  │
└─────────────────────────────────────────────────────────┘
    ↓           ↓           ↓           ↓           ↓
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  Auth   │ │Accounting│ │ Career  │ │ English │ │  Jobs   │
│ Service │ │ Service  │ │ Service │ │ Service │ │ Service │
│ (NestJS)│ │ (NestJS) │ │(NestJS) │ │(NestJS) │ │(NestJS) │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
    ↓           ↓           ↓           ↓           ↓
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  Auth   │ │Accounting│ │ Career  │ │ English │ │  Jobs   │
│   DB    │ │    DB    │ │   DB    │ │   DB    │ │   DB    │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘

┌─────────────────────────────────────────────────────────┐
│     Message Broker (RabbitMQ / Kafka / Redis)           │
│     Para comunicação assíncrona entre serviços          │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ Estrutura de Pastas: Microfrontend Ready

### Frontend Structure (Cada módulo independente)
```
scalex/
├── packages/                          # Monorepo (Turborepo/Nx)
│   ├── shell/                         # Frontend Shell (Host)
│   │   ├── src/
│   │   │   ├── App.jsx
│   │   │   ├── ModuleLoader.jsx      # Carrega microfrontends
│   │   │   ├── routes/
│   │   │   │   └── AppRoutes.jsx     # Rotas dinâmicas
│   │   │   └── shared/               # Compartilhado entre módulos
│   │   │       ├── components/
│   │   │       ├── hooks/
│   │   │       └── utils/
│   │   ├── package.json
│   │   └── vite.config.js            # Module Federation
│   │
│   ├── auth-module/                   # Módulo 1: Autenticação
│   │   ├── src/
│   │   │   ├── index.js              # Export do módulo
│   │   │   ├── config.js             # Configuração do módulo
│   │   │   ├── routes.jsx            # Rotas internas
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   │   └── authApi.js        # API client próprio
│   │   │   └── store/                # Estado local (se necessário)
│   │   ├── package.json              # Dependências isoladas
│   │   ├── vite.config.js            # Expose como microfrontend
│   │   └── .env                      # Env vars próprias
│   │
│   ├── accounting-module/             # Módulo 2: Contabilidade
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── config.js
│   │   │   ├── routes.jsx
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   │   └── accountingApi.js
│   │   │   └── store/
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   ├── career-module/                 # Módulo 3: Consultoria
│   ├── english-lessons-module/        # Módulo 4: Aulas
│   ├── english-conversation-module/   # Módulo 5: Conversação
│   ├── jobs-module/                   # Módulo 6: Vagas
│   ├── insurance-module/              # Módulo 7: Seguros
│   ├── banking-module/                # Módulo 8: Banco
│   │
│   └── shared-lib/                    # Biblioteca compartilhada
│       ├── src/
│       │   ├── components/            # Componentes reutilizáveis
│       │   ├── hooks/                 # Hooks compartilhados
│       │   ├── utils/                 # Utilitários
│       │   └── theme/                 # Tema Tailwind
│       └── package.json
│
├── services/                          # Backend Microservices
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   └── shared/
│   │   ├── package.json
│   │   ├── .env
│   │   └── Dockerfile
│   │
│   ├── accounting-service/
│   ├── career-service/
│   ├── english-lessons-service/
│   ├── english-conversation-service/
│   ├── jobs-service/
│   ├── insurance-service/
│   ├── banking-service/
│   │
│   └── shared-lib/                    # Biblioteca compartilhada backend
│       ├── src/
│       │   ├── guards/
│       │   ├── interceptors/
│       │   ├── decorators/
│       │   └── utils/
│       └── package.json
│
├── infrastructure/
│   ├── nginx/                         # API Gateway config
│   ├── docker-compose.yml             # Local development
│   ├── kubernetes/                    # K8s configs (futuro)
│   └── terraform/                     # IaC (futuro)
│
├── package.json                       # Root package.json (monorepo)
├── turbo.json                         # Turborepo config
└── pnpm-workspace.yaml                # PNPM workspaces
```

---

## 📦 Template de Módulo Frontend

### 1. Estrutura de um Módulo
```
packages/accounting-module/
├── src/
│   ├── index.js                       # Entry point (exported)
│   ├── config.js                      # Module config
│   ├── routes.jsx                     # Internal routes
│   ├── components/
│   │   ├── AccountantCard.jsx
│   │   └── CNPJForm.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   └── AccountantsList.jsx
│   ├── services/
│   │   └── accountingApi.js           # API client
│   ├── store/                         # Redux/Zustand (opcional)
│   │   └── accountingStore.js
│   └── assets/
│       └── images/
├── public/
├── package.json
├── vite.config.js                     # Module Federation
├── .env.local
└── README.md
```

### 2. config.js (Cada módulo)
```javascript
// packages/accounting-module/src/config.js

export const moduleConfig = {
  name: 'accounting',
  version: '1.0.0',
  displayName: 'Contabilidade',
  icon: '📊',
  baseRoute: '/accounting',

  // API endpoint (pode ser diferente para cada módulo)
  apiBaseUrl: process.env.VITE_ACCOUNTING_API_URL || 'http://localhost:3001',

  // Permissões necessárias
  requiredRoles: ['user', 'premium'],

  // Feature flags
  features: {
    cnpjCreation: true,
    accountantSelection: true,
    documentUpload: true,
  },

  // Navegação interna do módulo
  navigation: [
    { path: '/accounting', label: 'Dashboard', icon: '📊' },
    { path: '/accounting/accountants', label: 'Contadores', icon: '👨‍💼' },
    { path: '/accounting/cnpj', label: 'Meu CNPJ', icon: '🏢' },
    { path: '/accounting/documents', label: 'Documentos', icon: '📄' },
  ],
};
```

### 3. index.js (Export do módulo)
```javascript
// packages/accounting-module/src/index.js

/**
 * Module Entry Point
 * Este arquivo exporta o módulo para ser carregado pelo Shell Application
 */

import routes from './routes';
import { moduleConfig } from './config';

export default {
  name: moduleConfig.name,
  version: moduleConfig.version,
  routes,
  // Lazy load para melhor performance
  load: () => import('./App'),
};

export { moduleConfig };
```

### 4. routes.jsx (Rotas internas)
```javascript
// packages/accounting-module/src/routes.jsx

import { Route, Routes } from 'react-router-dom';
import { lazy } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const AccountantsList = lazy(() => import('./pages/AccountantsList'));
const CNPJSetup = lazy(() => import('./pages/CNPJSetup'));
const Documents = lazy(() => import('./pages/Documents'));

export default function AccountingRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/accountants" element={<AccountantsList />} />
      <Route path="/cnpj" element={<CNPJSetup />} />
      <Route path="/documents" element={<Documents />} />
    </Routes>
  );
}
```

### 5. accountingApi.js (API Client isolado)
```javascript
// packages/accounting-module/src/services/accountingApi.js

import axios from 'axios';
import { moduleConfig } from '../config';

const api = axios.create({
  baseURL: moduleConfig.apiBaseUrl,
  timeout: 10000,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const accountingService = {
  // CNPJ
  async createCNPJ(data) {
    return api.post('/api/accounting/cnpj', data);
  },

  async getCNPJ(userId) {
    return api.get(`/api/accounting/cnpj/${userId}`);
  },

  // Accountants
  async getAccountants() {
    return api.get('/api/accounting/accountants');
  },

  async assignAccountant(userId, accountantId) {
    return api.post('/api/accounting/assign', { userId, accountantId });
  },

  async changeAccountant(userId, newAccountantId) {
    return api.put('/api/accounting/change-accountant', { userId, newAccountantId });
  },

  // Documents
  async uploadDocument(userId, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    return api.post('/api/accounting/documents', formData);
  },

  async getDocuments(userId) {
    return api.get(`/api/accounting/documents/${userId}`);
  },
};

export default api;
```

### 6. vite.config.js (Module Federation)
```javascript
// packages/accounting-module/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'accounting',
      filename: 'remoteEntry.js',
      // Exposes este módulo para o Shell
      exposes: {
        './Module': './src/index.js',
      },
      // Compartilha dependências com Shell
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 4001, // Porta única para cada módulo
  },
});
```

---

## 🔧 Template de Serviço Backend

### 1. Estrutura de um Serviço
```
services/accounting-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── accounting/
│   │   ├── accounting.module.ts
│   │   ├── accounting.controller.ts
│   │   ├── accounting.service.ts
│   │   ├── dto/
│   │   │   ├── create-cnpj.dto.ts
│   │   │   └── assign-accountant.dto.ts
│   │   └── entities/
│   │       ├── cnpj.entity.ts
│   │       └── accountant.entity.ts
│   ├── database/
│   │   ├── database.module.ts
│   │   └── migrations/
│   └── shared/                        # Copiado de shared-lib
│       ├── guards/
│       └── interceptors/
├── test/
├── package.json
├── tsconfig.json
├── .env
└── Dockerfile
```

### 2. main.ts (Cada serviço)
```typescript
// services/accounting-service/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // REST API
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Microservice connection (opcional - para comunicação entre serviços)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'accounting_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3001);

  console.log(`🚀 Accounting Service running on port ${process.env.PORT || 3001}`);
}
bootstrap();
```

### 3. app.module.ts (Cada serviço)
```typescript
// services/accounting-service/src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingModule } from './accounting/accounting.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AccountingModule,
  ],
})
export class AppModule {}
```

### 4. .env (Cada serviço)
```bash
# services/accounting-service/.env

# Server
NODE_ENV=development
PORT=3001

# Database (pode ser DB separada)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=scalex_accounting

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:4001

# RabbitMQ (para comunicação entre serviços)
RABBITMQ_URL=amqp://localhost:5672

# JWT (compartilhado entre todos os serviços)
JWT_SECRET=your-shared-secret-key

# External APIs (se necessário)
CONTABILIZEI_API_KEY=xxx
```

### 5. Dockerfile (Cada serviço)
```dockerfile
# services/accounting-service/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]
```

---

## 🔌 Comunicação Entre Microserviços

### 1. API Gateway (NGINX)
```nginx
# infrastructure/nginx/nginx.conf

upstream auth_service {
    server auth-service:3000;
}

upstream accounting_service {
    server accounting-service:3001;
}

upstream career_service {
    server career-service:3002;
}

# ... outros serviços

server {
    listen 80;
    server_name api.scalex.com;

    # Auth Service
    location /api/auth/ {
        proxy_pass http://auth_service/api/auth/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Accounting Service
    location /api/accounting/ {
        proxy_pass http://accounting_service/api/accounting/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Career Service
    location /api/career/ {
        proxy_pass http://career_service/api/career/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # ... outros serviços
}
```

### 2. Comunicação Assíncrona (RabbitMQ)
```typescript
// Serviço A envia evento
await this.amqpConnection.publish('user_exchange', 'user.created', {
  userId: newUser.id,
  email: newUser.email,
  createdAt: new Date(),
});

// Serviço B recebe evento
@RabbitSubscribe({
  exchange: 'user_exchange',
  routingKey: 'user.created',
  queue: 'accounting_user_queue',
})
async handleUserCreated(data: { userId: string; email: string }) {
  console.log('New user created, setting up accounting defaults:', data);
  // Criar configurações iniciais de contabilidade
}
```

### 3. Service Discovery (Opcional - Consul/Eureka)
```typescript
// Para ambientes dinâmicos (K8s, AWS ECS)
import { Injectable } from '@nestjs/common';
import * as Consul from 'consul';

@Injectable()
export class ServiceDiscoveryService {
  private consul: Consul.Consul;

  constructor() {
    this.consul = new Consul({
      host: process.env.CONSUL_HOST || 'localhost',
      port: process.env.CONSUL_PORT || '8500',
    });
  }

  async registerService(serviceName: string, port: number) {
    await this.consul.agent.service.register({
      name: serviceName,
      address: process.env.SERVICE_HOST,
      port,
      check: {
        http: `http://${process.env.SERVICE_HOST}:${port}/health`,
        interval: '10s',
      },
    });
  }

  async getService(serviceName: string) {
    const services = await this.consul.health.service(serviceName);
    return services[0]; // Load balancing pode ser implementado aqui
  }
}
```

---

## 📊 Comparação: Monolito vs Microserviços

| Aspecto | Monolito Modular (Atual) | Microserviços (Futuro) |
|---------|--------------------------|------------------------|
| **Deploy** | Deploy único (tudo junto) | Deploy independente por serviço |
| **Escalabilidade** | Escala todo o sistema | Escala serviços específicos |
| **Complexidade** | ⭐⭐ Simples | ⭐⭐⭐⭐ Complexo |
| **Desenvolvimento** | Time único, fácil debug | Times independentes, debug harder |
| **Performance** | ⭐⭐⭐⭐⭐ Chamadas locais | ⭐⭐⭐ Network overhead |
| **Banco de Dados** | DB único compartilhado | DB por serviço (isolado) |
| **Custos Infra** | 💰 Baixo (1-2 servidores) | 💰💰💰 Alto (N servidores) |
| **Resiliência** | ⭐⭐ Se cai, cai tudo | ⭐⭐⭐⭐ Falhas isoladas |
| **Testes** | ⭐⭐⭐⭐ Fácil testar junto | ⭐⭐ Testes integrados hard |
| **Observability** | ⭐⭐⭐ Logs centralizados | ⭐⭐⭐⭐⭐ Distributed tracing |

---

## 🚀 Plano de Migração Gradual

### Fase 1: Preparação (Você está aqui!)
**Duração:** 2-4 semanas
- [x] Criar arquitetura modular no monolito
- [ ] Separar módulos frontend em pastas independentes
- [ ] Criar API clients isolados por módulo
- [ ] Implementar feature flags
- [ ] Documentar dependências entre módulos

### Fase 2: Monorepo
**Duração:** 4-6 semanas
- [ ] Migrar para estrutura de monorepo (Turborepo/Nx)
- [ ] Separar frontend em packages
- [ ] Criar shared-lib para componentes comuns
- [ ] Implementar Module Federation (Webpack 5)
- [ ] Testar carregamento dinâmico de módulos

### Fase 3: Primeiro Microserviço (Proof of Concept)
**Duração:** 2-3 semanas
**Escolher módulo simples:** Jobs Module (sem dependências complexas)
- [ ] Extrair Jobs Service do monolito
- [ ] Criar DB separado para Jobs
- [ ] Configurar API Gateway (NGINX)
- [ ] Implementar health checks
- [ ] Deploy separado

### Fase 4: Microserviços Core
**Duração:** 8-12 semanas
- [ ] Auth Service (primeiro, pois outros dependem)
- [ ] Accounting Service
- [ ] Career Service
- [ ] Insurance Service
- [ ] Banking Service

### Fase 5: Microserviços Complexos
**Duração:** 6-8 semanas
- [ ] English Lessons Service (tem DB grande)
- [ ] English Conversation Service (tem Zoom integration)

### Fase 6: Infraestrutura Avançada
**Duração:** 4-6 semanas
- [ ] Kubernetes (K8s) deployment
- [ ] Service mesh (Istio/Linkerd)
- [ ] Distributed tracing (Jaeger/Zipkin)
- [ ] Centralized logging (ELK Stack)
- [ ] Monitoring (Prometheus + Grafana)

---

## 🛠️ Ferramentas Recomendadas

### Frontend (Microfrontends)
- **Module Federation:** Webpack 5 Module Federation ou Vite Federation
- **Monorepo:** Turborepo ou Nx
- **Package Manager:** PNPM (mais rápido que NPM/Yarn)
- **State Management:** Zustand (mais leve) ou Redux Toolkit
- **API Client:** Axios ou TanStack Query

### Backend (Microservices)
- **Framework:** NestJS (já está usando)
- **Message Broker:** RabbitMQ (mais simples) ou Kafka (mais robusto)
- **API Gateway:** NGINX ou Kong
- **Service Discovery:** Consul ou Kubernetes DNS
- **Cache:** Redis (compartilhado entre serviços)

### DevOps
- **Containers:** Docker + Docker Compose (dev) → Kubernetes (prod)
- **CI/CD:** GitHub Actions ou GitLab CI
- **IaC:** Terraform
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing:** Jaeger ou Zipkin

---

## 💡 Recomendações

### Para Agora (Fase 1-2)
✅ **FAÇA:**
- Mantenha monolito modular bem organizado
- Separe módulos em pastas independentes
- Crie API clients isolados por módulo
- Use feature flags para desabilitar módulos
- Documente bem as dependências

❌ **NÃO FAÇA:**
- Não migre para microserviços ainda
- Não crie complexidade prematura
- Não separe DBs ainda (use schemas)

### Para o Futuro (Fase 3+)
✅ **QUANDO MIGRAR:**
- Quando tiver +10.000 usuários ativos
- Quando equipe crescer (+5 devs)
- Quando módulos tiverem cargas diferentes
- Quando precisar escalar específico

❌ **QUANDO NÃO MIGRAR:**
- Time pequeno (1-3 devs)
- Produto ainda em MVP/validação
- Infraestrutura cara demais
- Não tem expertise em DevOps

---

## 📞 Próximos Passos IMEDIATOS

1. **Confirmar estrutura modular** no monolito atual
2. **Criar primeiro módulo completo** (Accounting ou Career)
3. **Testar isolamento** de API clients
4. **Implementar feature flags**
5. **Documentar dependências** entre módulos

---

**Versão:** 1.0
**Data:** 2025-10-23
**Status:** ✅ Ready for Microservices Migration (when needed)
