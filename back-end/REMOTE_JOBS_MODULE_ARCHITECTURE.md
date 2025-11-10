# 🚀 Módulo de Remote Jobs - Arquitetura e Funcionamento

## 📋 Visão Geral

O módulo de Remote Jobs será um sistema completo de busca e scraping de vagas de trabalho remoto na América Latina (LATAM), permitindo que usuários encontrem oportunidades de emprego filtradas por área, experiência, salário e outros critérios.

---

## 🎯 Funcionalidades Principais

### 1. **Scraping Automatizado de Vagas**
- Coleta automática de vagas de múltiplas fontes
- Atualização periódica (cron jobs)
- Detecção de vagas duplicadas
- Armazenamento estruturado no banco de dados

### 2. **Sistema de Filtros Avançados**
- **Área/Tecnologia**: Desenvolvimento, Design, Marketing, Vendas, etc.
- **Tipo de Contrato**: CLT, PJ, Freelance, Estágio
- **Nível de Experiência**: Júnior, Pleno, Sênior, Liderança
- **Faixa Salarial**: Ranges configuráveis
- **Localização**: Remoto (LATAM), Remoto (Global), Híbrido
- **Idioma**: Português, Inglês, Espanhol
- **Empresa**: Busca por nome da empresa
- **Data de Publicação**: Últimas 24h, 7 dias, 30 dias

### 3. **Interface do Usuário**
- Dashboard com vagas em destaque
- Busca por palavras-chave
- Filtros laterais interativos
- Paginação e ordenação
- Salvar vagas favoritas
- Histórico de candidaturas

---

## 🏗️ Arquitetura Técnica

### **Estrutura de Pastas**
```
back-end/src/modules/remote-jobs/
├── entities/
│   ├── remote-job.entity.ts          # Entidade principal da vaga
│   ├── job-source.entity.ts          # Fontes de scraping (LinkedIn, Indeed, etc.)
│   ├── job-application.entity.ts     # Candidaturas do usuário
│   └── saved-job.entity.ts           # Vagas salvas pelo usuário
├── dto/
│   ├── search-jobs.dto.ts            # DTO para busca
│   ├── filter-jobs.dto.ts            # DTO para filtros
│   └── apply-job.dto.ts              # DTO para candidatura
├── services/
│   ├── remote-jobs.service.ts         # Lógica de negócio principal
│   ├── job-scraper.service.ts         # Serviço de scraping
│   ├── scraper-providers/            # Provedores específicos
│   │   ├── linkedin-scraper.ts
│   │   ├── indeed-scraper.ts
│   │   ├── remoteok-scraper.ts
│   │   ├── weworkremotely-scraper.ts
│   │   └── latam-jobs-scraper.ts
│   └── job-matcher.service.ts         # Matching de vagas com perfil
├── controllers/
│   ├── remote-jobs.controller.ts     # Endpoints públicos
│   └── remote-jobs-admin.controller.ts # Endpoints admin
└── remote-jobs.module.ts
```

---

## 📊 Modelo de Dados

### **RemoteJob Entity**
```typescript
{
  id: UUID
  title: string                    // "Desenvolvedor Full Stack"
  company: string                  // "Tech Corp"
  description: string              // Descrição completa (HTML/texto)
  location: string                 // "Remoto (LATAM)"
  salaryMin: number?               // Salário mínimo
  salaryMax: number?               // Salário máximo
  currency: string                 // "BRL", "USD", "EUR"
  contractType: string             // "CLT", "PJ", "Freelance"
  experienceLevel: string          // "Junior", "Pleno", "Senior"
  area: string                     // "Desenvolvimento", "Design"
  technologies: string[]           // ["React", "Node.js", "TypeScript"]
  languages: string[]               // ["Português", "Inglês"]
  source: string                   // "LinkedIn", "Indeed", etc.
  sourceUrl: string                // URL original da vaga
  publishedAt: Date                // Data de publicação
  expiresAt: Date?                 // Data de expiração
  isActive: boolean                // Vaga ainda ativa
  applicationUrl: string            // URL para candidatura
  companyLogo?: string              // URL do logo
  tags: string[]                   // Tags adicionais
  createdAt: Date
  updatedAt: Date
}
```

### **JobSource Entity**
```typescript
{
  id: UUID
  name: string                     // "LinkedIn"
  baseUrl: string                  // "https://linkedin.com/jobs"
  isActive: boolean                // Fonte ativa para scraping
  lastScrapedAt: Date?             // Última vez que foi feito scraping
  scrapeInterval: number           // Intervalo em horas
  rateLimit: number                // Requests por minuto
  config: JSON                     // Configurações específicas
}
```

### **JobApplication Entity**
```typescript
{
  id: UUID
  userId: UUID                     // FK para User
  jobId: UUID                      // FK para RemoteJob
  appliedAt: Date
  status: string                    // "applied", "viewed", "rejected", "interview"
  notes?: string
}
```

### **SavedJob Entity**
```typescript
{
  id: UUID
  userId: UUID                     // FK para User
  jobId: UUID                      // FK para RemoteJob
  savedAt: Date
  notes?: string
}
```

---

## 🔍 Fontes de Scraping (Provedores)

### **1. LinkedIn Jobs**
- **URL**: `https://www.linkedin.com/jobs/search/`
- **Método**: Web scraping com Puppeteer/Playwright
- **Filtros**: Remote, LATAM, Área
- **Dados**: Título, empresa, descrição, salário, localização

### **2. Indeed**
- **URL**: `https://br.indeed.com/`
- **Método**: Web scraping
- **Filtros**: Remote, País, Área
- **Dados**: Similar ao LinkedIn

### **3. RemoteOK**
- **URL**: `https://remoteok.com/`
- **Método**: API pública ou scraping
- **Filtros**: Tecnologia, Salário
- **Dados**: Focado em remoto

### **4. We Work Remotely**
- **URL**: `https://weworkremotely.com/`
- **Método**: Web scraping
- **Filtros**: Categoria
- **Dados**: Vagas 100% remotas

### **5. Sites LATAM Específicos**
- **Get on Board** (Chile/México)
- **Trabalha Brasil**
- **Catho**
- **InfoJobs** (Brasil)
- **Computrabajo** (LATAM)

### **6. APIs Públicas (quando disponível)**
- Alguns sites oferecem APIs
- Priorizar APIs sobre scraping quando possível

---

## ⚙️ Sistema de Scraping

### **Estratégia de Scraping**

1. **Rate Limiting**
   - Respeitar limites de cada site
   - Delays entre requests
   - Rotação de User-Agents
   - Proxies (opcional, para produção)

2. **Detecção de Duplicatas**
   - Hash baseado em: título + empresa + descrição (primeiros 500 chars)
   - Evitar armazenar a mesma vaga múltiplas vezes

3. **Agendamento (Cron Jobs)**
   - **LinkedIn**: A cada 6 horas
   - **Indeed**: A cada 4 horas
   - **RemoteOK**: A cada 2 horas (atualizações frequentes)
   - **We Work Remotely**: A cada 8 horas
   - **Outros**: A cada 12 horas

4. **Tratamento de Erros**
   - Retry com backoff exponencial
   - Logging de erros
   - Notificações para admin em caso de falhas

5. **Validação de Dados**
   - Verificar campos obrigatórios
   - Normalizar formatos (salário, data, etc.)
   - Limpar HTML/formatar descrições

---

## 🔎 Sistema de Busca e Filtros

### **Endpoint de Busca**
```
GET /api/remote-jobs/search
```

### **Query Parameters**
```typescript
{
  q?: string              // Busca por palavras-chave
  area?: string           // "Desenvolvimento", "Design", etc.
  experience?: string     // "Junior", "Pleno", "Senior"
  contractType?: string   // "CLT", "PJ", "Freelance"
  salaryMin?: number      // Salário mínimo
  salaryMax?: number      // Salário máximo
  location?: string       // "Remoto (LATAM)", "Remoto (Global)"
  language?: string       // "Português", "Inglês", "Espanhol"
  technology?: string    // "React", "Node.js", etc.
  company?: string        // Nome da empresa
  publishedAfter?: Date   // Últimas 24h, 7 dias, etc.
  page?: number          // Paginação
  limit?: number         // Itens por página
  sortBy?: string        // "publishedAt", "salary", "relevance"
  order?: "ASC" | "DESC"
}
```

### **Lógica de Busca**
1. **Full-Text Search**: PostgreSQL `tsvector` para busca textual
2. **Filtros**: WHERE clauses baseados nos parâmetros
3. **Ordenação**: Por relevância, data, ou salário
4. **Paginação**: Offset/limit ou cursor-based

---

## 🎨 Interface do Usuário (Frontend)

### **Página Principal**
```
┌─────────────────────────────────────────────────┐
│  🔍 Buscar vagas...                    [Filtros]│
├─────────────────────────────────────────────────┤
│  Filtros Laterais          │  Lista de Vagas  │
│  ┌─────────────────┐        │  ┌──────────────┐ │
│  │ Área            │        │  │ 💼 Vaga 1     │ │
│  │ ☐ Desenvolvimento│       │  │ Empresa X   │ │
│  │ ☐ Design         │       │  │ R$ 5k-8k    │ │
│  │ ☐ Marketing      │       │  │ [Ver Detalhes]│
│  │                  │        │  └──────────────┘ │
│  │ Experiência      │        │  ┌──────────────┐ │
│  │ ☐ Júnior         │        │  │ 💼 Vaga 2     │ │
│  │ ☐ Pleno          │        │  │ ...          │ │
│  │ ☐ Sênior         │        │  └──────────────┘ │
│  │                  │        │                   │
│  │ Salário          │        │  [1] [2] [3] ... │
│  │ R$ [____] - [____]│       │                   │
│  └─────────────────┘        └───────────────────┘
└─────────────────────────────────────────────────┘
```

### **Página de Detalhes da Vaga**
- Informações completas
- Botão "Candidatar-se"
- Botão "Salvar vaga"
- Vagas similares
- Compartilhar

---

## 🔐 Segurança e Permissões

### **Endpoints Públicos**
- `GET /api/remote-jobs/search` - Buscar vagas (público)
- `GET /api/remote-jobs/:id` - Detalhes da vaga (público)

### **Endpoints Autenticados**
- `POST /api/remote-jobs/:id/save` - Salvar vaga (requer auth)
- `POST /api/remote-jobs/:id/apply` - Candidatar-se (requer auth)
- `GET /api/remote-jobs/saved` - Vagas salvas (requer auth)
- `GET /api/remote-jobs/applications` - Minhas candidaturas (requer auth)

### **Endpoints Admin**
- `POST /api/remote-jobs/admin/scrape` - Forçar scraping manual
- `GET /api/remote-jobs/admin/stats` - Estatísticas
- `GET /api/remote-jobs/admin/sources` - Gerenciar fontes
- `PUT /api/remote-jobs/admin/sources/:id` - Atualizar fonte

---

## 📈 Métricas e Analytics

### **Estatísticas para Admin**
- Total de vagas no banco
- Vagas por fonte
- Vagas por área
- Taxa de atualização
- Erros de scraping
- Vagas mais visualizadas
- Taxa de candidaturas

### **Estatísticas para Usuário**
- Vagas visualizadas
- Vagas salvas
- Candidaturas enviadas
- Taxa de resposta

---

## 🚀 Fluxo de Funcionamento

### **1. Scraping Automático (Background)**
```
Cron Job → JobScraperService → Provider específico → 
Normalizar dados → Verificar duplicatas → Salvar no banco
```

### **2. Busca do Usuário**
```
Frontend → API Request → RemoteJobsService → 
Aplicar filtros → Busca no banco → Retornar resultados
```

### **3. Candidatura**
```
Usuário clica "Candidatar-se" → Salvar em JobApplication → 
Redirecionar para URL externa (ou processar internamente)
```

---

## 🛠️ Tecnologias e Bibliotecas

### **Backend**
- **NestJS**: Framework principal
- **TypeORM**: ORM para banco de dados
- **PostgreSQL**: Banco de dados (com Full-Text Search)
- **Puppeteer/Playwright**: Web scraping
- **Cheerio**: Parsing HTML
- **Axios**: HTTP requests
- **@nestjs/schedule**: Cron jobs
- **Bull/Redis**: Queue para scraping (opcional, para produção)

### **Frontend**
- **React**: Framework
- **React Query**: Gerenciamento de estado/cache
- **Tailwind CSS**: Estilização
- **React Hook Form**: Formulários
- **Framer Motion**: Animações (opcional)

---

## 📝 Considerações Importantes

### **Legal e Ética**
- ✅ Respeitar `robots.txt` de cada site
- ✅ Rate limiting adequado
- ✅ Não sobrecarregar servidores
- ✅ Atribuir fonte original
- ✅ Considerar termos de uso de cada plataforma

### **Performance**
- Índices no banco para busca rápida
- Cache de resultados de busca
- Paginação eficiente
- Lazy loading de descrições

### **Escalabilidade**
- Queue system para scraping (Bull/Redis)
- Workers separados para scraping
- CDN para assets (logos de empresas)
- Database sharding (se necessário no futuro)

---

## 🎯 Próximos Passos

1. ✅ Criar estrutura de módulo
2. ✅ Criar entidades e migrations
3. ✅ Implementar serviços de scraping básicos
4. ✅ Criar endpoints de busca
5. ✅ Implementar filtros
6. ✅ Criar interface frontend
7. ✅ Configurar cron jobs
8. ✅ Testes e otimizações

---

## ❓ Perguntas para Definir

1. **Prioridade de fontes**: Quais sites são mais importantes?
2. **Frequência de scraping**: Com que frequência atualizar?
3. **Notificações**: Usuários querem notificações de novas vagas?
4. **Perfil do usuário**: Salvar preferências de busca?
5. **Integração**: Integrar com LinkedIn/Indeed para candidaturas diretas?

---

**Pronto para implementar?** 🚀


