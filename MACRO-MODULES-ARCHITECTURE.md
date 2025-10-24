# Arquitetura de Macro-Módulos - ScaleX Platform

## 🎯 Visão Geral

A plataforma ScaleX está organizada em **2 macro-módulos principais**, cada um contendo submódulos relacionados à sua jornada:

```
ScaleX Platform
├── 📚 ENGLISH LEARNING (Aprendizado de Inglês)
└── 💼 BUSINESS SUITE (Ferramentas Empresariais)
```

**Importante:** Todos os módulos são **acessíveis desde o início**, sem bloqueios. O usuário tem autonomia total.

---

## 📚 MACRO-MÓDULO 1: ENGLISH LEARNING

**Objetivo:** Aprendizado e prática de inglês

### Submódulos:

#### 1.1 English Course (Aulas de Inglês)
**Status:** ✅ Implementado
**Rota:** `/learning/course`
**Descrição:** Sistema de spaced repetition com lições por níveis

**Funcionalidades:**
- Lições organizadas por nível (Beginner, Elementary, Intermediate, Advanced)
- Sistema de revisão espaçada (SRS)
- Flashcards com áudio (TTS Piper)
- Perguntas e respostas
- Progresso e estatísticas

**Estrutura Atual:**
```
front-end/src/modules/english-course/
├── components/
│   ├── Card.jsx
│   ├── QuestionCard.jsx
│   ├── LessonCard.jsx
│   ├── ProgressStats.jsx
│   └── FeedbackModal.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── LessonsList.jsx
│   ├── Practice.jsx
│   ├── Review.jsx
│   ├── Progress.jsx
│   └── HowItWorks.jsx
└── hooks/
    └── useTTS.js

back-end/src/english-course/
├── english-course.module.ts
├── english-course.controller.ts
├── english-course.service.ts
├── english-course-admin.controller.ts
├── entities/
│   ├── lesson.entity.ts
│   ├── question.entity.ts
│   ├── user-progress.entity.ts
│   ├── answer-history.entity.ts
│   └── review.entity.ts
└── dto/ (vários)
```

#### 1.2 English Conversation (Conversação via Zoom)
**Status:** ✅ Implementado
**Rota:** `/learning/conversation`
**Descrição:** Prática de conversação 1-on-1 com outros usuários

**Funcionalidades:**
- Matching por nível de inglês
- Sessões de 7 minutos via Zoom
- Sistema de fila (queue)
- Avaliação mútua pós-sessão
- Histórico de sessões

**Estrutura Atual:**
```
front-end/src/modules/video-call/
├── components/
│   ├── VideoCall.jsx
│   └── VideoCallSimple.jsx
├── pages/
│   ├── VideoCallDashboard.jsx
│   ├── WaitingQueue.jsx
│   ├── VideoCallRoom.jsx
│   ├── Matching.jsx
│   └── HowItWorks.jsx
└── VideoCallRoutes.jsx

back-end/src/video-call/
├── video-call.module.ts
├── video-call.controller.ts
├── video-call.service.ts
├── video-call-queue.service.ts
├── entities/
│   ├── video-call-room.entity.ts
│   ├── session.entity.ts
│   ├── session-room.entity.ts
│   ├── queue-user.entity.ts
│   └── active-period.entity.ts
└── dto/ (vários)
```

#### 1.3 English Teachers (Aulas com Professores)
**Status:** 🔴 Não Implementado
**Rota:** `/learning/teachers`
**Descrição:** Aulas particulares com professores reais (método Callan)

**Funcionalidades Planejadas:**
- Lista de professores disponíveis
- Escolher professor
- Agendar aulas via Zoom
- Trocar de professor
- Histórico de aulas
- Avaliações de professores

**Estrutura Futura:**
```
front-end/src/modules/english-learning/teachers/
├── components/
│   ├── TeacherCard.jsx
│   ├── ClassScheduler.jsx
│   └── LiveClassRoom.jsx
├── pages/
│   ├── TeachersList.jsx
│   ├── MyTeacher.jsx
│   ├── ScheduleClass.jsx
│   └── ClassHistory.jsx
└── services/
    └── teachersApi.js

back-end/src/english-learning/teachers/
├── teachers.module.ts
├── teachers.controller.ts
├── teachers.service.ts
├── entities/
│   ├── teacher.entity.ts
│   ├── user-teacher.entity.ts
│   └── live-class.entity.ts
└── dto/
    ├── assign-teacher.dto.ts
    └── schedule-class.dto.ts
```

---

## 💼 MACRO-MÓDULO 2: BUSINESS SUITE

**Objetivo:** Ferramentas para trabalhar como PJ no exterior

### Submódulos:

#### 2.1 Accounting (Contabilidade)
**Status:** 🔴 Não Implementado
**Rota:** `/business/accounting`
**Descrição:** Gestão de CNPJ e relacionamento com contador

**Funcionalidades Planejadas:**
- Criação de CNPJ
- Rede de contadores disponíveis
- Escolher contador
- Trocar de contador
- Upload de documentos
- Chat com contador

**Estrutura Futura:**
```
front-end/src/modules/business-suite/accounting/
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
    └── accountingApi.js

back-end/src/business-suite/accounting/
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

#### 2.2 Career Consulting (Consultoria de Carreira)
**Status:** 🔴 Não Implementado
**Rota:** `/business/career`
**Descrição:** Otimização de LinkedIn e Currículo

**Funcionalidades Planejadas:**
- Lista de consultores
- Escolher consultor
- Agendar sessões
- Chat com consultor
- Upload de currículo
- Avaliações

**Estrutura Futura:**
```
front-end/src/modules/business-suite/career/
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
    └── careerApi.js

back-end/src/business-suite/career/
├── career.module.ts
├── career.controller.ts
├── career.service.ts
├── entities/
│   ├── consultant.entity.ts
│   ├── user-consultant.entity.ts
│   ├── appointment.entity.ts
│   └── review.entity.ts
└── dto/
    ├── create-appointment.dto.ts
    └── create-review.dto.ts
```

#### 2.3 Jobs Board (Vagas Remotas)
**Status:** 🔴 Não Implementado
**Rota:** `/business/jobs`
**Descrição:** Vagas remotas no Brasil e exterior

**Funcionalidades Planejadas:**
- Web scraping de vagas
- Filtros avançados (país, salário, tech stack)
- Salvar vagas favoritas
- Alertas de vagas
- Redirecionamento para aplicação

**Estrutura Futura:**
```
front-end/src/modules/business-suite/jobs/
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
    └── jobsApi.js

back-end/src/business-suite/jobs/
├── jobs.module.ts
├── jobs.controller.ts
├── jobs.service.ts
├── scrapers/
│   ├── linkedin-scraper.service.ts
│   ├── indeed-scraper.service.ts
│   └── remoteok-scraper.service.ts
├── entities/
│   ├── job.entity.ts
│   ├── saved-job.entity.ts
│   └── job-alert.entity.ts
└── dto/
    ├── search-jobs.dto.ts
    └── create-alert.dto.ts
```

#### 2.4 Insurance (Seguros)
**Status:** 🔴 Não Implementado
**Rota:** `/business/insurance`
**Descrição:** Planos de saúde e seguros diversos

**Funcionalidades Planejadas:**
- Catálogo de planos de saúde
- Seguros de afastamento (DTI-like)
- Seguros gerais (vida, acidentes)
- Comparação de planos
- Contratação via parceiros

**Estrutura Futura:**
```
front-end/src/modules/business-suite/insurance/
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
    └── insuranceApi.js

back-end/src/business-suite/insurance/
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

#### 2.5 Banking (Banco Digital PJ)
**Status:** 🔴 Não Implementado
**Rota:** `/business/banking`
**Descrição:** Recebimento internacional e empréstimos

**Funcionalidades Planejadas:**
- Receber pagamentos do exterior
- Conversão de moeda
- Transferência para conta PJ
- Empréstimos PJ
- Histórico de transações
- Relatórios financeiros

**Estrutura Futura:**
```
front-end/src/modules/business-suite/banking/
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
    └── bankingApi.js

back-end/src/business-suite/banking/
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

---

## 🏗️ Nova Estrutura de Pastas (Target)

### Frontend:
```
front-end/src/modules/
├── auth-social/                    # Módulo de Autenticação
│   ├── components/
│   ├── context/
│   └── pages/
│       ├── Login.jsx
│       ├── Home.jsx
│       └── UserProfile.jsx
│
├── english-learning/               # MACRO-MÓDULO 1
│   ├── shared/                     # Compartilhado entre submódulos
│   │   ├── components/
│   │   └── hooks/
│   │
│   ├── course/                     # 1.1 English Course
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
│   │
│   ├── conversation/               # 1.2 English Conversation
│   │   ├── components/
│   │   └── pages/
│   │
│   ├── teachers/                   # 1.3 English Teachers (FUTURO)
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   │
│   ├── Dashboard.jsx               # Dashboard principal do Learning
│   └── EnglishLearningRoutes.jsx  # Rotas do macro-módulo
│
├── business-suite/                 # MACRO-MÓDULO 2
│   ├── shared/                     # Compartilhado entre submódulos
│   │   ├── components/
│   │   └── hooks/
│   │
│   ├── accounting/                 # 2.1 Accounting (FUTURO)
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   │
│   ├── career/                     # 2.2 Career Consulting (FUTURO)
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   │
│   ├── jobs/                       # 2.3 Jobs Board (FUTURO)
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   │
│   ├── insurance/                  # 2.4 Insurance (FUTURO)
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   │
│   ├── banking/                    # 2.5 Banking (FUTURO)
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   │
│   ├── Dashboard.jsx               # Dashboard principal do Business
│   └── BusinessSuiteRoutes.jsx    # Rotas do macro-módulo
│
└── admin/                          # Módulo Admin
    ├── components/
    └── pages/
```

### Backend:
```
back-end/src/
├── users/                          # Usuários (shared)
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── entities/
│
├── english-learning/               # MACRO-MÓDULO 1
│   ├── course/                     # 1.1 English Course
│   │   ├── course.module.ts
│   │   ├── course.controller.ts
│   │   ├── course.service.ts
│   │   └── entities/
│   │
│   ├── conversation/               # 1.2 English Conversation
│   │   ├── conversation.module.ts
│   │   ├── conversation.controller.ts
│   │   ├── conversation.service.ts
│   │   └── entities/
│   │
│   ├── teachers/                   # 1.3 English Teachers (FUTURO)
│   │   ├── teachers.module.ts
│   │   ├── teachers.controller.ts
│   │   ├── teachers.service.ts
│   │   └── entities/
│   │
│   └── english-learning.module.ts  # Module agregador
│
├── business-suite/                 # MACRO-MÓDULO 2
│   ├── accounting/                 # 2.1 Accounting (FUTURO)
│   │   ├── accounting.module.ts
│   │   ├── accounting.controller.ts
│   │   ├── accounting.service.ts
│   │   └── entities/
│   │
│   ├── career/                     # 2.2 Career (FUTURO)
│   ├── jobs/                       # 2.3 Jobs (FUTURO)
│   ├── insurance/                  # 2.4 Insurance (FUTURO)
│   ├── banking/                    # 2.5 Banking (FUTURO)
│   │
│   └── business-suite.module.ts    # Module agregador
│
├── tts/                            # TTS Service (shared)
├── app.module.ts                   # App principal
└── main.ts
```

---

## 🔄 Sistema de Rotas

### Rotas Principais:
```
/                           → Landing Page
/login                      → Login
/home                       → Home (escolhe macro-módulo)
/profile                    → Perfil do usuário

/learning/*                 → English Learning (macro-módulo)
/business/*                 → Business Suite (macro-módulo)

/admin/*                    → Admin Panel
```

### Rotas do English Learning:
```
/learning                   → Dashboard do Learning
/learning/course            → English Course Dashboard
/learning/course/lessons/:level → Lições por nível
/learning/course/practice/:id → Praticar lição
/learning/course/review     → Revisão (SRS)
/learning/conversation      → Conversation Dashboard
/learning/conversation/queue → Fila de matching
/learning/conversation/room/:id → Sala de conversação
/learning/teachers          → Teachers (FUTURO)
```

### Rotas do Business Suite:
```
/business                   → Dashboard do Business
/business/accounting        → Accounting (FUTURO)
/business/career            → Career Consulting (FUTURO)
/business/jobs              → Jobs Board (FUTURO)
/business/insurance         → Insurance (FUTURO)
/business/banking           → Banking (FUTURO)
```

---

## 🎨 Home Page - Novo Design

```jsx
// Home.jsx

<div>
  <h1>Bem-vindo, {user.name}!</h1>

  {/* Macro-Módulo 1 */}
  <section>
    <h2>📚 English Learning</h2>
    <p>Aprenda e pratique inglês</p>

    <div className="cards">
      <Card title="Aulas de Inglês" route="/learning/course" />
      <Card title="Conversação" route="/learning/conversation" />
      <Card title="Professores" route="/learning/teachers" status="coming-soon" />
    </div>
  </section>

  {/* Macro-Módulo 2 */}
  <section>
    <h2>💼 Business Suite</h2>
    <p>Estruture seu negócio PJ</p>

    <div className="cards">
      <Card title="Contabilidade" route="/business/accounting" status="coming-soon" />
      <Card title="Consultoria" route="/business/career" status="coming-soon" />
      <Card title="Vagas Remotas" route="/business/jobs" status="coming-soon" />
      <Card title="Seguros" route="/business/insurance" status="coming-soon" />
      <Card title="Banco PJ" route="/business/banking" status="coming-soon" />
    </div>
  </section>
</div>
```

---

## 📊 Banco de Dados - Schema Organizacional

### Tabelas por Macro-Módulo:

**ENGLISH LEARNING:**
```sql
-- Course
lessons
questions
user_progress
answer_history
reviews

-- Conversation
video_call_rooms
conversation_sessions
session_rooms
queue_users
active_periods

-- Teachers (FUTURO)
teachers
user_teacher_assignments
live_classes
teacher_reviews
```

**BUSINESS SUITE:**
```sql
-- Accounting
cnpjs
accountants
user_accountant_assignments
accounting_documents

-- Career
consultants
user_consultant_assignments
appointments
consultant_reviews

-- Jobs
jobs
saved_jobs
job_alerts

-- Insurance
insurance_plans
user_policies
insurance_quotes

-- Banking
bank_accounts
transactions
loans
currency_conversions
```

---

## 🚀 Plano de Migração (Sem Quebrar o que Funciona)

### Fase 1: Criar Estrutura de Pastas ✅
- Criar `/english-learning` e `/business-suite`
- Criar arquivos de rotas agregadores
- Criar Dashboards principais

### Fase 2: Mover Módulos Existentes (Sem Quebrar)
- **NÃO mover fisicamente** os arquivos ainda
- Criar **rotas alias** que apontam para os módulos atuais
- Testar que tudo continua funcionando

### Fase 3: Migração Gradual
- Copiar `english-course` para `english-learning/course`
- Atualizar imports internos
- Manter rotas antigas funcionando (backward compatibility)
- Testar

### Fase 4: Finalização
- Remover módulos antigos
- Remover rotas deprecated
- Documentar nova estrutura

---

## 📝 Próximos Passos IMEDIATOS

1. ✅ Criar estrutura de pastas vazias
2. ✅ Criar arquivos de rotas agregadores
3. ✅ Atualizar Home.jsx com 2 macro-módulos
4. ✅ Criar alias de rotas (não quebrar o existente)
5. ⏳ Testar que tudo funciona
6. ⏳ Documentar para futuros desenvolvedores

---

## ⚠️ Princípios da Migração

1. **NÃO QUEBRAR** o que já funciona
2. **CRIAR NOVO** antes de remover antigo
3. **TESTAR** cada passo
4. **DOCUMENTAR** mudanças
5. **BACKWARD COMPATIBILITY** até estabilizar

---

**Versão:** 1.0
**Data:** 2025-10-23
**Status:** 🟢 Pronto para começar migração
