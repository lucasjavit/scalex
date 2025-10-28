# 🛠️ PLANO DE DESENVOLVIMENTO TÉCNICO - SCALEX
## Roadmap de Implementação da Plataforma Modular

---

## 🎯 VISÃO GERAL

Este plano detalha as **etapas de desenvolvimento técnico** necessárias para construir a plataforma ScaleX modular, sem entrar em detalhes de código (que serão implementados durante a execução).

### Objetivos Técnicos
1. ✅ Implementar autenticação e autorização com Firebase
2. ✅ Construir infraestrutura modular escalável
3. ✅ Implementar sistema de permissões baseado em módulos
4. ✅ Integrar pagamentos com Stripe
5. ✅ Criar sistema de tracking e comissões para parceiros
6. ✅ Desenvolver todos os 8 módulos planejados

### Stack Tecnológico
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Frontend**: React + Tailwind CSS
- **Autenticação**: Firebase Auth
- **Deploy**: Coolify
- **Pagamentos**: Stripe
- **Email**: SendGrid

---

## 🔧 AMBIENTE DE DESENVOLVIMENTO

### Gerenciamento de Processos

#### Comandos Úteis (Windows)
```bash
# Ver processos Node.js rodando
tasklist | findstr node

# Matar processo específico
taskkill /PID <PID> /F

# Matar todos os processos Node
taskkill /IM node.exe /F

# Verificar porta em uso
netstat -ano | findstr :3000
netstat -ano | findstr :5173
```

#### Limpeza de Ambiente
```bash
# Backend - Clean install
cd back-end
rm -rf node_modules dist
npm install

# Frontend - Clean install
cd front-end
rm -rf node_modules .vite
npm install
```

#### Restart Limpo do Servidor
```bash
# 1. Matar processos Node
taskkill /IM node.exe /F

# 2. Limpar build
cd back-end
rm -rf dist

# 3. Rodar migrations (se houver novas)
npm run migration:run

# 4. Reiniciar servidor
npm run start:dev
```

---

## 📅 FASE 1: AUTENTICAÇÃO E AUTORIZAÇÃO (Semana 1-2)
### **Foco: Firebase Auth + Sistema de Roles**

### Sprint 1.1: Setup Firebase

#### Backend
- [ ] Criar projeto no Firebase Console
- [ ] Obter credenciais (Service Account JSON)
- [ ] Instalar dependências: `firebase-admin`
- [ ] Configurar Firebase Admin SDK no NestJS
- [ ] Adicionar variáveis de ambiente (Firebase config)

#### Frontend
- [ ] Instalar dependências: `firebase`
- [ ] Configurar Firebase Client SDK
- [ ] Criar arquivo de configuração do Firebase
- [ ] Criar contexto de autenticação (AuthContext)

**Entregáveis**:
- ✅ Firebase configurado no backend e frontend
- ✅ Variáveis de ambiente documentadas

---

### Sprint 1.2: Autenticação no Backend

#### Tarefas
- [ ] Criar módulo `auth` no NestJS
- [ ] Implementar estratégia Firebase JWT (Passport)
- [ ] Criar Guard `FirebaseAuthGuard`
- [ ] Criar decorator `@CurrentUser()` para extrair usuário do request
- [ ] Criar middleware para validar token Firebase
- [ ] Sincronizar usuário Firebase com banco PostgreSQL:
  - Ao fazer login, buscar/criar usuário no banco
  - Mapear `firebase_uid` para `user_id`

#### Endpoints
- [ ] POST `/api/auth/login` - Recebe token Firebase, retorna JWT customizado (opcional)
- [ ] GET `/api/auth/me` - Retorna dados do usuário logado
- [ ] POST `/api/auth/logout` - Invalida sessão (opcional)

**Entregáveis**:
- ✅ Usuários Firebase sincronizados com PostgreSQL
- ✅ Proteção de rotas com `FirebaseAuthGuard`

---

### Sprint 1.3: Sistema de Roles e Permissões

#### Database
- [ ] Adicionar coluna `role` na tabela `users`:
  - Valores: `user`, `admin`, `partner`
- [ ] Criar migration para adicionar coluna
- [ ] Seedar usuário admin inicial

#### Backend
- [ ] Criar Guard `RolesGuard`
- [ ] Criar decorator `@Roles('admin', 'user')`
- [ ] Implementar lógica de verificação de roles
- [ ] Proteger rotas administrativas com `@Roles('admin')`

#### Casos de Uso
- `user`: Acesso padrão aos módulos comprados
- `admin`: Acesso total + painel administrativo
- `partner`: Acesso ao dashboard de parceiro

**Entregáveis**:
- ✅ Sistema de roles funcionando
- ✅ Rotas protegidas por role

---

### Sprint 1.4: Autenticação no Frontend

#### Componentes
- [ ] Criar página de Login (`/login`)
- [ ] Criar página de Registro (`/register`)
- [ ] Implementar login com email/senha (Firebase)
- [ ] Implementar login social (Google, opcional)
- [ ] Implementar recuperação de senha
- [ ] Criar componente `ProtectedRoute` para rotas privadas

#### AuthContext
- [ ] Estado global de autenticação
- [ ] Métodos: `login()`, `logout()`, `register()`, `resetPassword()`
- [ ] Persistência de sessão (Firebase persiste automaticamente)
- [ ] Loading states durante autenticação

#### Integração
- [ ] Enviar token Firebase em todas as requisições (header `Authorization`)
- [ ] Tratar erro 401 (redirecionar para login)
- [ ] Tratar erro 403 (sem permissão)

**Entregáveis**:
- ✅ Fluxo completo de login/registro funcionando
- ✅ Rotas protegidas no frontend
- ✅ Redirecionamentos automáticos

---

### Sprint 1.5: Painel de Usuário

#### Páginas
- [ ] Criar página de perfil (`/profile`)
- [ ] Exibir dados do usuário (nome, email, foto)
- [ ] Permitir edição de perfil:
  - Nome completo
  - Foto de perfil (upload para Firebase Storage)
  - Telefone
  - Data de nascimento
- [ ] Integrar com backend (UPDATE no PostgreSQL)

#### Sincronização Firebase ↔ PostgreSQL
- [ ] Atualizar dados no Firebase Auth
- [ ] Atualizar dados no PostgreSQL
- [ ] Manter consistência entre ambos

**Entregáveis**:
- ✅ Usuário pode editar perfil
- ✅ Dados sincronizados entre Firebase e PostgreSQL

---

### ✅ Checklist da Fase 1

- [ ] Firebase configurado (backend + frontend)
- [ ] Usuários autenticados via Firebase Auth
- [ ] Sincronização Firebase ↔ PostgreSQL funcionando
- [ ] Sistema de roles implementado (user, admin, partner)
- [ ] Guards funcionando: `FirebaseAuthGuard`, `RolesGuard`
- [ ] Frontend: Login, Registro, Recuperação de senha
- [ ] Frontend: Rotas protegidas
- [ ] Frontend: Perfil de usuário editável
- [ ] Testes manuais completos (login, logout, permissões)

---

## 📅 FASE 2: INFRAESTRUTURA MODULAR (Semana 3-4)
### **Foco: Sistema de Módulos e Permissões**

### Sprint 2.1: Database Schema

#### Migrations
- [ ] Criar tabela `modules`:
  - Campos: id, code, name, description, icon, price, stripePriceId, isActive, orderIndex, category
- [ ] Criar tabela `user_modules` (relação many-to-many):
  - Campos: id, userId, moduleId, purchasedAt, expiresAt, isActive, paymentId, pricePaid
- [ ] Criar indexes para performance:
  - Index em `modules.code`
  - Index único em `user_modules (userId, moduleId)`

#### Seed
- [ ] Criar seed com 8 módulos iniciais:
  1. Curso de Inglês
  2. Abertura de CNPJ
  3. Remessas Internacionais
  4. Currículo Internacional
  5. Simulação de Entrevistas
  6. Networking/LinkedIn
  7. Marketplace de Vagas
  8. Comunidade Premium
- [ ] Rodar seed no ambiente de desenvolvimento

**Entregáveis**:
- ✅ Tabelas criadas no banco
- ✅ 8 módulos seedados

---

### Sprint 2.2: Backend - Módulos

#### Entities TypeORM
- [ ] Criar entity `Module`
- [ ] Criar entity `UserModule`
- [ ] Criar relações:
  - User ↔ UserModule (One-to-Many)
  - Module ↔ UserModule (One-to-Many)

#### Service (ModulesService)
- [ ] `findAll()` - Listar todos os módulos
- [ ] `findAllWithAccess(userId)` - Listar módulos com flag `hasAccess`
- [ ] `findOne(id)` - Buscar módulo por ID
- [ ] `findByCode(code)` - Buscar módulo por código
- [ ] `hasAccess(userId, moduleCode)` - Verificar se usuário tem acesso
- [ ] `getUserModules(userId)` - Listar módulos do usuário
- [ ] `grantAccess(userId, moduleId, paymentId, price)` - Conceder acesso
- [ ] `revokeAccess(userId, moduleId)` - Revogar acesso (admin)

#### Controller (ModulesController)
- [ ] GET `/api/modules` - Lista todos (público)
- [ ] GET `/api/modules/my` - Lista com acesso do usuário (autenticado)
- [ ] GET `/api/modules/my-access` - Módulos que o usuário possui
- [ ] GET `/api/modules/:id` - Detalhes de um módulo
- [ ] POST `/api/modules` - Criar módulo (admin)
- [ ] PATCH `/api/modules/:id` - Atualizar módulo (admin)
- [ ] DELETE `/api/modules/:id` - Deletar módulo (admin)
- [ ] POST `/api/modules/:moduleId/grant-access/:userId` - Conceder acesso (admin)
- [ ] POST `/api/modules/:moduleId/revoke-access/:userId` - Revogar acesso (admin)

**Entregáveis**:
- ✅ CRUD completo de módulos
- ✅ API de verificação de acesso

---

### Sprint 2.3: Middleware de Permissões

#### Implementação
- [ ] Criar Guard `CheckModuleAccessGuard`
  - Verifica se usuário tem acesso ao módulo requerido
  - Retorna 403 se não tiver
- [ ] Criar decorator `@RequireModule('module-code')`
  - Marca rotas que requerem módulo específico
- [ ] Aplicar proteção nas rotas do Curso de Inglês:
  - Todas as rotas de `/api/english-course/*` requerem módulo `english-course`

#### Testes
- [ ] Testar: usuário SEM módulo → 403 Forbidden
- [ ] Testar: usuário COM módulo → 200 OK
- [ ] Testar: admin sempre tem acesso (bypass)

**Entregáveis**:
- ✅ Rotas protegidas por módulo
- ✅ Sistema de permissões funcionando

---

### Sprint 2.4: Frontend - Marketplace

#### Página de Módulos (`/modules`)
- [ ] Criar componente `Marketplace`
- [ ] Listar todos os módulos disponíveis (grid de cards)
- [ ] Exibir para cada módulo:
  - Ícone, nome, descrição, preço
  - Badge de categoria (education, legal, finance, etc.)
  - Botão "Comprar" se não tiver acesso
  - Botão "Acessar" se já tiver acesso
  - Botão "Em breve" se módulo não estiver ativo
- [ ] Filtros (opcional):
  - Por categoria
  - Por preço

#### Context de Módulos
- [ ] Criar `ModulesContext`
- [ ] Carregar módulos do usuário ao fazer login
- [ ] Hook `useModules()` - retorna módulos do usuário
- [ ] Hook `useHasModule(code)` - verifica acesso a módulo específico

#### Componente de Proteção
- [ ] Criar `<ModuleGate module="code">...</ModuleGate>`
  - Mostra conteúdo se usuário tiver acesso
  - Mostra CTA de upgrade se não tiver
- [ ] Usar em rotas de módulos pagos

**Entregáveis**:
- ✅ Marketplace visualmente atraente
- ✅ Controle de acesso no frontend

---

### ✅ Checklist da Fase 2

- [ ] Tabelas de módulos criadas
- [ ] 8 módulos seedados no banco
- [ ] Backend: CRUD de módulos funcionando
- [ ] Backend: Sistema de verificação de acesso
- [ ] Guard `CheckModuleAccessGuard` implementado
- [ ] Rotas do curso protegidas por módulo
- [ ] Frontend: Marketplace de módulos
- [ ] Frontend: Context de módulos
- [ ] Frontend: Componente de proteção
- [ ] Testes completos (acesso permitido/negado)

---

## 📅 FASE 3: SISTEMA DE PAGAMENTOS (Semana 5-6)
### **Foco: Integração Stripe**

### Sprint 3.1: Setup Stripe

#### Configuração
- [ ] Criar conta Stripe (modo test)
- [ ] Obter API keys (Publishable + Secret)
- [ ] Instalar dependências:
  - Backend: `stripe`
  - Frontend: `@stripe/stripe-js`
- [ ] Adicionar variáveis de ambiente

#### Produtos no Stripe
- [ ] Criar produto para cada módulo no Stripe Dashboard
- [ ] Copiar `price_id` de cada produto
- [ ] Atualizar campo `stripePriceId` na tabela `modules`
- [ ] **OU** criar script para sincronizar automaticamente (criar produtos via API)

**Entregáveis**:
- ✅ Stripe configurado
- ✅ Produtos criados e linkados aos módulos

---

### Sprint 3.2: Backend - Payments

#### Service (PaymentsService)
- [ ] `createCheckoutSession(userId, moduleId)`:
  - Cria sessão de checkout do Stripe
  - Retorna `sessionId` e `url` para redirecionamento
- [ ] `handleWebhook(signature, payload)`:
  - Valida webhook do Stripe
  - Processa evento `checkout.session.completed`
- [ ] `handleCheckoutCompleted(session)`:
  - Concede acesso ao módulo via `ModulesService.grantAccess()`
- [ ] `getCheckoutSession(sessionId)`:
  - Retorna detalhes de uma sessão

#### Controller (PaymentsController)
- [ ] POST `/api/payments/checkout` - Criar sessão (autenticado)
- [ ] POST `/api/payments/webhook` - Receber webhooks Stripe (público, sem auth)
- [ ] GET `/api/payments/session/:sessionId` - Verificar sessão (autenticado)

#### Configuração Especial
- [ ] Configurar raw body para rota de webhook (necessário para validação Stripe)
- [ ] Testar webhook localmente com Stripe CLI

**Entregáveis**:
- ✅ Checkout funcionando
- ✅ Webhook processando pagamentos

---

### Sprint 3.3: Frontend - Checkout Flow

#### Marketplace
- [ ] Botão "Comprar" chama API `/api/payments/checkout`
- [ ] Redireciona para Stripe Checkout (URL do Stripe)

#### Páginas de Retorno
- [ ] Criar página `/payment/success`:
  - Exibir mensagem de sucesso
  - Buscar detalhes da sessão via API
  - Botão para ir aos módulos ou acessar módulo comprado
- [ ] Criar página `/payment/cancel`:
  - Exibir mensagem de cancelamento
  - Botão para voltar ao marketplace

#### Configuração Stripe
- [ ] Configurar URLs de sucesso/cancelamento no Stripe Checkout:
  - Success: `http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}`
  - Cancel: `http://localhost:5173/payment/cancel`

**Entregáveis**:
- ✅ Fluxo completo de compra funcionando
- ✅ Páginas de retorno criadas

---

### Sprint 3.4: Testes de Pagamento

#### Testes Manuais
- [ ] Teste 1: Comprar módulo com sucesso
  - Card de teste: `4242 4242 4242 4242`
  - Verificar acesso concedido
  - Verificar registro em `user_modules`
- [ ] Teste 2: Cancelar pagamento
  - Fechar popup do Stripe
  - Verificar redirecionamento para `/payment/cancel`
- [ ] Teste 3: Webhook
  - Usar Stripe CLI para testar webhook local
  - Verificar log de processamento

#### Validações
- [ ] Usuário não pode comprar módulo que já possui
- [ ] Após compra, botão muda de "Comprar" para "Acessar"
- [ ] Acesso ao módulo liberado imediatamente após pagamento

**Entregáveis**:
- ✅ Testes completos documentados
- ✅ Bugs corrigidos

---

### ✅ Checklist da Fase 3

- [ ] Stripe configurado (test mode)
- [ ] Produtos criados e linkados
- [ ] Backend: PaymentsService implementado
- [ ] Backend: Webhook funcionando
- [ ] Frontend: Botão de compra funcionando
- [ ] Frontend: Páginas de sucesso/cancelamento
- [ ] Fluxo completo testado (compra → webhook → acesso)
- [ ] Testes com Stripe CLI realizados

---

## 📅 FASE 4: SISTEMA DE PARCERIAS (Semana 7-8)
### **Foco: Tracking de Referrals e Comissões**

### Sprint 4.1: Database Schema - Partners

#### Migrations
- [ ] Criar tabela `partners`:
  - Campos: id, userId (opcional), name, email, type, commissionPercentage, utmSource, isActive, phone, contractSignedAt
  - Types: `professor`, `accountant`, `influencer`, `other`
- [ ] Criar tabela `partner_referrals`:
  - Campos: id, partnerId, userId, utmSource, utmMedium, utmCampaign
  - Relação: Partner → User (quem referiu quem)
- [ ] Criar tabela `partner_commissions`:
  - Campos: id, partnerId, userModuleId, amount, percentage, status, paymentId, paidAt, notes
  - Status: `pending`, `approved`, `paid`, `cancelled`

#### Seed de Parceiros Iniciais
- [ ] Professor de Inglês (60% comissão, UTM: `prof-joao`)
- [ ] Contador 1 (15% comissão, UTM: `contador-maria`)
- [ ] Contador 2 (15% comissão, UTM: `contador-pedro`)
- [ ] Influencer (20% comissão, UTM: `influencer-linkedin`)

**Entregáveis**:
- ✅ Tabelas de parcerias criadas
- ✅ Parceiros iniciais seedados

---

### Sprint 4.2: Backend - Tracking de Referrals

#### Modificar AuthService
- [ ] Ao criar novo usuário (signup), verificar UTM parameters:
  - Se `utm_source` presente → identificar parceiro
  - Criar registro em `partner_referrals`
- [ ] Armazenar UTM params temporariamente (session/cookie) antes do signup

#### Endpoint de Signup Modificado
- [ ] POST `/api/auth/register` aceita `utmSource`, `utmMedium`, `utmCampaign` no body
- [ ] Frontend envia UTM params capturados da URL

**Entregáveis**:
- ✅ Referrals sendo tracked no signup

---

### Sprint 4.3: Backend - Cálculo de Comissões

#### Modificar PaymentsService
- [ ] Ao processar webhook `checkout.session.completed`:
  1. Conceder acesso ao módulo
  2. Verificar se usuário tem referral de parceiro
  3. Se sim, calcular comissão:
     - `amount = pricePaid * (partner.commissionPercentage / 100)`
  4. Criar registro em `partner_commissions` (status: `pending`)

#### PartnersService
- [ ] `calculateCommission(userModuleId)` - Calcular e criar comissão
- [ ] `approveCommission(commissionId)` - Aprovar comissão (admin)
- [ ] `markAsPaid(commissionId, paymentId)` - Marcar como paga (admin)
- [ ] `getPartnerDashboard(partnerId)` - Estatísticas do parceiro:
  - Total de referrals
  - Total de conversões (compras)
  - Total de comissões (pending, approved, paid)
  - Histórico de comissões

**Entregáveis**:
- ✅ Comissões calculadas automaticamente
- ✅ API de dashboard de parceiro

---

### Sprint 4.4: Frontend - UTM Tracking

#### Landing Page
- [ ] Capturar UTM parameters da URL ao carregar página
- [ ] Salvar em `localStorage` com expiração de 30 dias
- [ ] Enviar para backend no signup

#### Implementação
```javascript
// Exemplo de captura:
// URL: https://scalex.com?utm_source=prof-joao&utm_campaign=black-friday

const params = new URLSearchParams(window.location.search);
const utmSource = params.get('utm_source');
const utmMedium = params.get('utm_medium');
const utmCampaign = params.get('utm_campaign');

// Salvar no localStorage
localStorage.setItem('utm_data', JSON.stringify({ utmSource, utmMedium, utmCampaign }));

// No signup:
const utmData = JSON.parse(localStorage.getItem('utm_data') || '{}');
// Enviar junto com dados de cadastro
```

**Entregáveis**:
- ✅ UTM tracking funcionando

---

### Sprint 4.5: Dashboard de Parceiro

#### Backend
- [ ] GET `/api/partners/dashboard` (autenticado, role: `partner`)
  - Retorna estatísticas do parceiro logado
- [ ] GET `/api/partners/commissions` (autenticado, role: `partner`)
  - Retorna histórico de comissões

#### Frontend
- [ ] Criar página `/partners/dashboard`
- [ ] Exibir KPIs:
  - Total de referrals
  - Total de conversões
  - Comissões pendentes (R$)
  - Comissões pagas (R$)
  - Total acumulado (R$)
- [ ] Gráfico de vendas por mês (opcional)
- [ ] Tabela de comissões:
  - Data, Usuário, Módulo, Valor, Status
- [ ] Link de afiliado para compartilhar:
  - `https://scalex.com?utm_source=prof-joao`

**Entregáveis**:
- ✅ Dashboard visual e funcional

---

### Sprint 4.6: Admin - Gerenciar Comissões

#### Backend
- [ ] GET `/api/admin/commissions` - Listar todas as comissões (filtros: status, partnerId)
- [ ] PATCH `/api/admin/commissions/:id/approve` - Aprovar comissão
- [ ] PATCH `/api/admin/commissions/:id/pay` - Marcar como paga
- [ ] PATCH `/api/admin/commissions/:id/cancel` - Cancelar comissão

#### Frontend (Admin)
- [ ] Criar página `/admin/commissions`
- [ ] Tabela de comissões:
  - Filtros: Status, Parceiro, Data
  - Ações: Aprovar, Marcar como paga, Cancelar
- [ ] Botão de exportação (CSV) para relatório mensal

**Entregáveis**:
- ✅ Admin pode gerenciar comissões

---

### ✅ Checklist da Fase 4

- [ ] Tabelas de parcerias criadas
- [ ] Parceiros seedados
- [ ] UTM tracking implementado (frontend + backend)
- [ ] Referrals sendo registrados
- [ ] Comissões calculadas automaticamente
- [ ] Dashboard de parceiro funcional
- [ ] Admin pode gerenciar comissões
- [ ] Testes completos (fluxo de referral → compra → comissão)

---

## 📅 FASE 5: MÓDULO CNPJ (Semana 9-11)
### **Foco: Serviço de Abertura de CNPJ com Contadores**

### Sprint 5.1: Database Schema - CNPJ

#### Migrations
- [ ] Criar tabela `cnpj_requests`:
  - Campos: id, userId, status, requestData (JSON), assignedAccountantId, createdAt, updatedAt
  - Status: `pending`, `in_progress`, `documents_needed`, `approved`, `completed`, `cancelled`
- [ ] Criar tabela `accountants`:
  - Campos: id, partnerId, name, email, phone, capacity (max requests simultâneas), rating

#### Relações
- [ ] User → CnpjRequest (One-to-Many)
- [ ] Accountant → CnpjRequest (One-to-Many)
- [ ] Partner → Accountant (One-to-One)

**Entregáveis**:
- ✅ Tabelas criadas
- ✅ Contadores seedados (2 parceiros)

---

### Sprint 5.2: Backend - CNPJ Service

#### CnpjService
- [ ] `createRequest(userId, data)` - Criar solicitação de CNPJ
  - Validar que usuário tem módulo `cnpj-service`
  - Atribuir contador (round-robin baseado em capacidade)
  - Enviar email ao contador
- [ ] `getRequest(id, userId)` - Buscar detalhes da solicitação
- [ ] `getUserRequests(userId)` - Listar solicitações do usuário
- [ ] `updateStatus(id, status, accountantId)` - Atualizar status (contador)
- [ ] `assignAccountant(requestId, accountantId)` - Atribuir contador (manual, admin)

#### Controller
- [ ] POST `/api/cnpj/request` - Criar solicitação (autenticado, requer módulo)
- [ ] GET `/api/cnpj/requests/:id` - Detalhes da solicitação
- [ ] GET `/api/cnpj/my-requests` - Minhas solicitações
- [ ] PATCH `/api/cnpj/requests/:id/status` - Atualizar status (contador ou admin)

**Entregáveis**:
- ✅ API de CNPJ funcionando

---

### Sprint 5.3: Frontend - Formulário de Solicitação

#### Página `/services/cnpj/request`
- [ ] Verificar se usuário tem módulo `cnpj-service` (senão, redirecionar para marketplace)
- [ ] Formulário com campos:
  - **Dados Pessoais**: Nome completo, CPF, RG, Data de nascimento
  - **Endereço**: CEP, Rua, Número, Complemento, Cidade, Estado
  - **Tipo de Empresa**: MEI, ME, LTDA (radio buttons)
  - **Atividade Principal**: Campo de texto ou seleção de CNAEs
  - **Upload de Documentos**: RG (frente/verso), CPF, Comprovante de residência
- [ ] Validações:
  - CPF válido
  - CEP válido (buscar endereço via API ViaCEP)
  - Documentos obrigatórios
- [ ] Enviar para API ao submeter

**Entregáveis**:
- ✅ Formulário funcional e validado

---

### Sprint 5.4: Frontend - Dashboard de Acompanhamento

#### Página `/services/cnpj/my-requests`
- [ ] Listar todas as solicitações do usuário
- [ ] Para cada solicitação, exibir:
  - Status (badge colorido)
  - Data de criação
  - Tipo de empresa
  - Contador atribuído (nome, email)
  - Botão "Ver detalhes"

#### Página de Detalhes `/services/cnpj/requests/:id`
- [ ] Linha do tempo de status:
  - Pendente → Em progresso → Documentos necessários → Aprovado → Concluído
- [ ] Dados da solicitação
- [ ] Chat com contador (opcional, pode ser email inicialmente)
- [ ] Download de documentos (quando concluído)

**Entregáveis**:
- ✅ Usuário pode acompanhar solicitações

---

### Sprint 5.5: Dashboard do Contador

#### Backend
- [ ] GET `/api/accountant/requests` - Listar solicitações atribuídas ao contador logado
- [ ] PATCH `/api/accountant/requests/:id/status` - Atualizar status
- [ ] POST `/api/accountant/requests/:id/message` - Enviar mensagem ao cliente (opcional)

#### Frontend `/accountant/dashboard`
- [ ] Tabela de solicitações:
  - Filtros: Status
  - Colunas: Cliente, Tipo, Data, Status, Ações
- [ ] Ações:
  - Ver detalhes
  - Atualizar status
  - Solicitar documentos
  - Marcar como concluído

**Entregáveis**:
- ✅ Contadores podem gerenciar solicitações

---

### Sprint 5.6: Comissionamento do CNPJ

#### Lógica
- [ ] Ao marcar solicitação como `completed`:
  - Verificar se há referral do contador
  - Calcular comissão: 15% do valor pago pelo módulo
  - Criar registro em `partner_commissions`

#### Observação
- Como o módulo CNPJ é comprado antes da solicitação, a comissão é gerada:
  - Opção 1: No momento da compra do módulo (se houver referral)
  - Opção 2: No momento da conclusão da solicitação (se contador for parceiro)
- Definir estratégia baseado no modelo de negócio

**Entregáveis**:
- ✅ Comissões sendo geradas

---

### ✅ Checklist da Fase 5

- [ ] Tabelas de CNPJ criadas
- [ ] Backend: API de solicitações
- [ ] Frontend: Formulário de solicitação
- [ ] Frontend: Dashboard de acompanhamento
- [ ] Dashboard do contador funcionando
- [ ] Comissionamento implementado
- [ ] Emails automáticos (contador notificado, cliente notificado)
- [ ] Testes completos (fluxo de solicitação → atribuição → conclusão)

---

## 📅 FASE 6: MÓDULO REMESSAS (Semana 12-13)
### **Foco: Simulador e Guia de Remessas Internacionais**

### Sprint 6.1: Backend - Remittances

#### Database
- [ ] Criar tabela `remittance_simulations`:
  - Campos: id, userId, amount, fromCurrency, toCurrency, provider, exchangeRate, fees, totalReceived, createdAt
- [ ] (Opcional) Criar tabela `exchange_rates` para cache de taxas

#### Service
- [ ] Integrar com API de câmbio (ex: Wise API, CurrencyAPI, ou ExchangeRate-API)
- [ ] `simulate(amount, fromCurrency, toCurrency)`:
  - Buscar taxa de câmbio atual
  - Calcular IOF (0,38% para remessas)
  - Simular com múltiplos provedores (Wise, RemessaOnline, Western Union)
  - Retornar comparativo
- [ ] `saveSimulation(userId, data)` - Salvar simulação no histórico

#### Controller
- [ ] POST `/api/remittances/simulate` - Simular remessa (autenticado, requer módulo)
- [ ] GET `/api/remittances/my-simulations` - Histórico de simulações

**Entregáveis**:
- ✅ API de simulação funcionando

---

### Sprint 6.2: Frontend - Simulador

#### Página `/finance/remittances/simulator`
- [ ] Verificar acesso ao módulo `remittances`
- [ ] Formulário:
  - Valor a enviar (R$)
  - Moeda de destino (USD, EUR, CAD, etc.)
  - Botão "Simular"
- [ ] Exibir resultado em tabela:
  - Provedor | Taxa de câmbio | Taxas | IOF | Valor recebido | Link afiliado
- [ ] Ordenar por melhor valor recebido
- [ ] Links de afiliado para cada provedor (Wise, RemessaOnline)

#### Tutorial
- [ ] Criar página `/finance/remittances/tutorial`
- [ ] Passo a passo com screenshots:
  1. Como abrir conta em cada provedor
  2. Como fazer primeira remessa
  3. Documentos necessários
  4. Prazo de transferência
- [ ] Vídeo explicativo (5-7 min)

**Entregáveis**:
- ✅ Simulador funcional e visualmente claro
- ✅ Tutorial completo

---

### Sprint 6.3: Modelo de Negócio - Afiliados

#### Integração
- [ ] Registrar como afiliado em:
  - Wise (10-15% de comissão)
  - RemessaOnline (comissão por transação)
  - Western Union (se disponível)
- [ ] Obter links de afiliado personalizados
- [ ] Configurar tracking de conversões

#### Backend
- [ ] Salvar cliques em links de afiliado (opcional, para analytics)
- [ ] Tabela `affiliate_clicks`: id, userId, provider, clickedAt

**Entregáveis**:
- ✅ Links de afiliado integrados

---

### ✅ Checklist da Fase 6

- [ ] API de simulação funcionando
- [ ] Integração com API de câmbio
- [ ] Frontend: Simulador visual
- [ ] Frontend: Tutorial completo
- [ ] Links de afiliado configurados
- [ ] Testes completos (simulação de diferentes valores e moedas)

---

## 📅 FASE 7: ADMIN DASHBOARD (Semana 14-15)
### **Foco: Painel Administrativo Completo**

### Sprint 7.1: Overview Dashboard

#### Página `/admin/dashboard`
- [ ] KPIs principais (cards):
  - Total de usuários
  - Usuários ativos (últimos 30 dias)
  - Receita total
  - MRR (Monthly Recurring Revenue)
  - Módulos mais vendidos
- [ ] Gráficos:
  - Novos usuários por mês (line chart)
  - Receita por mês (bar chart)
  - Distribuição de módulos vendidos (pie chart)

#### Backend
- [ ] GET `/api/admin/stats/overview` - Estatísticas gerais
- [ ] GET `/api/admin/stats/revenue` - Dados de receita
- [ ] GET `/api/admin/stats/modules` - Estatísticas por módulo

**Entregáveis**:
- ✅ Dashboard com métricas em tempo real

---

### Sprint 7.2: Gerenciamento de Usuários

#### Página `/admin/users`
- [ ] Tabela de usuários:
  - Colunas: ID, Nome, Email, Role, Data de cadastro, Módulos, Ações
  - Filtros: Role, Data de cadastro, Tem módulos
  - Busca: Por nome ou email
  - Paginação (50 por página)
- [ ] Ações:
  - Ver detalhes
  - Editar role
  - Conceder acesso a módulo (trial)
  - Revogar acesso
  - Desativar/Ativar usuário

#### Backend
- [ ] GET `/api/admin/users` - Listar com filtros e paginação
- [ ] GET `/api/admin/users/:id` - Detalhes do usuário
- [ ] PATCH `/api/admin/users/:id/role` - Atualizar role
- [ ] POST `/api/admin/users/:id/grant-module/:moduleId` - Conceder módulo
- [ ] DELETE `/api/admin/users/:id/revoke-module/:moduleId` - Revogar módulo

**Entregáveis**:
- ✅ CRUD de usuários completo

---

### Sprint 7.3: Gerenciamento de Módulos

#### Página `/admin/modules`
- [ ] Tabela de módulos:
  - Colunas: Nome, Código, Preço, Ativo, Vendas, Receita, Ações
  - Ações: Editar, Ativar/Desativar
- [ ] Modal de edição:
  - Alterar nome, descrição, preço, categoria
  - Alterar status (ativo/inativo)
- [ ] Botão "Criar novo módulo"

#### Estatísticas por Módulo
- [ ] Para cada módulo, exibir:
  - Total de vendas
  - Receita gerada
  - Usuários ativos
  - Taxa de conversão (visitantes → compradores)

**Entregáveis**:
- ✅ Gerenciamento completo de módulos

---

### Sprint 7.4: Gerenciamento de Transações

#### Página `/admin/transactions`
- [ ] Tabela de transações:
  - Colunas: ID, Data, Usuário, Módulo, Valor, Status, Ações
  - Filtros: Status, Data, Módulo
  - Busca: Por ID de transação ou usuário
- [ ] Integração com Stripe:
  - Buscar transações via Stripe API
  - Sincronizar com banco local
- [ ] Ações:
  - Ver detalhes no Stripe
  - Emitir reembolso (se necessário)

**Entregáveis**:
- ✅ Histórico de transações completo

---

### Sprint 7.5: Gerenciamento de Parceiros

#### Página `/admin/partners`
- [ ] Tabela de parceiros:
  - Colunas: Nome, Tipo, UTM Source, Comissão %, Referrals, Conversões, Total pago, Ações
- [ ] Ações:
  - Ver dashboard do parceiro
  - Editar comissão %
  - Ativar/Desativar
- [ ] Página de detalhes do parceiro:
  - Estatísticas detalhadas
  - Histórico de comissões
  - Gráfico de performance

**Entregáveis**:
- ✅ Gestão completa de parceiros

---

### Sprint 7.6: Gerenciamento de Comissões

#### Página `/admin/commissions`
- [ ] Filtros: Status, Parceiro, Data
- [ ] Ações em massa:
  - Aprovar múltiplas comissões
  - Marcar como pagas
- [ ] Exportar relatório (CSV/PDF)
- [ ] Integração com sistema de pagamento (Stripe Payouts ou manual)

**Entregáveis**:
- ✅ Gestão de comissões eficiente

---

### ✅ Checklist da Fase 7

- [ ] Dashboard com KPIs e gráficos
- [ ] Gerenciamento de usuários completo
- [ ] Gerenciamento de módulos completo
- [ ] Histórico de transações
- [ ] Gestão de parceiros
- [ ] Gestão de comissões
- [ ] Exportação de relatórios
- [ ] Testes completos de todas as funcionalidades admin

---

## 📅 FASE 8: ANALYTICS E MÉTRICAS (Semana 16)
### **Foco: Tracking e Otimização**

### Sprint 8.1: Google Analytics 4

#### Setup
- [ ] Criar propriedade no Google Analytics 4
- [ ] Instalar gtag.js no frontend
- [ ] Configurar eventos customizados:
  - `page_view` (automático)
  - `sign_up` (cadastro)
  - `login`
  - `module_viewed` (visualizou detalhes do módulo)
  - `module_purchased` (comprou módulo)
  - `video_completed` (completou vídeo do curso)
  - `flashcard_reviewed` (revisou flashcard)

#### Goals e Conversões
- [ ] Configurar conversões:
  - Signup
  - Compra de módulo (principal)
  - Completou onboarding
- [ ] Configurar funil de conversão:
  - Homepage → Marketplace → Módulo → Checkout → Sucesso

**Entregáveis**:
- ✅ GA4 configurado e rastreando

---

### Sprint 8.2: Mixpanel ou Amplitude (Opcional)

#### Setup
- [ ] Criar conta Mixpanel/Amplitude
- [ ] Instalar SDK no frontend
- [ ] Rastrear eventos de produto:
  - User journey
  - Feature usage
  - Retention cohorts

#### Análises
- [ ] Criar dashboards:
  - Retention por cohort de signup
  - Funnel de ativação (signup → primeira compra)
  - Feature adoption (% de usuários usando cada módulo)

**Entregáveis**:
- ✅ Analytics avançado configurado

---

### Sprint 8.3: Logs e Monitoramento

#### Backend
- [ ] Configurar Winston para logs estruturados
- [ ] Integrar Sentry para error tracking
- [ ] Criar logs de auditoria:
  - Compras
  - Acessos a módulos
  - Mudanças de status (CNPJ, comissões)

#### Alertas
- [ ] Configurar alertas:
  - Erro crítico no servidor → email ao admin
  - Pagamento falhado → log + notificação
  - Taxa de erro >5% → alerta

**Entregáveis**:
- ✅ Logs e monitoramento funcionando

---

### ✅ Checklist da Fase 8

- [ ] Google Analytics 4 configurado
- [ ] Eventos customizados rastreados
- [ ] Funis de conversão configurados
- [ ] (Opcional) Mixpanel/Amplitude configurado
- [ ] Logs estruturados implementados
- [ ] Sentry configurado
- [ ] Alertas automáticos funcionando

---

## 📅 FASE 9: EMAIL MARKETING (Semana 17)
### **Foco: Automação de Emails**

### Sprint 9.1: Setup SendGrid

#### Configuração
- [ ] Criar conta SendGrid
- [ ] Verificar domínio (DNS)
- [ ] Obter API key
- [ ] Instalar dependência: `@sendgrid/mail`

#### Templates
- [ ] Criar templates no SendGrid:
  - Boas-vindas (após cadastro)
  - Confirmação de compra
  - Notificação de comissão (parceiros)
  - Lembrete de estudo (curso de inglês)
  - Status de CNPJ atualizado
  - Newsletter semanal

**Entregáveis**:
- ✅ SendGrid configurado e templates criados

---

### Sprint 9.2: EmailService

#### Backend
- [ ] Criar `EmailService` no NestJS
- [ ] Métodos:
  - `sendWelcomeEmail(user)`
  - `sendPurchaseConfirmation(user, module)`
  - `sendCommissionNotification(partner, commission)`
  - `sendStudyReminder(user)`
  - `sendCnpjStatusUpdate(user, request)`

#### Triggers
- [ ] Integrar envios automáticos:
  - Após signup → Boas-vindas
  - Após compra → Confirmação
  - Após criar comissão → Notificar parceiro
  - Diariamente às 9h → Lembrete de estudo (usuários inativos há 3+ dias)

**Entregáveis**:
- ✅ Emails automáticos funcionando

---

### Sprint 9.3: Drip Campaign (Nutrição)

#### Sequência de Onboarding (Novos Usuários)
- [ ] Dia 0 (cadastro): Boas-vindas + guia de primeiros passos
- [ ] Dia 1: "Conheça nossos módulos"
- [ ] Dia 3: Caso de sucesso (depoimento)
- [ ] Dia 7: "Está com dúvidas? Fale conosco"
- [ ] Dia 14: Feedback survey + incentivo (10% off próximo módulo)

#### Re-engajamento (Usuários Inativos)
- [ ] 7 dias sem acesso: "Sentimos sua falta"
- [ ] 14 dias sem acesso: "Veja o que você está perdendo"
- [ ] 30 dias sem acesso: "Última chance - 20% OFF"

**Entregáveis**:
- ✅ Sequências de email configuradas

---

### ✅ Checklist da Fase 9

- [ ] SendGrid configurado
- [ ] Templates de email criados
- [ ] EmailService implementado
- [ ] Emails automáticos funcionando
- [ ] Drip campaigns configuradas
- [ ] Testes de envio realizados

---

## 📅 FASE 10: PERFORMANCE E OTIMIZAÇÃO (Semana 18)
### **Foco: Escala e Performance**

### Sprint 10.1: Backend Performance

#### Otimizações
- [ ] Adicionar indexes no banco:
  - `user_modules (userId, isActive)`
  - `partner_commissions (partnerId, status)`
  - `cnpj_requests (userId, status)`
- [ ] Implementar paginação em todas as listagens
- [ ] Adicionar cache (Redis) para:
  - Lista de módulos
  - Taxas de câmbio (remessas)
  - Estatísticas do dashboard (cache de 5 min)

#### Query Optimization
- [ ] Analisar queries lentas com `EXPLAIN ANALYZE`
- [ ] Otimizar joins complexos
- [ ] Eager loading de relações TypeORM (evitar N+1)

**Entregáveis**:
- ✅ Performance melhorada (queries <100ms)

---

### Sprint 10.2: Frontend Performance

#### Otimizações
- [ ] Lazy loading de rotas (React.lazy)
- [ ] Code splitting por módulo
- [ ] Compressão de imagens (WebP)
- [ ] Lazy loading de imagens (`loading="lazy"`)
- [ ] Minificação de JS/CSS (Vite já faz)

#### Lighthouse Score
- [ ] Auditar com Lighthouse
- [ ] Meta: Performance >90, Accessibility >90

**Entregáveis**:
- ✅ Frontend otimizado

---

### Sprint 10.3: CDN e Assets

#### Configuração
- [ ] Configurar CDN (Cloudflare ou AWS CloudFront)
- [ ] Migrar vídeos do curso para CDN
- [ ] Migrar imagens estáticas para CDN
- [ ] Configurar cache headers (1 ano para assets estáticos)

**Entregáveis**:
- ✅ Assets servidos via CDN

---

### ✅ Checklist da Fase 10

- [ ] Indexes criados no banco
- [ ] Cache implementado (Redis)
- [ ] Queries otimizadas
- [ ] Frontend com lazy loading
- [ ] Lighthouse score >90
- [ ] CDN configurado para vídeos e imagens

---

## 📅 FASE 11: TESTES E QA (Semana 19-20)
### **Foco: Qualidade e Estabilidade**

### Sprint 11.1: Testes Automatizados

#### Backend (Jest)
- [ ] Aumentar cobertura de testes unitários (meta: >70%)
- [ ] Testes de integração:
  - Fluxo de compra completo
  - Sistema de comissões
  - Permissões e acesso a módulos
- [ ] Testes de API (Supertest):
  - Todos os endpoints principais
  - Casos de sucesso e erro

#### Frontend (Vitest + React Testing Library)
- [ ] Testes de componentes:
  - Login/Registro
  - Marketplace
  - Checkout flow
- [ ] Testes de integração:
  - Fluxo de compra (mock)
  - Navegação protegida

**Entregáveis**:
- ✅ Cobertura de testes >70%

---

### Sprint 11.2: Testes E2E (Cypress/Playwright)

#### Cenários Críticos
- [ ] Signup → Login → Comprar módulo → Acessar módulo
- [ ] Admin: Conceder acesso → Usuário acessa
- [ ] Parceiro: Ver dashboard de comissões
- [ ] CNPJ: Solicitar → Contador atualizar status → Usuário ver atualização

#### Configuração
- [ ] Configurar Cypress/Playwright
- [ ] Criar fixtures de dados de teste
- [ ] Rodar E2E no CI/CD (opcional)

**Entregáveis**:
- ✅ Cenários críticos cobertos por E2E

---

### Sprint 11.3: QA Manual

#### Checklist de Testes
- [ ] Testar em diferentes navegadores:
  - Chrome, Firefox, Safari, Edge
- [ ] Testar em mobile (responsividade)
- [ ] Testar com usuários reais (5-10 beta testers):
  - Signup
  - Compra
  - Uso do curso de inglês
  - Solicitação de CNPJ

#### Bug Tracking
- [ ] Criar board de bugs (Trello/Notion/GitHub Issues)
- [ ] Priorizar: Crítico, Alto, Médio, Baixo
- [ ] Corrigir bugs críticos e altos antes do lançamento

**Entregáveis**:
- ✅ QA completo realizado
- ✅ Bugs críticos corrigidos

---

### ✅ Checklist da Fase 11

- [ ] Testes unitários >70% coverage
- [ ] Testes de integração implementados
- [ ] Testes E2E dos fluxos críticos
- [ ] QA manual realizado
- [ ] Bugs críticos corrigidos
- [ ] Plataforma estável para lançamento

---

## 📅 FASE 12: DEPLOY E CI/CD (Semana 21)
### **Foco: Produção**

### Sprint 12.1: Configuração de Produção

#### Servidor
- [ ] Configurar servidor de produção (Coolify)
- [ ] Configurar banco de dados PostgreSQL (produção)
- [ ] Configurar variáveis de ambiente de produção
- [ ] Configurar SSL/HTTPS (Let's Encrypt)

#### Domínio
- [ ] Registrar domínio (ex: scalex.com.br)
- [ ] Configurar DNS:
  - A record para backend
  - A record para frontend
  - CNAME para www
- [ ] Configurar CORS para domínio de produção

**Entregáveis**:
- ✅ Servidor de produção configurado

---

### Sprint 12.2: CI/CD Pipeline

#### GitHub Actions (ou GitLab CI)
- [ ] Criar workflow de CI:
  - Rodar testes automaticamente em cada push
  - Rodar linter (ESLint)
  - Build de produção
- [ ] Criar workflow de CD:
  - Deploy automático para staging (branch `develop`)
  - Deploy manual para produção (branch `main`)

#### Ambientes
- [ ] Staging: Testes antes de produção
- [ ] Production: Ambiente final

**Entregáveis**:
- ✅ CI/CD funcionando

---

### Sprint 12.3: Backup e Disaster Recovery

#### Backup
- [ ] Configurar backup automático do banco (diário)
- [ ] Armazenar backups em local seguro (S3, Google Cloud Storage)
- [ ] Testar restauração de backup

#### Monitoring
- [ ] Configurar UptimeRobot (ou similar) para monitorar uptime
- [ ] Configurar alertas de downtime (email/SMS)

**Entregáveis**:
- ✅ Backup automático configurado
- ✅ Monitoramento ativo

---

### ✅ Checklist da Fase 12

- [ ] Servidor de produção configurado
- [ ] SSL/HTTPS funcionando
- [ ] Domínio configurado
- [ ] CI/CD pipeline implementado
- [ ] Backup automático configurado
- [ ] Monitoring ativo
- [ ] Deploy de produção realizado com sucesso

---

## 📅 FASES FUTURAS: NOVOS MÓDULOS (Pós-MVP)

### Módulo: Currículo Internacional (4 semanas)
- [ ] Templates de currículo em inglês/espanhol
- [ ] Editor visual de currículo
- [ ] Otimização para ATS (Applicant Tracking Systems)
- [ ] Download em PDF

### Módulo: Simulação de Entrevistas (6 semanas)
- [ ] Integração com IA (OpenAI GPT-4)
- [ ] Perguntas comuns de entrevista
- [ ] Gravação de respostas (vídeo/áudio)
- [ ] Feedback automático sobre resposta

### Módulo: Networking/LinkedIn (3 semanas)
- [ ] Análise de perfil LinkedIn
- [ ] Sugestões de otimização
- [ ] Templates de mensagens de networking
- [ ] Estratégias de conexão

### Módulo: Marketplace de Vagas (8 semanas)
- [ ] Curadoria de vagas internacionais
- [ ] Filtros avançados (país, área, nível)
- [ ] Aplicação assistida (revisão de currículo + carta de apresentação)
- [ ] Tracking de aplicações

### Módulo: Comunidade Premium (4 semanas)
- [ ] Fórum/Comunidade (Discord ou Circle.so)
- [ ] Eventos mensais (webinars, networking)
- [ ] Grupo de WhatsApp/Telegram
- [ ] Mentoria em grupo

---

## 🎯 RESUMO EXECUTIVO

### Timeline Total (MVP Completo)
- **Fase 1**: Autenticação (2 semanas)
- **Fase 2**: Infraestrutura Modular (2 semanas)
- **Fase 3**: Pagamentos (2 semanas)
- **Fase 4**: Parcerias (2 semanas)
- **Fase 5**: Módulo CNPJ (3 semanas)
- **Fase 6**: Módulo Remessas (2 semanas)
- **Fase 7**: Admin Dashboard (2 semanas)
- **Fase 8**: Analytics (1 semana)
- **Fase 9**: Email Marketing (1 semana)
- **Fase 10**: Performance (1 semana)
- **Fase 11**: Testes e QA (2 semanas)
- **Fase 12**: Deploy (1 semana)

**Total: 21 semanas (~5 meses)**

### MVP Inclui
1. ✅ Autenticação com Firebase
2. ✅ Sistema modular com 8 módulos
3. ✅ Pagamentos com Stripe
4. ✅ Sistema de parcerias e comissões
5. ✅ Módulo Curso de Inglês (já existente)
6. ✅ Módulo CNPJ
7. ✅ Módulo Remessas
8. ✅ Admin Dashboard completo
9. ✅ Analytics e métricas
10. ✅ Email marketing automático

### Próximas Etapas Após MVP
- Lançar soft launch (50-100 usuários)
- Coletar feedback
- Iterar e melhorar
- Lançar módulos adicionais (Currículo, Entrevistas, etc.)
- Escalar marketing

---

## 📚 RECURSOS ÚTEIS

### Documentação
- [NestJS](https://docs.nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Stripe API](https://stripe.com/docs/api)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

### Ferramentas
- [Postman](https://www.postman.com/) - Testar APIs
- [Stripe CLI](https://stripe.com/docs/stripe-cli) - Testar webhooks
- [DBeaver](https://dbeaver.io/) - Client PostgreSQL
- [Sentry](https://sentry.io/) - Error tracking
- [SendGrid](https://sendgrid.com/) - Email

---

**Este é um documento vivo. Atualize conforme o projeto evolui!**

**Última atualização**: {{ hoje }}
