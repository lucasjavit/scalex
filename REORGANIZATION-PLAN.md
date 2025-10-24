# Plano de Reorganização de Arquivos

## 🎯 Objetivo
Mover fisicamente os módulos existentes para a nova estrutura de macro-módulos sem quebrar nada.

---

## 📦 Estrutura ATUAL (Before)

```
front-end/src/modules/
├── auth-social/
│   ├── components/
│   ├── context/
│   └── pages/
│
├── admin/
│   ├── components/
│   └── pages/
│
├── english-course/          ← MOVER PARA english-learning/course
│   ├── components/
│   │   ├── Card.jsx
│   │   ├── QuestionCard.jsx
│   │   ├── LessonCard.jsx
│   │   ├── ProgressStats.jsx
│   │   └── FeedbackModal.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── LessonsList.jsx
│   │   ├── Practice.jsx
│   │   ├── Progress.jsx
│   │   └── Review.jsx
│   └── hooks/
│       └── useTTS.js (MOVE TO shared)
│
├── video-call/              ← MOVER PARA english-learning/conversation
│   ├── components/
│   │   ├── VideoCall.jsx
│   │   └── VideoCallSimple.jsx
│   ├── pages/
│   │   ├── VideoCallDashboard.jsx
│   │   ├── WaitingQueue.jsx
│   │   ├── VideoCallRoom.jsx
│   │   ├── Matching.jsx
│   │   └── HowItWorks.jsx
│   └── VideoCallRoutes.jsx
│
├── english-learning/        ← JÁ EXISTE
│   └── Dashboard.jsx
│
└── business-suite/          ← JÁ EXISTE
    └── Dashboard.jsx
```

---

## 📦 Estrutura NOVA (After)

```
front-end/src/modules/
├── auth-social/             # Mantém igual
│   ├── components/
│   ├── context/
│   └── pages/
│
├── admin/                   # Mantém igual
│   ├── components/
│   └── pages/
│
├── english-learning/        # MACRO-MÓDULO 1
│   ├── Dashboard.jsx        # ✅ Já existe
│   │
│   ├── shared/              # NOVO - Componentes compartilhados
│   │   ├── components/
│   │   └── hooks/
│   │       └── useTTS.js    # Movido de english-course/hooks
│   │
│   ├── course/              # NOVO - Movido de english-course/
│   │   ├── components/
│   │   │   ├── Card.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   ├── LessonCard.jsx
│   │   │   ├── ProgressStats.jsx
│   │   │   └── FeedbackModal.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── LessonsList.jsx
│   │   │   ├── Practice.jsx
│   │   │   ├── Progress.jsx
│   │   │   └── Review.jsx
│   │   └── hooks/
│   │
│   ├── conversation/        # NOVO - Movido de video-call/
│   │   ├── components/
│   │   │   ├── VideoCall.jsx
│   │   │   └── VideoCallSimple.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx (renomeado de VideoCallDashboard)
│   │   │   ├── WaitingQueue.jsx
│   │   │   ├── VideoCallRoom.jsx
│   │   │   ├── Matching.jsx
│   │   │   └── HowItWorks.jsx
│   │   └── ConversationRoutes.jsx (renomeado de VideoCallRoutes)
│   │
│   └── teachers/            # FUTURO - Placeholder
│       └── .gitkeep
│
└── business-suite/          # MACRO-MÓDULO 2
    ├── Dashboard.jsx        # ✅ Já existe
    │
    ├── shared/              # NOVO - Placeholder
    │   ├── components/
    │   └── hooks/
    │
    ├── accounting/          # FUTURO - Placeholder
    │   └── .gitkeep
    ├── career/              # FUTURO - Placeholder
    │   └── .gitkeep
    ├── jobs/                # FUTURO - Placeholder
    │   └── .gitkeep
    ├── insurance/           # FUTURO - Placeholder
    │   └── .gitkeep
    └── banking/             # FUTURO - Placeholder
        └── .gitkeep
```

---

## 🔄 Passos da Migração

### FASE 1: Criar estrutura de pastas vazias ✅
```bash
mkdir -p front-end/src/modules/english-learning/shared/components
mkdir -p front-end/src/modules/english-learning/shared/hooks
mkdir -p front-end/src/modules/english-learning/course
mkdir -p front-end/src/modules/english-learning/conversation
mkdir -p front-end/src/modules/english-learning/teachers
mkdir -p front-end/src/modules/business-suite/shared/components
mkdir -p front-end/src/modules/business-suite/shared/hooks
mkdir -p front-end/src/modules/business-suite/accounting
mkdir -p front-end/src/modules/business-suite/career
mkdir -p front-end/src/modules/business-suite/jobs
mkdir -p front-end/src/modules/business-suite/insurance
mkdir -p front-end/src/modules/business-suite/banking
```

### FASE 2: Copiar english-course → english-learning/course
```bash
# Copiar (não mover ainda)
cp -r front-end/src/modules/english-course/* front-end/src/modules/english-learning/course/

# Mover useTTS.js para shared
mv front-end/src/modules/english-learning/course/hooks/useTTS.js front-end/src/modules/english-learning/shared/hooks/
```

### FASE 3: Copiar video-call → english-learning/conversation
```bash
# Copiar (não mover ainda)
cp -r front-end/src/modules/video-call/* front-end/src/modules/english-learning/conversation/

# Renomear VideoCallDashboard.jsx para Dashboard.jsx
mv front-end/src/modules/english-learning/conversation/pages/VideoCallDashboard.jsx \
   front-end/src/modules/english-learning/conversation/pages/Dashboard.jsx

# Renomear VideoCallRoutes.jsx para ConversationRoutes.jsx
mv front-end/src/modules/english-learning/conversation/VideoCallRoutes.jsx \
   front-end/src/modules/english-learning/conversation/ConversationRoutes.jsx
```

### FASE 4: Atualizar imports nos arquivos copiados

#### 4.1 Arquivos em `english-learning/course/`
Atualizar imports:
- `../../hooks/useTTS` → `../../../shared/hooks/useTTS`
- `../../../services/api` → `../../../../services/api`
- `../context/AuthContext` → `../../../auth-social/context/AuthContext`

#### 4.2 Arquivos em `english-learning/conversation/`
Atualizar imports:
- `../../../services/api` → `../../../../services/api`
- `../context/AuthContext` → `../../../auth-social/context/AuthContext`

### FASE 5: Atualizar AppRoutes.jsx
Atualizar imports para apontar para novos caminhos:
```javascript
// ANTES
import EnglishDashboard from "../modules/english-course/pages/Dashboard";
import VideoCallRoutes from "../modules/video-call/VideoCallRoutes";

// DEPOIS
import EnglishCourseDashboard from "../modules/english-learning/course/pages/Dashboard";
import ConversationRoutes from "../modules/english-learning/conversation/ConversationRoutes";
```

### FASE 6: Atualizar rotas
```javascript
// Atualizar paths
<Route path="/learning/course" element={<EnglishCourseDashboard />} />
<Route path="/learning/conversation/*" element={<ConversationRoutes />} />

// Manter rotas legacy por enquanto (backward compatibility)
<Route path="/english-course" element={<EnglishCourseDashboard />} />
<Route path="/video-call/*" element={<ConversationRoutes />} />
```

### FASE 7: Testar tudo
- [ ] Acessar `/learning` - Dashboard funciona?
- [ ] Acessar `/learning/course` - Aulas funcionam?
- [ ] Acessar `/learning/conversation` - Conversação funciona?
- [ ] Acessar `/english-course` - Legacy route funciona?
- [ ] Acessar `/video-call` - Legacy route funciona?
- [ ] TTS funciona? (useTTS movido para shared)
- [ ] API calls funcionam?
- [ ] Navegação entre páginas funciona?

### FASE 8: Remover pastas antigas (APENAS APÓS CONFIRMAR QUE TUDO FUNCIONA)
```bash
# CUIDADO: Só fazer depois de TESTAR TUDO!
rm -rf front-end/src/modules/english-course/
rm -rf front-end/src/modules/video-call/
```

### FASE 9: Remover rotas legacy (OPCIONAL - depois de alguns meses)
```javascript
// Remover estas rotas eventualmente:
// <Route path="/english-course" ... />
// <Route path="/video-call/*" ... />
```

---

## ⚠️ IMPORTANTE: Arquivos que precisam ser atualizados

### Frontend:

1. **AppRoutes.jsx**
   - Atualizar imports
   - Atualizar rotas

2. **Todos os arquivos em english-learning/course/**
   - Atualizar imports relativos
   - Especialmente: Card.jsx, Practice.jsx, Review.jsx (usam useTTS)

3. **Todos os arquivos em english-learning/conversation/**
   - Atualizar imports relativos

4. **EnglishLearningDashboard.jsx**
   - Já criado, mas verificar rotas

5. **Home.jsx**
   - Já atualizado com rotas corretas

### Backend:
Nenhuma mudança necessária! Backend continua igual.

---

## 📋 Checklist de Imports a Atualizar

### english-learning/course/components/Card.jsx
```diff
- import { useTTS } from '../../hooks/useTTS';
+ import { useTTS } from '../../../shared/hooks/useTTS';
```

### english-learning/course/pages/Practice.jsx
```diff
- import apiService from '../../../services/api';
+ import apiService from '../../../../services/api';

- import { useAuth } from '../../auth-social/context/AuthContext';
+ import { useAuth } from '../../../auth-social/context/AuthContext';

- import { useTTS } from '../../hooks/useTTS';
+ import { useTTS } from '../../../shared/hooks/useTTS';
```

### english-learning/course/pages/Review.jsx
```diff
- import apiService from '../../../services/api';
+ import apiService from '../../../../services/api';

- import { useTTS } from '../../hooks/useTTS';
+ import { useTTS } from '../../../shared/hooks/useTTS';
```

### english-learning/conversation/ConversationRoutes.jsx
```diff
- import Dashboard from './pages/VideoCallDashboard';
+ import Dashboard from './pages/Dashboard';
```

---

## 🎯 Próximos Passos

1. **Executar FASE 1** - Criar pastas
2. **Executar FASE 2** - Copiar english-course
3. **Executar FASE 3** - Copiar video-call
4. **Executar FASE 4** - Atualizar imports
5. **Executar FASE 5-6** - Atualizar rotas
6. **Executar FASE 7** - TESTAR TUDO
7. **Executar FASE 8** - Remover antigas (só após testes)

---

**Status:** 📝 Plano completo
**Pronto para executar:** ✅ Sim
**Risco de quebrar:** ⚠️ Baixo (vamos copiar antes de deletar)
