# English Course Module - Documentação Completa

## 📚 Visão Geral

Sistema completo de aprendizado de inglês que combina:
- **Vídeo-aulas do YouTube** organizadas em estágios temáticos
- **Flashcards estilo Cloze** (pergunta/resposta/exemplo)
- **Algoritmo SM-2** (Spaced Repetition) para otimização de memorização
- **Autonomia do usuário** (pode pular units, estuda no próprio ritmo)

---

## 🎯 Conceito Geral

### Diferença da Versão Antiga

| Aspecto | Versão Antiga ❌ | Versão Nova ✅ |
|---------|-----------------|---------------|
| **Estrutura** | Lessons por nível (A1, A2, B1...) | Stages temáticos + Units |
| **Conteúdo** | Perguntas múltipla escolha | Vídeos do YouTube + Flashcards |
| **Revisão** | Deck por lesson | Deck global único |
| **Algoritmo** | Sem spaced repetition | SM-2 com intervalos progressivos |
| **Cards** | Não existiam | Cloze cards (pergunta/resposta/exemplo) |
| **Progresso** | Por lesson | Por stage/unit + cards individuais |
| **Áudio** | Não tinha | Suporte a áudio nos cards |
| **Autonomia** | Linear | Pode pular units |

---

## 🏗️ Hierarquia de Conteúdo

```
📦 ENGLISH COURSE
│
├── 📂 STAGE 1: Greetings & Introductions
│   ├── 📹 Unit 1.1: How to say hello
│   │   └── 🎴 5 cards (criados pelo admin)
│   ├── 📹 Unit 1.2: Introducing yourself
│   │   └── 🎴 5 cards (criados pelo admin)
│   └── 📹 Unit 1.3: Common greetings
│       └── 🎴 5 cards (criados pelo admin)
│
├── 📂 STAGE 2: Travel English
│   ├── 📹 Unit 2.1: At the airport
│   ├── 📹 Unit 2.2: Booking a hotel
│   └── 📹 Unit 2.3: Asking for directions
│
├── 📂 STAGE 3: Business English
│   └── ...
│
└── 🔄 GLOBAL REVIEW DECK (todos os cards em um só lugar)
```

**Características:**
- Stages têm ordem fixa (1, 2, 3...)
- Units dentro do stage têm ordem fixa
- Usuário pode **pular** units se já souber o conteúdo
- Cards vão todos para um **deck global de revisão**

---

## 💾 Estrutura do Banco de Dados

### 1. Tabela `stages`

Representa os blocos temáticos grandes.

```sql
CREATE TABLE stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP,
  deleted_by UUID
);

CREATE INDEX idx_stages_order ON stages(order_index);
CREATE INDEX idx_stages_deleted_at ON stages(deleted_at);
```

**Exemplo de dados:**
```json
{
  "id": "uuid-1",
  "title": "Greetings & Introductions",
  "description": "Learn the basics of greeting people and introducing yourself",
  "order_index": 1
}
```

---

### 2. Tabela `units`

Representa lições individuais (cada uma com um vídeo do YouTube).

```sql
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  youtube_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  video_duration INTEGER,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP,
  deleted_by UUID
);

CREATE INDEX idx_units_stage_id ON units(stage_id);
CREATE INDEX idx_units_order ON units(stage_id, order_index);
CREATE INDEX idx_units_deleted_at ON units(deleted_at);
```

**Exemplo de dados:**
```json
{
  "id": "uuid-10",
  "stage_id": "uuid-1",
  "title": "How to say hello",
  "description": "Learn different ways to greet someone in English",
  "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "thumbnail_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "video_duration": 300,
  "order_index": 1
}
```

---

### 3. Tabela `cards`

Cards de flashcard no formato Cloze (pergunta → resposta → exemplo).

```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  example_sentence TEXT,
  audio_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP,
  deleted_by UUID
);

CREATE INDEX idx_cards_unit_id ON cards(unit_id);
CREATE INDEX idx_cards_deleted_at ON cards(deleted_at);
```

**Exemplo de dados:**
```json
{
  "id": "uuid-100",
  "unit_id": "uuid-10",
  "question": "How do you say 'hello' formally?",
  "answer": "Good morning / Good afternoon / Good evening",
  "example_sentence": "Good morning, Mr. Smith. How are you today?",
  "audio_url": "https://storage.example.com/audio/good-morning.mp3"
}
```

**Importante:**
- Cards são **templates pré-criados pelo admin**
- Quando usuário completa uma unit, esses cards são **associados ao usuário**
- Cards não são criados dinamicamente - são pré-cadastrados

---

### 4. Tabela `user_stage_progress`

Rastreia quais stages o usuário iniciou/completou.

```sql
CREATE TABLE user_stage_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,

  UNIQUE(user_id, stage_id)
);

CREATE INDEX idx_user_stage_progress_user_id ON user_stage_progress(user_id);
CREATE INDEX idx_user_stage_progress_stage_id ON user_stage_progress(stage_id);
```

**Lógica:**
- Registro criado quando usuário abre um stage pela primeira vez
- `is_completed = TRUE` quando **todas as units** do stage forem completadas

---

### 5. Tabela `user_unit_progress`

Rastreia progresso de visualização de vídeos e conclusão de units.

```sql
CREATE TABLE user_unit_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  watch_time_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, unit_id)
);

CREATE INDEX idx_user_unit_progress_user_id ON user_unit_progress(user_id);
CREATE INDEX idx_user_unit_progress_unit_id ON user_unit_progress(unit_id);
```

**Fluxo:**
1. Usuário abre uma unit e começa a assistir o vídeo
2. Frontend atualiza `watch_time_seconds` periodicamente (a cada 10 segundos)
3. Quando `watch_time_seconds >= video_duration * 0.8` (80%), botão "Completar" é habilitado
4. Usuário clica em "Completar Unit"
5. Backend marca `is_completed = TRUE` e **cria cards** para o usuário

**Autonomia:**
- Usuário pode clicar em "Pular Unit" sem assistir 80%
- Neste caso, cards **não são criados** automaticamente
- Pode voltar depois e completar

---

### 6. Tabela `user_card_progress` ⭐ (MAIS IMPORTANTE)

Coração do sistema de spaced repetition. Rastreia o progresso individual de cada card.

```sql
CREATE TABLE user_card_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,

  -- Campos do algoritmo SM-2
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,

  -- Estado do card
  state VARCHAR(20) DEFAULT 'new',

  -- Agendamento
  next_review_date TIMESTAMP NOT NULL,
  last_reviewed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, card_id)
);

CREATE INDEX idx_user_card_progress_user_id ON user_card_progress(user_id);
CREATE INDEX idx_user_card_progress_card_id ON user_card_progress(card_id);
CREATE INDEX idx_user_card_progress_next_review ON user_card_progress(next_review_date);
CREATE INDEX idx_user_card_progress_state ON user_card_progress(state);
```

**Explicação dos campos:**

| Campo | Descrição |
|-------|-----------|
| `ease_factor` | Fator de facilidade (1.3 a 2.5). Controla quão rápido os intervalos crescem. Valor inicial: 2.5 |
| `interval` | Intervalo em **MINUTOS** (não dias!). Ex: 1, 10, 1440 (1 dia), 7200 (5 dias), 43200 (30 dias) |
| `repetitions` | Quantas vezes acertou o card seguidas. Quando marca "De novo", volta para 0 |
| `state` | 'new' (nunca estudado), 'learning' (intervalos curtos), 'review' (intervalos longos) |
| `next_review_date` | Data/hora exata da próxima revisão. Calculado como: `NOW() + interval minutos` |
| `last_reviewed_at` | Última vez que o card foi revisado |

**Exemplo de registro:**
```json
{
  "id": "uuid-1000",
  "user_id": "uuid-user-1",
  "card_id": "uuid-100",
  "ease_factor": 2.3,
  "interval": 7200,
  "repetitions": 3,
  "state": "review",
  "next_review_date": "2025-10-31T14:30:00Z",
  "last_reviewed_at": "2025-10-26T14:30:00Z"
}
```

---

### 7. Tabela `review_sessions`

Histórico de todas as revisões (para estatísticas e análise).

```sql
CREATE TABLE review_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  result VARCHAR(20) NOT NULL,
  time_taken_seconds INTEGER,
  ease_factor_after DECIMAL(3,2),
  interval_after INTEGER,
  reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_review_sessions_user_id ON review_sessions(user_id);
CREATE INDEX idx_review_sessions_card_id ON review_sessions(card_id);
CREATE INDEX idx_review_sessions_reviewed_at ON review_sessions(reviewed_at);
```

**Usado para:**
- Dashboard de estatísticas (quantos cards revisados hoje, taxa de acerto)
- Gráficos de progresso ao longo do tempo
- Identificar cards difíceis (muitos "wrong")

---

### 8. Sistema de Auditoria (Audit System)

**Implementação:**
As entidades principais (`stages`, `units`, `cards`) estendem a classe base `AuditEntity`, que fornece campos de rastreamento automático:

```typescript
// back-end/src/common/entities/audit.entity.ts
export abstract class AuditEntity {
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'updated_by' })
  updatedBy: string;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'deleted_by' })
  deletedBy: string;
}
```

**Campos de Auditoria:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `created_at` | TIMESTAMP | Data/hora de criação (automático) |
| `created_by` | UUID | ID do usuário que criou o registro |
| `updated_at` | TIMESTAMP | Data/hora da última atualização (automático) |
| `updated_by` | UUID | ID do usuário que fez a última atualização |
| `deleted_at` | TIMESTAMP | Data/hora de soft delete (null se não deletado) |
| `deleted_by` | UUID | ID do usuário que deletou o registro |

**Soft Delete:**
- Registros NÃO são removidos do banco de dados
- Campo `deleted_at` é preenchido com timestamp da deleção
- Queries devem filtrar registros onde `deleted_at IS NULL`
- Permite recuperação de dados e auditoria completa

**Benefícios:**
- Rastreamento completo de ações administrativas
- Possibilidade de reverter deleções acidentais
- Compliance com regulamentações (LGPD, GDPR)
- Auditoria para investigação de problemas

---

## 🧠 Algoritmo SM-2 (Spaced Repetition)

### O que é SM-2?

**SM-2 (SuperMemo 2)** é um algoritmo de **spaced repetition** (repetição espaçada) criado em 1987.

**Princípio:**
> Você deve revisar informações **pouco antes de esquecê-las**. Se você revisa muito cedo, perde tempo. Se revisa muito tarde, já esqueceu.

**Como funciona:**
- Intervalos crescem exponencialmente quando você acerta
- Intervalos resetam quando você erra
- "Facilidade" de cada card é ajustada individualmente

---

### Estados dos Cards

```
┌─────────┐  Primeira   ┌──────────┐  Acertou 3+  ┌─────────┐
│   NEW   │────vez───────▶│ LEARNING │────vezes────▶│ REVIEW  │
└─────────┘              └──────────┘              └─────────┘
                              │                          │
                              │ Errou (wrong)            │
                              └──────────────────────────┘
                                     (volta pra learning)
```

**NEW (Novo):**
- Card que o usuário nunca viu
- `repetitions = 0`
- `next_review_date = NOW()` (disponível imediatamente)

**LEARNING (Aprendendo):**
- Card que está sendo aprendido
- Intervalos curtos: 1min, 10min
- `repetitions < 3`
- Se acertar 3 vezes, vira REVIEW

**REVIEW (Revisão):**
- Card já aprendido
- Intervalos longos: dias, semanas, meses
- `repetitions >= 3`
- Se errar (wrong), volta para LEARNING

---

### Intervalos Progressivos

**Para cards NOVOS (state='new'):**
```
Primeira vez: <1 minuto (se errar ou difícil)
Segunda vez: <10 minutos
Terceira vez: 1 dia
Quarta vez: 5 dias
```

**Para cards em REVIEW (state='review'):**
```
Fórmula: novo_intervalo = intervalo_anterior × ease_factor

Exemplo com ease_factor = 2.5:
5 dias → 12 dias → 30 dias → 75 dias → 6 meses → 1.5 anos → 3.7 anos
```

---

### Cálculo de Intervalo

```typescript
function calculateNextReview(
  cardProgress: CardProgress,
  result: 'wrong' | 'hard' | 'good' | 'easy'
): CardProgress {

  let { ease_factor, interval, repetitions, state } = cardProgress;

  // Constantes
  const MIN_EASE = 1.3;
  const MAX_EASE = 2.5;

  // ========================================
  // RESULTADO: WRONG (De novo) 🔴
  // ========================================
  if (result === 'wrong') {
    ease_factor = Math.max(MIN_EASE, ease_factor - 0.2);
    interval = 1;                    // 1 minuto
    repetitions = 0;                 // Reseta
    state = 'learning';
  }

  // ========================================
  // RESULTADO: HARD (Difícil) 🟡
  // ========================================
  else if (result === 'hard') {
    ease_factor = Math.max(MIN_EASE, ease_factor - 0.15);

    if (state === 'new') {
      interval = 1;                  // 1 minuto
      repetitions = 0;
      state = 'learning';
    }
    else if (state === 'learning') {
      interval = 10;                 // 10 minutos
      repetitions = Math.min(repetitions + 1, 2);
    }
    else { // review
      interval = Math.round(interval * 1.2);
      repetitions++;
    }
  }

  // ========================================
  // RESULTADO: GOOD (Bom) 🟢
  // ========================================
  else if (result === 'good') {
    if (state === 'new') {
      interval = 1;                  // 1 minuto
      repetitions = 1;
      state = 'learning';
    }
    else if (state === 'learning') {
      if (repetitions === 0) {
        interval = 10;               // 10 minutos
        repetitions = 1;
      }
      else if (repetitions === 1) {
        interval = 1440;             // 1 dia
        repetitions = 2;
      }
      else {
        interval = 7200;             // 5 dias
        repetitions = 3;
        state = 'review';
      }
    }
    else { // review
      interval = Math.round(interval * ease_factor);
      repetitions++;
    }
  }

  // ========================================
  // RESULTADO: EASY (Fácil) 🔵
  // ========================================
  else if (result === 'easy') {
    ease_factor = Math.min(MAX_EASE, ease_factor + 0.1);

    if (state === 'new' || state === 'learning') {
      interval = 7200;               // 5 dias
      repetitions = 3;
      state = 'review';
    }
    else { // review
      interval = Math.round(interval * ease_factor * 1.3);
      repetitions++;
    }
  }

  const next_review_date = new Date(Date.now() + interval * 60 * 1000);

  return {
    ease_factor,
    interval,
    repetitions,
    state,
    next_review_date
  };
}
```

---

### Exemplo Prático de Progressão

**Card: "What is 'apple' in Portuguese?"**

```
📅 Dia 1 - 10:00
Estado: NEW
Usuário revisa → Clica "Good" 🟢
Resultado: interval = 1min, state = LEARNING, next_review = 10:01

📅 Dia 1 - 10:01
Estado: LEARNING (rep=1)
Usuário revisa → Clica "Good" 🟢
Resultado: interval = 10min, next_review = 10:11

📅 Dia 1 - 10:11
Estado: LEARNING (rep=2)
Usuário revisa → Clica "Good" 🟢
Resultado: interval = 1440min (1 dia), next_review = Dia 2 10:11

📅 Dia 2 - 10:11
Estado: LEARNING (rep=3)
Usuário revisa → Clica "Good" 🟢
Resultado: interval = 7200min (5 dias), state = REVIEW, next_review = Dia 7 10:11

📅 Dia 7 - 10:11
Estado: REVIEW (rep=4, ease=2.5)
Usuário revisa → Clica "Good" 🟢
Resultado: interval = 18000min (12.5 dias), next_review = Dia 19

📅 Dia 19
Estado: REVIEW (rep=5, ease=2.5)
Usuário revisa → Clica "Good" 🟢
Resultado: interval = 45000min (31 dias), next_review = Dia 50

📅 Dia 50
Estado: REVIEW (rep=6, ease=2.5)
Usuário revisa → Clica "Easy" 🔵
ease_factor = 2.6
Resultado: interval = 152100min (105 dias), next_review = Dia 155
```

**Se errar:**
```
📅 Dia 50
Estado: REVIEW (rep=6, ease=2.5)
Usuário revisa → Clica "Wrong" 🔴
Resultado: interval = 1min, repetitions = 0, state = LEARNING
RECOMEÇA DO ZERO!
```

---

## 🔄 Fluxos de Uso

### Fluxo 1: Usuário Estuda uma Nova Unit

```
1️⃣ Usuário entra no Dashboard
   ▼
2️⃣ Clica no Stage "Greetings & Introductions"
   - Backend cria registro em user_stage_progress (se não existir)
   ▼
3️⃣ Vê lista de units do stage
   - Unit 1.1: How to say hello ✅ (completado)
   - Unit 1.2: Introducing yourself ⬅️ (você está aqui)
   - Unit 1.3: Common greetings (pode pular se quiser)
   ▼
4️⃣ Clica em "Unit 1.2: Introducing yourself"
   - Frontend cria registro em user_unit_progress (se não existir)
   - Mostra página com:
     * YouTube player (iframe)
     * Descrição da unit
     * Botão "Completar Unit" (desabilitado)
   ▼
5️⃣ Usuário assiste o vídeo
   - Frontend atualiza watch_time_seconds a cada 10 segundos
   - Quando watch_time >= video_duration * 0.8:
     * Botão "Completar Unit" fica HABILITADO
   ▼
6️⃣ Usuário clica "Completar Unit"
   - Backend:
     ✓ Marca is_completed = TRUE em user_unit_progress
     ✓ Busca todos os cards desta unit
     ✓ Para cada card, cria registro em user_card_progress:
       {
         state: 'new',
         ease_factor: 2.5,
         interval: 0,
         repetitions: 0,
         next_review_date: NOW()
       }
   - Frontend mostra notificação:
     "✅ Unit completada! 5 novos cards adicionados ao seu deck de revisão"
```

**Opção alternativa: Pular Unit**

```
4️⃣ Usuário clica "Pular Unit"
   - Backend: NÃO cria cards
   - Usuário pode continuar para próxima unit
   - Pode voltar depois e completar
```

---

### Fluxo 2: Sessão de Revisão (Review Session)

```
1️⃣ Usuário clica "Iniciar Revisão" no Dashboard
   ▼
2️⃣ Backend busca cards disponíveis:
   - WHERE user_id = ? AND next_review_date <= NOW()
   - Ordena por: state ASC, next_review_date ASC
   - Limite: máximo 20 cards por sessão
   ▼
3️⃣ Frontend mostra interface de revisão:

   ┌─────────────────────────────────────┐
   │     🎴 Review Session (1/20)        │
   ├─────────────────────────────────────┤
   │                                     │
   │  ❓ Pergunta:                       │
   │  How do you say 'hello' formally?   │
   │                                     │
   │  [ 👁️ Mostrar Resposta ]            │
   │                                     │
   └─────────────────────────────────────┘

   ▼ Usuário clica "Mostrar Resposta"

   ┌─────────────────────────────────────┐
   │     🎴 Review Session (1/20)        │
   ├─────────────────────────────────────┤
   │                                     │
   │  ❓ Pergunta:                       │
   │  How do you say 'hello' formally?   │
   │                                     │
   │  ✅ Resposta:                       │
   │  Good morning / Good afternoon      │
   │                                     │
   │  📝 Exemplo:                        │
   │  Good morning, Mr. Smith.           │
   │  How are you today?                 │
   │                                     │
   │  🔊 [Play Audio]                    │
   │                                     │
   ├─────────────────────────────────────┤
   │  Como foi?                          │
   │                                     │
   │  [🔴 De novo]  [🟡 Difícil]        │
   │    <1 min        <10 min            │
   │                                     │
   │  [🟢 Bom]      [🔵 Fácil]          │
   │    1 dia         5 dias             │
   └─────────────────────────────────────┘

   ▼
4️⃣ Usuário escolhe dificuldade
   - Frontend envia:
     POST /api/english-course/review
     {
       card_id: "uuid-100",
       result: "good",
       time_taken_seconds: 8
     }
   ▼
5️⃣ Backend processa:
   - Busca user_card_progress atual
   - Chama calculateNextReview(progress, "good")
   - Atualiza user_card_progress com novos valores
   - Cria registro em review_sessions
   ▼
6️⃣ Frontend avança para próximo card
   - Repete até terminar todos os 20 cards
   ▼
7️⃣ Fim da sessão - mostra estatísticas:

   ┌─────────────────────────────────────┐
   │     🎉 Sessão Completa!             │
   ├─────────────────────────────────────┤
   │                                     │
   │  Você revisou 20 cards!             │
   │                                     │
   │  📊 Estatísticas:                   │
   │  🔴 De novo: 2 (10%)                │
   │  🟡 Difícil: 5 (25%)                │
   │  🟢 Bom: 10 (50%)                   │
   │  🔵 Fácil: 3 (15%)                  │
   │                                     │
   │  ⏱️ Próxima revisão em: 30 min     │
   │  (você tem 5 cards prontos)         │
   │                                     │
   │  [Revisar mais] [Voltar]            │
   └─────────────────────────────────────┘
```

---

### Fluxo 3: Dashboard e Progresso

```
┌─────────────────────────────────────────────────────┐
│  🎓 English Course - Dashboard                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📊 Seu Progresso Hoje:                            │
│  ├─ 🎴 20 cards revisados                          │
│  ├─ ✅ 85% taxa de acerto                          │
│  ├─ ⏱️ 15 min de estudo                            │
│  └─ 🔥 7 dias de sequência!                        │
│                                                     │
│  🔄 Revisão:                                        │
│  ├─ 🆕 5 cards novos disponíveis                   │
│  ├─ 📚 12 cards em aprendizado                     │
│  ├─ ♻️ 3 cards para revisar agora                  │
│  └─ [🚀 Iniciar Revisão]                           │
│                                                     │
│  📂 Stages:                                         │
│  ┌───────────────────────────────┐                 │
│  │ ✅ Stage 1: Greetings         │                 │
│  │    3/3 units completadas      │                 │
│  │    ████████████████ 100%      │                 │
│  └───────────────────────────────┘                 │
│                                                     │
│  ┌───────────────────────────────┐                 │
│  │ 🔄 Stage 2: Travel English    │                 │
│  │    1/5 units completadas      │                 │
│  │    ████░░░░░░░░░░░ 20%        │                 │
│  └───────────────────────────────┘                 │
│                                                     │
│  ┌───────────────────────────────┐                 │
│  │ 🔒 Stage 3: Business English  │                 │
│  │    0/4 units completadas      │                 │
│  │    ░░░░░░░░░░░░░░░░ 0%        │                 │
│  └───────────────────────────────┘                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Dados calculados:**
- **Cards revisados hoje**: COUNT de `review_sessions` WHERE `reviewed_at >= TODAY`
- **Taxa de acerto**: % de cards com result='good' ou 'easy'
- **Sequência**: Quantos dias consecutivos com pelo menos 1 card revisado
- **Cards novos**: COUNT WHERE `state='new' AND next_review_date <= NOW()`
- **Cards em aprendizado**: COUNT WHERE `state='learning'`
- **Cards para revisar**: COUNT WHERE `next_review_date <= NOW()`

---

## 🗂️ Estrutura de Código

### Backend (NestJS)

```
back-end/src/
│
├── 📁 common/
│   └── 📁 entities/
│       └── audit.entity.ts          (base class com campos de auditoria)
│
└── 📁 modules/english-learning/course/
    │
    ├── 📁 entities/
    │   ├── stage.entity.ts           (extends AuditEntity)
    │   ├── unit.entity.ts            (extends AuditEntity)
    │   ├── card.entity.ts            (extends AuditEntity)
    │   ├── user-stage-progress.entity.ts
    │   ├── user-unit-progress.entity.ts
    │   ├── user-card-progress.entity.ts
    │   └── review-session.entity.ts
    │
    ├── 📁 dto/
    │   ├── create-stage.dto.ts
    │   ├── update-stage.dto.ts
    │   ├── create-unit.dto.ts
    │   ├── update-unit.dto.ts
    │   ├── create-card.dto.ts
    │   ├── update-card.dto.ts
    │   ├── complete-unit.dto.ts
    │   └── review-card.dto.ts
    │
    ├── 📁 services/
    │   ├── stages.service.ts          (CRUD de stages + audit)
    │   ├── units.service.ts            (CRUD de units + audit)
    │   ├── cards.service.ts            (CRUD de cards + audit)
    │   ├── progress.service.ts         (lógica de progresso)
    │   ├── review.service.ts           (lógica de revisão)
    │   └── sm2.service.ts              (algoritmo SM-2)
    │
    ├── 📁 controllers/
    │   ├── stages.controller.ts
    │   ├── units.controller.ts
    │   ├── cards.controller.ts
    │   ├── progress.controller.ts
    │   └── review.controller.ts
    │
    └── english-course.module.ts
```

---

### Frontend (React)

```
front-end/src/modules/english-learning/course/
│
├── 📁 components/
│   ├── StageCard.jsx              (card visual do stage)
│   ├── UnitCard.jsx               (card visual da unit)
│   ├── VideoPlayer.jsx            (YouTube iframe)
│   ├── ReviewCard.jsx             (interface de revisão)
│   ├── ProgressBar.jsx            (barra de progresso)
│   ├── StatsWidget.jsx            (widget de estatísticas)
│   └── ReviewButton.jsx           (botões de dificuldade)
│
├── 📁 pages/
│   ├── CourseDashboard.jsx        (dashboard principal)
│   ├── StageView.jsx              (lista de units)
│   ├── UnitView.jsx               (vídeo + descrição)
│   └── ReviewSession.jsx          (sessão de revisão)
│
├── 📁 services/
│   └── courseApi.js               (chamadas HTTP)
│
├── 📁 hooks/
│   ├── useStages.js
│   ├── useUnits.js
│   ├── useReview.js
│   └── useProgress.js
│
└── 📁 utils/
    ├── sm2.js                     (lógica SM-2 no frontend)
    └── timeFormatter.js           (formatar intervalos)
```

---

## 🌐 API Endpoints

### Stages

```
GET    /api/english-course/stages
       Retorna todos os stages (ordenados por order_index)

GET    /api/english-course/stages/:id
       Retorna um stage específico

POST   /api/english-course/stages (ADMIN)
       Cria novo stage
       Body: { title, description, order_index }

PATCH  /api/english-course/stages/:id (ADMIN)
       Atualiza stage

DELETE /api/english-course/stages/:id (ADMIN)
       Deleta stage
```

### Units

```
GET    /api/english-course/stages/:stageId/units
       Retorna todas as units de um stage

GET    /api/english-course/units/:id
       Retorna uma unit específica

POST   /api/english-course/units (ADMIN)
       Cria nova unit
       Body: {
         stage_id,
         title,
         description,
         youtube_url,
         thumbnail_url,
         video_duration,
         order_index
       }

PATCH  /api/english-course/units/:id (ADMIN)
       Atualiza unit

DELETE /api/english-course/units/:id (ADMIN)
       Deleta unit
```

### Cards

```
GET    /api/english-course/units/:unitId/cards
       Retorna todos os cards de uma unit

GET    /api/english-course/cards/:id
       Retorna um card específico

POST   /api/english-course/cards (ADMIN)
       Cria novo card
       Body: {
         unit_id,
         question,
         answer,
         example_sentence,
         audio_url
       }

PATCH  /api/english-course/cards/:id (ADMIN)
       Atualiza card

DELETE /api/english-course/cards/:id (ADMIN)
       Deleta card
```

### Progress

```
GET    /api/english-course/progress/dashboard
       Retorna estatísticas do dashboard do usuário
       Response: {
         stats_today: {
           cards_reviewed,
           accuracy_rate,
           study_time,
           streak
         },
         cards_due: {
           new,
           learning,
           review
         },
         stages_progress: [
           {
             stage,
             units_completed,
             units_total,
             percentage
           }
         ]
       }

GET    /api/english-course/progress/stages/:stageId
       Retorna progresso do usuário em um stage específico

POST   /api/english-course/progress/units/:unitId/start
       Marca que usuário começou a assistir uma unit

PATCH  /api/english-course/progress/units/:unitId/update-watch-time
       Atualiza tempo assistido
       Body: { watch_time_seconds }

POST   /api/english-course/progress/units/:unitId/complete
       Completa uma unit e cria cards para o usuário
       Response: { cards_created: 5 }

POST   /api/english-course/progress/units/:unitId/skip
       Pula uma unit (não cria cards)
```

### Review

```
GET    /api/english-course/review/due
       Retorna cards disponíveis para revisar
       Query params: ?limit=20
       Response: {
         cards: [...],
         has_more: boolean
       }

POST   /api/english-course/review/submit
       Envia resultado de uma revisão
       Body: {
         card_id,
         result: 'wrong'|'hard'|'good'|'easy',
         time_taken_seconds
       }
       Response: {
         next_review_date,
         interval,
         state
       }

GET    /api/english-course/review/stats
       Retorna estatísticas de revisão
       Query params: ?period=today|week|month
       Response: {
         total_reviews,
         results_breakdown: {
           wrong: 2,
           hard: 5,
           good: 10,
           easy: 3
         },
         average_time
       }
```

---

## 🎯 Configurações Fixas

**Algoritmo SM-2:**
- `ease_factor` inicial: 2.5
- `ease_factor` mínimo: 1.3
- `ease_factor` máximo: 2.5
- Intervalo "Wrong": 1 minuto
- Intervalo "Hard": 10 minutos
- Intervalo "Good" (learning): 1 dia (1440 min)
- Intervalo "Easy" (learning): 5 dias (7200 min)
- Ajuste ease "Easy": +0.1
- Ajuste ease "Hard": -0.15
- Ajuste ease "Wrong": -0.2
- Threshold learning→review: 3 repetições

**Limites:**
- Cards novos por dia: 20
- Cards por sessão: 20

**Vídeo:**
- Threshold de conclusão: 80%
- Auto-criar cards: Sim
- Permitir pular: Sim

---

## 📋 Fluxo de Criação de Conteúdo (Admin)

### 1. Admin Cria Stage

```
POST /api/english-course/stages
{
  "title": "Greetings & Introductions",
  "description": "Learn the basics of greeting people",
  "order_index": 1
}
```

### 2. Admin Cria Units no Stage

```
POST /api/english-course/units
{
  "stage_id": "uuid-stage-1",
  "title": "How to say hello",
  "description": "Learn different ways to greet someone",
  "youtube_url": "https://www.youtube.com/watch?v=...",
  "thumbnail_url": "https://img.youtube.com/vi/.../maxresdefault.jpg",
  "video_duration": 300,
  "order_index": 1
}
```

### 3. Admin Cria Cards para a Unit

```
POST /api/english-course/cards
{
  "unit_id": "uuid-unit-1",
  "question": "How do you say 'hello' formally?",
  "answer": "Good morning / Good afternoon / Good evening",
  "example_sentence": "Good morning, Mr. Smith. How are you today?",
  "audio_url": "https://storage.example.com/audio/good-morning.mp3"
}

// Repetir para criar 5 cards por unit
```

---

## ✅ Resumo Final

Este módulo é um **sistema completo de aprendizado de inglês** que:

1. ✅ Organiza conteúdo em **Stages temáticos** → **Units com vídeos**
2. ✅ Usa **flashcards Cloze** (pergunta/resposta/exemplo)
3. ✅ Implementa **algoritmo SM-2** para memorização otimizada
4. ✅ Dá **autonomia** ao usuário (pode pular, revisar no próprio ritmo)
5. ✅ Rastreia **progresso detalhado** (stages, units, cards individuais)
6. ✅ Mostra **estatísticas** e gamificação suave (sequências, taxa de acerto)
7. ✅ Suporta **áudio** para pronúncia correta

**Fluxo principal:**
```
Assiste vídeo → Completa unit → Cards criados → Revisa cards →
Intervalos crescem → Memorização de longo prazo
```

---

## 📝 Status da Implementação

### ✅ Completado

1. ✅ Migration do TypeORM com todas as 7 tabelas criadas
2. ✅ Entities no backend implementadas (Stage, Unit, Card, UserStageProgress, UserUnitProgress, UserCardProgress, ReviewSession)
3. ✅ Serviço SM-2 implementado com algoritmo completo
4. ✅ Controllers e services criados (Stages, Units, Cards, Progress, Review)
5. ✅ Testes unitários completos (57 testes passando)
6. ✅ Sistema de auditoria implementado (AuditEntity base class)
7. ✅ Migration de auditoria executada (colunas created_by, updated_by, deleted_at, deleted_by)
8. ✅ Soft delete configurado em todas as entidades principais

### 🔄 Próximos Passos

1. **Atualizar services para popular campos de auditoria:**
   - Adicionar `userId` como parâmetro em métodos create/update/delete
   - Popular campos `createdBy`, `updatedBy`, `deletedBy` automaticamente

2. **Implementar soft delete nos services:**
   - Criar método `softDelete(id, userId)` nos services
   - Adicionar filtro `deletedAt IS NULL` em queries de listagem

3. **Atualizar controllers:**
   - Re-adicionar guards de autenticação quando sistema de auth estiver pronto
   - Extrair `userId` do request autenticado
   - Passar `userId` para os métodos dos services

4. **Criar componentes React do frontend:**
   - Dashboard principal
   - Interface de stages e units
   - Player de vídeo
   - Interface de revisão de cards

5. **Implementar painel admin:**
   - CRUD de stages, units, cards
   - Visualização de logs de auditoria

6. **Testar fluxo completo end-to-end:**
   - Assistir vídeo → completar unit → revisar cards
   - Verificar soft delete funcionando
   - Validar auditoria sendo registrada corretamente
