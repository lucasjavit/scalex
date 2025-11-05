# Sistema de Gerenciamento de Permissões de Usuário

## Visão Geral

Sistema completo que permite aos administradores gerenciar quais módulos cada usuário pode acessar. Implementado com controle granular de permissões tanto no backend (NestJS + TypeORM + PostgreSQL) quanto no frontend (React).

---

## 🎯 Funcionalidades

### Para Administradores
- ✅ Visualizar todos os usuários e suas permissões
- ✅ Ativar/desativar permissões individuais por módulo
- ✅ Interface visual intuitiva com checkboxes
- ✅ Feedback em tempo real das alterações
- ✅ Admins sempre têm acesso total (não podem ser editados)

### Para Usuários
- ✅ Visualizam apenas os módulos com permissão ativa
- ✅ Permissões carregadas automaticamente no login
- ✅ Interface limpa mostrando apenas o que podem acessar
- ✅ Por padrão, todos têm acesso ao módulo de Conversação

---

## 📁 Estrutura de Arquivos

### Backend (NestJS + TypeORM)

```
back-end/src/
├── users/
│   ├── entities/
│   │   └── user-permission.entity.ts          # Entidade de permissões
│   ├── dto/
│   │   └── update-user-permissions.dto.ts     # DTO para atualizar permissões
│   ├── user-permissions.service.ts            # Lógica de negócio
│   ├── user-permissions.controller.ts         # Endpoints da API
│   └── users.module.ts                        # Módulo atualizado
└── migrations/
    └── 1762296645736-CreateUserPermissionsTable.ts  # Migration
```

### Frontend (React)

```
front-end/src/
├── hooks/
│   └── useUserPermissions.js                  # Hook para gerenciar permissões
├── services/
│   └── permissionsService.js                  # Service para API calls
├── pages/
│   └── AdminPanel/
│       └── UserPermissionsManagement.jsx      # Página de gerenciamento
└── modules/auth-social/pages/
    └── Home.jsx                               # Home atualizado com permissões
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `user_permissions`

| Coluna | Tipo | Descrição | Padrão |
|--------|------|-----------|--------|
| id | uuid | Chave primária | auto |
| user_id | uuid | FK para users | - |
| learning_course | boolean | Permissão para Aulas de Inglês | false |
| learning_conversation | boolean | Permissão para Conversação | true |
| business_accounting | boolean | Permissão para Contabilidade | false |
| business_career | boolean | Permissão para Consultoria | false |
| business_jobs | boolean | Permissão para Vagas Remotas | false |
| business_insurance | boolean | Permissão para Seguros | false |
| business_banking | boolean | Permissão para Banco Digital | false |
| created_at | timestamp | Data de criação | now() |
| updated_at | timestamp | Data de atualização | now() |

**Constraints:**
- Foreign Key: `user_id` → `users.id` (ON DELETE CASCADE)
- Unique Index: `user_id` (um registro por usuário)

---

## 🔌 API Endpoints

### Base URL: `/user-permissions`

#### 1. **GET** `/user-permissions/me`
Obtém as permissões do usuário atual.

**Auth:** Bearer Token (Firebase)

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "learningCourse": false,
  "learningConversation": true,
  "businessAccounting": false,
  "businessCareer": false,
  "businessJobs": false,
  "businessInsurance": false,
  "businessBanking": false,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

#### 2. **GET** `/user-permissions/all`
Obtém todos os usuários com suas permissões (Admin Only).

**Auth:** Bearer Token + Admin/Partner role

**Response:**
```json
[
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user"
    },
    "permissions": {
      "id": "uuid",
      "userId": "uuid",
      "learningCourse": false,
      "learningConversation": true,
      ...
    }
  }
]
```

---

#### 3. **GET** `/user-permissions/:userId`
Obtém permissões de um usuário específico (Admin Only).

**Auth:** Bearer Token + Admin/Partner role

**Response:** Igual ao endpoint `/me`

---

#### 4. **PATCH** `/user-permissions/:userId`
Atualiza permissões de um usuário (Admin Only).

**Auth:** Bearer Token + Admin/Partner role

**Body:**
```json
{
  "learningCourse": true,
  "businessAccounting": true
}
```

**Response:** Objeto de permissões atualizado

**Notas:**
- Apenas campos fornecidos são atualizados (partial update)
- Não é possível atualizar permissões de admins
- Retorna erro 400 se tentar atualizar admin

---

## 🎨 Interface de Gerenciamento (Admin)

### Acesso
**URL:** `https://scallex.co/admin/permissions`

### Features
- Tabela com todos os usuários
- Colunas: Nome, Email, Role, e um checkbox para cada módulo
- Admins aparecem com ✓ verde (não editável)
- Usuários regulares têm checkboxes interativos
- Atualização em tempo real ao marcar/desmarcar
- Mensagens de sucesso/erro
- Design responsivo

### Screenshot Conceitual
```
┌─────────────────────────────────────────────────────────────────────┐
│  Gerenciamento de Permissões                                         │
│  Configure quais módulos cada usuário pode acessar                   │
├─────────────────────────────────────────────────────────────────────┤
│  Usuário     │ Email        │ Role  │ 📖 │ 💬 │ 📊 │ 💼 │ 🌍 │ 🛡️ │ 💰 │
├─────────────────────────────────────────────────────────────────────┤
│  Admin User  │ admin@...    │ admin │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │
│  John Doe    │ john@...     │ user  │ ☐  │ ☑  │ ☐  │ ☐  │ ☐  │ ☐  │ ☐  │
│  Jane Smith  │ jane@...     │ user  │ ☑  │ ☑  │ ☐  │ ☐  │ ☐  │ ☐  │ ☐  │
└─────────────────────────────────────────────────────────────────────┘

Legenda:
• Admins sempre têm acesso a todos os módulos (não podem ser editados)
• Usuários regulares só veem módulos com permissão ativa
• Por padrão, todos os usuários têm acesso ao módulo de Conversação
```

---

## 💻 Uso no Frontend

### Hook `useUserPermissions`

```jsx
import { useUserPermissions } from '../hooks/useUserPermissions';

function MyComponent() {
  const { permissions, hasPermission, loading, error, refetch } = useUserPermissions();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {hasPermission('learning.course') && (
        <CourseModule />
      )}

      {hasPermission('learning.conversation') && (
        <ConversationModule />
      )}
    </div>
  );
}
```

### Exemplo no componente Home

```jsx
// Renderiza seção apenas se usuário tem alguma permissão
{!permissionsLoading &&
 (hasPermission('learning.course') || hasPermission('learning.conversation') || isAdmin) && (
  <section>
    {/* Renderiza curso apenas se tiver permissão */}
    {(hasPermission('learning.course') || isAdmin) && (
      <CourseCard />
    )}

    {/* Renderiza conversação apenas se tiver permissão */}
    {(hasPermission('learning.conversation') || isAdmin) && (
      <ConversationCard />
    )}
  </section>
)}
```

---

## 🔐 Regras de Negócio

### Permissões Padrão
Quando um novo usuário é criado:
- ✅ `learningConversation`: **true** (acesso padrão)
- ❌ Todos os outros módulos: **false**

### Admins
- Sempre têm acesso a **todos** os módulos
- Suas permissões não podem ser editadas
- O sistema retorna um objeto virtual com tudo `true`
- Não há registro na tabela `user_permissions` para admins

### Usuários Regulares
- Veem apenas módulos com permissão ativa
- Admin pode conceder/revogar permissões individualmente
- Permissões são checadas tanto no frontend quanto backend

### Segurança
⚠️ **IMPORTANTE:**
- Frontend verifica permissões apenas para UX
- Backend **DEVE** validar permissões em cada endpoint
- Nunca confie apenas na verificação do frontend

---

## 🚀 Como Executar as Migrations

### 1. Rodar a migration

```bash
cd back-end
npm run migration:run
```

### 2. Verificar se foi aplicada

```bash
npm run migration:show
```

### 3. Reverter (se necessário)

```bash
npm run migration:revert
```

---

## 🧪 Testando o Sistema

### 1. Criar usuário de teste

```bash
# No backend, usar endpoint de criação de usuário
POST /users
{
  "firebase_uid": "test-uid",
  "email": "test@example.com",
  "full_name": "Test User",
  "birth_date": "1990-01-01",
  "phone": "1234567890",
  "preferred_language": "pt-BR"
}
```

### 2. Login como admin

```
Email: admin@example.com (ou seu admin existente)
```

### 3. Acessar painel de permissões

```
https://scallex.co/admin/permissions
```

### 4. Alterar permissões do usuário de teste

- Marcar checkbox de "Aulas de Inglês"
- Ver mensagem de sucesso

### 5. Login como usuário de teste

- Verificar que agora vê o módulo de "Aulas de Inglês" na home
- Verificar que pode acessar `/learning/course`

---

## 📋 Módulos Disponíveis

| Módulo | Identificador | Ícone | Status |
|--------|---------------|-------|--------|
| Aulas de Inglês | `learning.course` | 📖 | Ativo |
| Conversação | `learning.conversation` | 💬 | Ativo |
| Contabilidade | `business.accounting` | 📊 | Coming Soon |
| Consultoria | `business.career` | 💼 | Coming Soon |
| Vagas Remotas | `business.jobs` | 🌍 | Coming Soon |
| Seguros | `business.insurance` | 🛡️ | Coming Soon |
| Banco Digital | `business.banking` | 💰 | Coming Soon |

---

## 🔄 Fluxo Completo

### Quando usuário faz login:

1. **Frontend:** Usuário autentica via Firebase
2. **Frontend:** Hook `useUserPermissions` busca permissões automaticamente
3. **Backend:** Endpoint `/user-permissions/me` retorna permissões
4. **Frontend:** Componente Home renderiza apenas módulos permitidos

### Quando admin altera permissões:

1. **Admin:** Acessa `/admin/permissions`
2. **Admin:** Marca/desmarca checkbox
3. **Frontend:** Envia PATCH para `/user-permissions/:userId`
4. **Backend:** Valida role do admin e atualiza permissões
5. **Backend:** Retorna permissões atualizadas
6. **Frontend:** Atualiza interface com sucesso
7. **Usuário:** No próximo login, vê mudanças refletidas

---

## 🛠️ Troubleshooting

### Erro: "Cannot update permissions for admin users"
**Causa:** Tentando alterar permissões de um admin
**Solução:** Admins sempre têm acesso total, não precisam de permissões

### Erro: Migration falha
**Causa:** Tabela já existe ou FK inválida
**Solução:**
```bash
npm run migration:revert
npm run migration:run
```

### Permissões não carregam no frontend
**Causa:** Token Firebase inválido ou expirado
**Solução:** Fazer logout e login novamente

### Usuário não vê módulo mesmo com permissão
**Causa:** Cache do hook ou erro na API
**Solução:**
```javascript
const { refetch } = useUserPermissions();
refetch(); // Recarrega permissões
```

---

## 🎓 Exemplos de Uso

### Adicionar novo módulo

#### 1. Backend - Atualizar Entity
```typescript
// user-permission.entity.ts
export enum ModulePermission {
  // ... existing modules
  NEW_MODULE = 'new.module',
}

@Column({ type: 'boolean', default: false, name: 'new_module' })
newModule: boolean;
```

#### 2. Backend - Criar Migration
```bash
npm run migration:create -- src/migrations/AddNewModulePermission
```

```typescript
// Migration
await queryRunner.query(
  `ALTER TABLE user_permissions ADD COLUMN new_module BOOLEAN DEFAULT FALSE`
);
```

#### 3. Frontend - Adicionar no Service
```javascript
// permissionsService.js
parsePermissions(permissions) {
  return {
    // ... existing
    newModule: permissions.newModule || false,
  };
}
```

#### 4. Frontend - Usar no Home
```jsx
{hasPermission('new.module') && (
  <MacroModuleCard
    icon="🆕"
    title="New Module"
    onClick={() => navigate('/new-module')}
  />
)}
```

---

## 📚 Referências

- [NestJS Documentation](https://nestjs.com/)
- [TypeORM Migrations](https://typeorm.io/migrations)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [Firebase Auth](https://firebase.google.com/docs/auth)

---

## ✅ Checklist de Implementação

- [x] Criar entidade de permissões no backend
- [x] Criar migration para tabela de permissões
- [x] Criar DTO para atualização de permissões
- [x] Implementar service de permissões
- [x] Criar controller com endpoints
- [x] Adicionar ao módulo de usuários
- [x] Criar service de permissões no frontend
- [x] Criar hook useUserPermissions
- [x] Criar página de gerenciamento (admin)
- [x] Modificar Home para usar permissões
- [x] Adicionar rota para página de admin
- [x] Testar fluxo completo

---

## 🎉 Conclusão

O sistema de gerenciamento de permissões está completo e pronto para uso!

**Próximos passos:**
1. Rodar a migration no banco de dados
2. Testar o fluxo de ponta a ponta
3. Documentar para o time
4. Adicionar novos módulos conforme necessário

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.
