# Arquitetura Modular - ScaleX Platform

## 📐 Visão Geral

A plataforma ScaleX foi projetada com arquitetura modular para suportar 8 módulos principais, permitindo escalabilidade, manutenibilidade e desenvolvimento independente.

---

## 🎯 Módulos da Plataforma

### 1. **Authentication Module** (auth)
**Status:** ✅ Implementado (auth-social)

**Funcionalidades:**
- 1.0 Cadastro de usuário tradicional
- 1.1 Login social (Microsoft, Google, Facebook, GitHub)
- 1.2 Gerenciamento de perfil e dados principais
- 1.3 Autenticação Firebase + Backend sync

**Estrutura:**
```
front-end/src/modules/auth/
├── components/
│   ├── SocialLoginButtons.jsx
│   ├── RegisterForm.jsx
│   ├── LoginForm.jsx
│   └── ProfileEditor.jsx
├── context/
│   └── AuthContext.jsx
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   └── UserProfile.jsx
└── services/
    └── authService.js

back-end/src/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
└── strategies/
    ├── jwt.strategy.ts
    └── firebase.strategy.ts
```

---

### 2. **Accounting Module** (accounting)
**Status:** 🔴 Não implementado

**Funcionalidades:**
- 2.0 Criação e gerenciamento de CNPJ
- 2.1 Rede de contadores disponíveis
- 2.2 Sistema de matching usuário-contador
- 2.3 Troca de contador
- 2.4 Chat/comunicação com contador
- 2.5 Gestão de documentos contábeis

**Estrutura Proposta:**
```
front-end/src/modules/accounting/
├── components/
│   ├── AccountantCard.jsx
│   ├── CNPJForm.jsx
│   ├── DocumentUploader.jsx
│   └── ChatWithAccountant.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── AccountantsList.jsx
│   ├── CNPJSetup.jsx
│   └── Documents.jsx
└── services/
    └── accountingService.js

back-end/src/accounting/
├── accounting.module.ts
├── accounting.controller.ts
├── accounting.service.ts
├── entities/
│   ├── cnpj.entity.ts
│   ├── accountant.entity.ts
│   ├── user-accountant.entity.ts
│   └── document.entity.ts
└── dto/
    ├── create-cnpj.dto.ts
    └── assign-accountant.dto.ts
```

**Entidades:**
- **CNPJ:** id, userId, cnpjNumber, companyName, status, createdAt
- **Accountant:** id, name, email, specialties, rating, maxClients, currentClients
- **UserAccountant:** id, userId, accountantId, status, startDate, endDate
- **Document:** id, userId, accountantId, type, fileUrl, status, uploadedAt

---

### 3. **Career Consulting Module** (career-consulting)
**Status:** 🔴 Não implementado

**Funcionalidades:**
- 3.0 Rede de consultores para LinkedIn e Currículo
- 3.1 Sistema de escolha de profissional
- 3.2 Agendamento e início de atendimento
- 3.3 Chat integrado (interno ou WhatsApp)
- 3.4 Avaliação do consultor
- 3.5 Upload de documentos (CV, LinkedIn profile)

**Estrutura Proposta:**
```
front-end/src/modules/career-consulting/
├── components/
│   ├── ConsultantCard.jsx
│   ├── AppointmentScheduler.jsx
│   ├── ChatBox.jsx
│   └── ReviewForm.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── ConsultantsList.jsx
│   ├── MyConsultant.jsx
│   └── Appointments.jsx
└── services/
    └── careerService.js

back-end/src/career-consulting/
├── career-consulting.module.ts
├── career-consulting.controller.ts
├── career-consulting.service.ts
├── entities/
│   ├── consultant.entity.ts
│   ├── user-consultant.entity.ts
│   ├── appointment.entity.ts
│   └── review.entity.ts
└── dto/
    ├── create-appointment.dto.ts
    └── create-review.dto.ts
```

**Entidades:**
- **Consultant:** id, name, email, specialties (LinkedIn/CV), rating, experience, pricePerSession
- **UserConsultant:** id, userId, consultantId, status, sessions, totalPaid
- **Appointment:** id, userId, consultantId, scheduledAt, duration, status, notes
- **Review:** id, userId, consultantId, appointmentId, rating, comment, createdAt

---

### 4. **English Lessons Module** (english-lessons)
**Status:** ✅ Parcialmente implementado (english-course)

**Funcionalidades:**
- 4.0 Aulas de inglês (método Callan-like)
- 4.1 Rede de professores disponíveis
- 4.2 Sistema de escolha de professor
- 4.3 Troca de professor
- 4.4 Plataforma de perguntas/respostas por aula
- 4.5 Agendamento de aulas ao vivo
- 4.6 Sistema de spaced repetition (já implementado)

**Estrutura Atual + Melhorias:**
```
front-end/src/modules/english-lessons/
├── components/
│   ├── TeacherCard.jsx           # NOVO
│   ├── ClassScheduler.jsx        # NOVO
│   ├── LiveClassRoom.jsx         # NOVO
│   ├── Card.jsx                  # EXISTENTE
│   ├── QuestionCard.jsx          # EXISTENTE
│   └── ProgressStats.jsx         # EXISTENTE
├── pages/
│   ├── Dashboard.jsx             # EXISTENTE
│   ├── TeachersList.jsx          # NOVO
│   ├── MyTeacher.jsx             # NOVO
│   ├── Practice.jsx              # EXISTENTE
│   └── Review.jsx                # EXISTENTE
└── services/
    └── englishService.js

back-end/src/english-lessons/
├── english-lessons.module.ts
├── english-lessons.controller.ts
├── english-lessons.service.ts
├── entities/
│   ├── teacher.entity.ts         # NOVO
│   ├── user-teacher.entity.ts    # NOVO
│   ├── live-class.entity.ts      # NOVO
│   ├── lesson.entity.ts          # EXISTENTE
│   ├── question.entity.ts        # EXISTENTE
│   └── user-progress.entity.ts   # EXISTENTE
└── dto/
    ├── assign-teacher.dto.ts     # NOVO
    └── schedule-class.dto.ts     # NOVO
```

**Novas Entidades:**
- **Teacher:** id, name, email, specialties, rating, availability, pricePerClass
- **UserTeacher:** id, userId, teacherId, status, totalClasses, startDate
- **LiveClass:** id, userId, teacherId, scheduledAt, duration, status, recordingUrl

---

### 5. **English Conversation Module** (english-conversation)
**Status:** ✅ Parcialmente implementado (video-call)

**Funcionalidades:**
- 5.0 Sessões de conversação 1-on-1
- 5.1 Integração com Zoom API
- 5.2 Matching por nível (mesmo nível ou +1)
- 5.3 Sessões de 7 minutos
- 5.4 Sistema de fila e re-matching
- 5.5 Avaliação mútua pós-sessão

**Estrutura Atual + Melhorias:**
```
front-end/src/modules/english-conversation/
├── components/
│   ├── VideoCall.jsx              # EXISTENTE
│   ├── MatchingScreen.jsx         # NOVO
│   ├── PeerReview.jsx             # NOVO
│   └── ConversationStats.jsx      # NOVO
├── pages/
│   ├── Dashboard.jsx              # RENOMEAR video-call
│   ├── WaitingQueue.jsx           # EXISTENTE
│   ├── VideoCallRoom.jsx          # EXISTENTE
│   └── SessionHistory.jsx         # NOVO
└── services/
    └── conversationService.js

back-end/src/english-conversation/
├── english-conversation.module.ts
├── english-conversation.controller.ts
├── english-conversation.service.ts
├── entities/
│   ├── session.entity.ts          # EXISTENTE
│   ├── queue-user.entity.ts       # EXISTENTE
│   ├── session-review.entity.ts   # NOVO
│   └── user-level.entity.ts       # NOVO
└── dto/
    ├── submit-review.dto.ts       # NOVO
    └── update-level.dto.ts        # NOVO
```

**Novas Entidades:**
- **SessionReview:** id, sessionId, reviewerId, reviewedUserId, rating, feedback, createdAt
- **UserLevel:** id, userId, conversationLevel, lastUpdated, totalSessions

---

### 6. **Job Board Module** (jobs)
**Status:** 🔴 Não implementado

**Funcionalidades:**
- 6.0 Web scraper para vagas remotas
- 6.1 Filtros avançados (país, salário, tech stack)
- 6.2 Vagas de Brasil e países de moeda forte
- 6.3 Apenas vagas remotas
- 6.4 Redirecionamento para vaga original

**Estrutura Proposta:**
```
front-end/src/modules/jobs/
├── components/
│   ├── JobCard.jsx
│   ├── JobFilters.jsx
│   ├── SavedJobs.jsx
│   └── JobAlert.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── JobSearch.jsx
│   ├── JobDetails.jsx
│   └── SavedJobs.jsx
└── services/
    └── jobsService.js

back-end/src/jobs/
├── jobs.module.ts
├── jobs.controller.ts
├── jobs.service.ts
├── scrapers/
│   ├── linkedin-scraper.service.ts
│   ├── indeed-scraper.service.ts
│   ├── remoteok-scraper.service.ts
│   └── weworkremotely-scraper.service.ts
├── entities/
│   ├── job.entity.ts
│   ├── saved-job.entity.ts
│   └── job-alert.entity.ts
└── dto/
    ├── search-jobs.dto.ts
    └── create-alert.dto.ts
```

**Entidades:**
- **Job:** id, title, company, country, currency, salaryRange, techStack, url, remote, scrapedAt
- **SavedJob:** id, userId, jobId, savedAt, status (applied/interested/rejected)
- **JobAlert:** id, userId, filters (JSON), frequency, lastSent, active

**Tecnologias:**
- Puppeteer ou Playwright para scraping
- Cron jobs para atualização periódica
- Redis para cache de vagas

---

### 7. **Insurance Module** (insurance)
**Status:** 🔴 Não implementado

**Funcionalidades:**
- 7.0 Planos de saúde
- 7.1 Seguro de afastamento (DTI-like)
- 7.2 Seguros gerais (vida, acidentes, etc.)
- 7.3 Comparação de planos
- 7.4 Contratação via parceiros

**Estrutura Proposta:**
```
front-end/src/modules/insurance/
├── components/
│   ├── InsuranceCard.jsx
│   ├── PlanComparison.jsx
│   ├── QuoteCalculator.jsx
│   └── ContractForm.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── HealthPlans.jsx
│   ├── DisabilityInsurance.jsx
│   ├── GeneralInsurance.jsx
│   └── MyPolicies.jsx
└── services/
    └── insuranceService.js

back-end/src/insurance/
├── insurance.module.ts
├── insurance.controller.ts
├── insurance.service.ts
├── entities/
│   ├── insurance-plan.entity.ts
│   ├── user-policy.entity.ts
│   └── quote.entity.ts
└── dto/
    ├── calculate-quote.dto.ts
    └── contract-insurance.dto.ts
```

**Entidades:**
- **InsurancePlan:** id, type (health/disability/life), provider, coverage, monthlyPrice, benefits
- **UserPolicy:** id, userId, planId, status, startDate, endDate, monthlyPayment
- **Quote:** id, userId, planId, calculatedPrice, userInfo (JSON), expiresAt

**Integrações:**
- APIs de seguradoras parceiras
- Gateway de pagamento para contratação

---

### 8. **Banking Module** (banking)
**Status:** 🔴 Não implementado

**Funcionalidades:**
- 8.0 Recebimento de pagamentos internacionais
- 8.1 Conversão de moeda via banco parceiro
- 8.2 Transferência para conta PJ do usuário
- 8.3 Ofertas de empréstimos
- 8.4 Histórico de transações
- 8.5 Relatórios financeiros

**Estrutura Proposta:**
```
front-end/src/modules/banking/
├── components/
│   ├── AccountBalance.jsx
│   ├── TransactionList.jsx
│   ├── CurrencyConverter.jsx
│   ├── LoanCalculator.jsx
│   └── PaymentForm.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── Transactions.jsx
│   ├── InternationalPayments.jsx
│   ├── Loans.jsx
│   └── Reports.jsx
└── services/
    └── bankingService.js

back-end/src/banking/
├── banking.module.ts
├── banking.controller.ts
├── banking.service.ts
├── entities/
│   ├── bank-account.entity.ts
│   ├── transaction.entity.ts
│   ├── loan.entity.ts
│   └── conversion.entity.ts
└── dto/
    ├── create-transaction.dto.ts
    ├── request-loan.dto.ts
    └── convert-currency.dto.ts
```

**Entidades:**
- **BankAccount:** id, userId, cnpjId, accountNumber, bank, balance, currency
- **Transaction:** id, userId, type, amount, currency, convertedAmount, status, createdAt
- **Loan:** id, userId, amount, interestRate, installments, status, requestedAt
- **Conversion:** id, transactionId, fromCurrency, toCurrency, exchangeRate, fee, convertedAt

**Integrações:**
- Wise API (antiga TransferWise)
- Payoneer API
- Banco parceiro brasileiro (API de transferências)
- API de câmbio (ExchangeRate-API ou similar)

---

## 🔄 Sistema de Rotas Modular

### Frontend Router Structure
```javascript
// front-end/src/routes/AppRoutes.jsx
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Protected Routes */}
  <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />

  {/* Module Routes */}
  <Route path="/auth/*" element={<AuthRoutes />} />
  <Route path="/accounting/*" element={<AccountingRoutes />} />
  <Route path="/career/*" element={<CareerConsultingRoutes />} />
  <Route path="/english-lessons/*" element={<EnglishLessonsRoutes />} />
  <Route path="/english-conversation/*" element={<EnglishConversationRoutes />} />
  <Route path="/jobs/*" element={<JobsRoutes />} />
  <Route path="/insurance/*" element={<InsuranceRoutes />} />
  <Route path="/banking/*" element={<BankingRoutes />} />

  {/* Admin Routes */}
  <Route path="/admin/*" element={<AdminRoutes />} />
</Routes>
```

### Backend Module Structure
```typescript
// back-end/src/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync(),

    // Core Modules
    UsersModule,
    AuthModule,

    // Feature Modules
    AccountingModule,
    CareerConsultingModule,
    EnglishLessonsModule,
    EnglishConversationModule,
    JobsModule,
    InsuranceModule,
    BankingModule,

    // Support Modules
    AdminModule,
    NotificationsModule,
    FileUploadModule,
  ],
})
export class AppModule {}
```

---

## 🎨 Home Dashboard Integration

**Novo Home.jsx** com navegação para todos os módulos:

```jsx
// front-end/src/modules/auth/pages/Home.jsx
const modules = [
  {
    id: 'accounting',
    icon: '📊',
    title: 'Contabilidade',
    description: 'Gerencie seu CNPJ e contador',
    route: '/accounting',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'career',
    icon: '💼',
    title: 'Consultoria de Carreira',
    description: 'Melhore seu LinkedIn e Currículo',
    route: '/career',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'english-lessons',
    icon: '📚',
    title: 'Aulas de Inglês',
    description: 'Método Callan com professores',
    route: '/english-lessons',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'conversation',
    icon: '💬',
    title: 'Conversação em Inglês',
    description: 'Pratique com outros usuários',
    route: '/english-conversation',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'jobs',
    icon: '🌍',
    title: 'Vagas Remotas',
    description: 'Trabalhe para o mundo todo',
    route: '/jobs',
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'insurance',
    icon: '🛡️',
    title: 'Seguros',
    description: 'Proteja sua saúde e renda',
    route: '/insurance',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    id: 'banking',
    icon: '💰',
    title: 'Banco Digital',
    description: 'Receba do exterior e empréstimos',
    route: '/banking',
    color: 'from-teal-500 to-cyan-500'
  }
];
```

---

## 📦 Shared Components & Utilities

### Shared Components
```
front-end/src/shared/
├── components/
│   ├── ModuleCard.jsx          # Card padrão para módulos
│   ├── ProfessionalCard.jsx    # Card para profissionais (contador, consultor, professor)
│   ├── ChatBox.jsx             # Chat integrado
│   ├── Calendar.jsx            # Agendamento
│   ├── FileUploader.jsx        # Upload de arquivos
│   ├── DataTable.jsx           # Tabela de dados
│   ├── SearchBar.jsx           # Busca global
│   └── EmptyState.jsx          # Estado vazio
├── hooks/
│   ├── useApi.js               # Hook para chamadas API
│   ├── useAuth.js              # Hook de autenticação
│   ├── useNotification.js      # Hook de notificações
│   └── usePagination.js        # Hook de paginação
└── utils/
    ├── formatters.js           # Formatação de dados
    ├── validators.js           # Validações
    └── constants.js            # Constantes globais
```

### Backend Shared Modules
```
back-end/src/shared/
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── interceptors/
│   ├── logging.interceptor.ts
│   └── transform.interceptor.ts
├── decorators/
│   ├── current-user.decorator.ts
│   └── roles.decorator.ts
└── utils/
    ├── pagination.util.ts
    └── response.util.ts
```

---

## 🚀 Plano de Implementação

### Fase 1: Fundação (Semanas 1-2)
- [ ] Refatorar estrutura de pastas
- [ ] Criar sistema de rotas modular
- [ ] Implementar shared components
- [ ] Atualizar Home Dashboard com todos os módulos

### Fase 2: Módulos Core (Semanas 3-6)
- [ ] Módulo Contabilidade (Accounting)
- [ ] Módulo Consultoria (Career Consulting)
- [ ] Melhorias no módulo English Lessons (adicionar professores)

### Fase 3: Módulos Avançados (Semanas 7-10)
- [ ] Módulo de Vagas (Jobs + Scraping)
- [ ] Módulo de Seguros (Insurance)
- [ ] Melhorias no módulo de Conversação

### Fase 4: Módulo Financeiro (Semanas 11-14)
- [ ] Módulo Banking
- [ ] Integrações com APIs bancárias
- [ ] Sistema de empréstimos

### Fase 5: Refinamento (Semanas 15-16)
- [ ] Testes integrados
- [ ] Otimizações de performance
- [ ] Documentação completa
- [ ] Deploy e CI/CD

---

## 🔐 Segurança e Compliance

### LGPD / GDPR Compliance
- Consentimento de uso de dados
- Criptografia de dados sensíveis
- Direito ao esquecimento
- Portabilidade de dados

### PCI DSS (Pagamentos)
- Não armazenar dados de cartão
- Usar gateways certificados
- Logs de transações

### KYC (Know Your Customer) - Banking
- Verificação de identidade
- Validação de documentos
- Limite de transações sem verificação

---

## 📊 Banco de Dados

### Estrutura Unificada
```sql
-- Users (core)
users
addresses
user_roles

-- Accounting Module
cnpjs
accountants
user_accountant_assignments
accounting_documents

-- Career Consulting Module
consultants
user_consultant_assignments
appointments
consultant_reviews

-- English Lessons Module
teachers
user_teacher_assignments
live_classes
lessons (existente)
questions (existente)
user_progress (existente)

-- English Conversation Module
conversation_sessions (existente)
session_reviews
user_conversation_levels

-- Jobs Module
jobs
saved_jobs
job_alerts

-- Insurance Module
insurance_plans
user_policies
insurance_quotes

-- Banking Module
bank_accounts
transactions
loans
currency_conversions
```

---

## 🎯 Próximos Passos

1. **Revisar esta arquitetura** com a equipe
2. **Priorizar módulos** para implementação
3. **Definir APIs externas** necessárias
4. **Estimar custos** de integrações (Zoom, Banking APIs, etc.)
5. **Começar refatoração** da estrutura atual

---

## 📞 Integrações Necessárias

| Módulo | Integração | Custo Estimado |
|--------|-----------|----------------|
| Conversation | Zoom API | ~$100-500/mês |
| Jobs | Web Scraping (Puppeteer) | Servidor dedicado |
| Insurance | APIs de Seguradoras | Variável |
| Banking | Wise/Payoneer API | % por transação |
| Banking | Banco Brasileiro API | Negociação |
| All | AWS/GCP (hosting) | ~$200-1000/mês |
| All | PostgreSQL (RDS) | ~$50-200/mês |
| All | Redis (cache) | ~$20-100/mês |

---

**Versão:** 1.0
**Data:** 2025-10-23
**Autor:** Claude AI + Lucas (Product Owner)
