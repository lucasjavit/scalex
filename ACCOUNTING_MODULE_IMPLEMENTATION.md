# 📊 Módulo de Contabilidade - Plano de Implementação

## 🎯 Visão Geral

Este módulo permite que usuários solicitem abertura de CNPJ, sejam atendidos por contadores parceiros da plataforma, e após a abertura, possam gerenciar suas empresas (impostos, documentos, etc).

---

## 🔄 Fluxo Completo

1. **Usuário não tem empresa** → Solicita abertura via formulário
2. **Sistema atribui contador** → Contador recebe notificação
3. **Contador entra em contato** → Via chat, solicita documentos
4. **Usuário envia documentos** → RG, CPF, comprovantes, etc
5. **Contador abre empresa** → Junta Comercial + Receita Federal (mundo real)
6. **Contador cadastra no sistema** → Empresa agora existe na plataforma
7. **Usuário gerencia empresa** → Ver impostos, documentos, chat
8. **Contador dá suporte contínuo** → Gera guias mensais, responde dúvidas

---

## 📋 Steps de Implementação

### ✅ **STEP 0: Preparação do Ambiente**

**Objetivo:** Criar a estrutura básica do módulo

#### Backend

- [ ] Criar módulo NestJS
  ```bash
  cd back-end/src/modules
  nest g module accounting
  ```

- [ ] Criar estrutura de pastas
  ```
  back-end/src/modules/accounting/
  ├── accounting.module.ts
  ├── entities/
  ├── dto/
  ├── services/
  ├── controllers/
  └── guards/
  ```

- [ ] Registrar módulo no `app.module.ts`

#### Frontend

- [ ] Criar estrutura de pastas
  ```
  front-end/src/modules/accounting/
  ├── pages/
  ├── components/
  └── services/
  ```

- [ ] Adicionar rotas no `AppRoutes.jsx`

---

### ✅ **STEP 1: Banco de Dados - Solicitações de Abertura**

**Objetivo:** Criar tabelas para gerenciar solicitações de abertura de CNPJ

#### 1.1 Criar Migration

- [ ] Criar migration: `CreateCompanyRegistrationRequestsTable`
  ```bash
  npm run migration:create CreateCompanyRegistrationRequestsTable
  ```

- [ ] Implementar migration com tabela `company_registration_requests`
  ```sql
  - id (UUID, PK)
  - user_id (UUID, FK → users)
  - assigned_to (UUID, FK → users, nullable) -- Contador
  - status (enum: pending, in_progress, waiting_documents, processing, completed, cancelled)
  - request_data (JSONB) -- Dados do formulário
  - company_id (UUID, FK → companies, nullable)
  - created_at
  - updated_at
  - completed_at
  - cancelled_at
  ```

#### 1.2 Criar Entity

- [ ] Criar `company-registration-request.entity.ts`
  ```typescript
  - Definir campos
  - Relacionamentos: user, assignedTo (contador), company
  - Enums para status
  ```

#### 1.3 Testar

- [ ] Rodar migration
- [ ] Verificar tabela criada no banco

---

### ✅ **STEP 2: Banco de Dados - Documentos da Solicitação**

**Objetivo:** Permitir upload de documentos durante a solicitação (antes da empresa existir)

#### 2.1 Criar Migration

- [ ] Criar migration: `CreateRequestDocumentsTable`

- [ ] Implementar tabela `request_documents`
  ```sql
  - id (UUID, PK)
  - request_id (UUID, FK → company_registration_requests)
  - uploaded_by (UUID, FK → users)
  - document_type (varchar) -- rg, cpf, comprovante_residencia
  - file_name (varchar)
  - file_path (varchar)
  - file_size (integer)
  - created_at
  ```

#### 2.2 Criar Entity

- [ ] Criar `request-document.entity.ts`
  ```typescript
  - Definir campos
  - Relacionamento: request
  - Cascade delete
  ```

#### 2.3 Testar

- [ ] Rodar migration
- [ ] Verificar tabela criada

---

### ✅ **STEP 3: Backend - Service de Solicitações**

**Objetivo:** Criar lógica de negócio para solicitações

#### 3.1 Criar DTOs

- [ ] Criar `create-registration-request.dto.ts`
  ```typescript
  - full_name
  - cpf
  - email
  - phone
  - business_type
  - estimated_revenue
  - will_have_employees
  - preferred_company_type
  - has_commercial_address
  - address (nested object)
  - urgency
  - notes
  ```

- [ ] Adicionar validações (class-validator)

#### 3.2 Criar Service

- [ ] Criar `registration-request.service.ts`

- [ ] Implementar método `createRequest(userId, dto)`
  ```typescript
  - Validar dados
  - Salvar no banco
  - Retornar solicitação criada
  ```

- [ ] Implementar método `assignAccountant(requestId)`
  ```typescript
  - Buscar contador com menos solicitações ativas
  - Atribuir contador
  - Atualizar status para 'in_progress'
  - Enviar notificação para contador
  - Enviar notificação para usuário
  ```

- [ ] Implementar método `getRequestsByUser(userId)`

- [ ] Implementar método `getRequestsByAccountant(accountantId)`

- [ ] Implementar método `updateRequestStatus(requestId, status)`

#### 3.3 Testar Service

- [ ] Criar testes unitários básicos

---

### ✅ **STEP 4: Backend - Controller de Solicitações**

**Objetivo:** Criar endpoints REST

#### 4.1 Criar Controller

- [ ] Criar `registration-request.controller.ts`

- [ ] Implementar endpoints:
  ```typescript
  POST   /api/accounting/requests                    // Criar solicitação
  GET    /api/accounting/requests/my-requests        // Listar minhas solicitações
  GET    /api/accounting/requests/:id                // Detalhes de uma solicitação
  PATCH  /api/accounting/requests/:id/status         // Atualizar status
  ```

#### 4.2 Adicionar Guards

- [ ] Adicionar `FirebaseAuthGuard` em todas as rotas

- [ ] Criar guard específico para contadores (em rotas de contador)

#### 4.3 Testar Endpoints

- [ ] Testar via Postman/Insomnia
- [ ] Validar permissões

---

### ✅ **STEP 5: Frontend - Página de Solicitação**

**Objetivo:** Criar formulário para usuário solicitar abertura de CNPJ

#### 5.1 Criar Service API

- [ ] Criar `accountingApi.js`
  ```javascript
  - createRequest(data)
  - getMyRequests()
  - getRequestDetails(id)
  ```

#### 5.2 Criar Página

- [ ] Criar `RequestCNPJ.jsx`

- [ ] Implementar formulário com campos:
  ```
  - Dados pessoais (nome, CPF, email, telefone)
  - Tipo de empresa desejada (MEI, ME, LTDA)
  - Atividade principal
  - Faturamento estimado
  - Endereço comercial
  - Urgência
  - Observações
  ```

- [ ] Adicionar validações no frontend

- [ ] Implementar submit do formulário

#### 5.3 Criar Componente de Sucesso

- [ ] Criar modal/página de confirmação após envio

- [ ] Mostrar mensagem: "Solicitação enviada! Em breve nosso contador entrará em contato."

#### 5.4 Adicionar Rota

- [ ] Adicionar rota `/accounting/request` no `AppRoutes.jsx`

- [ ] Adicionar proteção de permissão (`business.accounting`)

#### 5.5 Testar

- [ ] Testar preenchimento do formulário
- [ ] Testar envio
- [ ] Verificar dados salvos no banco

---

### ✅ **STEP 6: Frontend - Dashboard Inicial (Sem Empresa)**

**Objetivo:** Mostrar status da solicitação para o usuário

#### 6.1 Criar Página

- [ ] Criar `AccountingHome.jsx`

- [ ] Verificar se usuário tem empresa:
  ```javascript
  - Se NÃO tem empresa E NÃO tem solicitação → Mostrar CTA "Solicitar Abertura de CNPJ"
  - Se NÃO tem empresa MAS tem solicitação → Mostrar status da solicitação
  - Se tem empresa → Redirecionar para CompanyDashboard
  ```

#### 6.2 Criar Componente Timeline

- [ ] Criar `RequestTimeline.jsx`
  ```javascript
  Steps:
  1. Solicitação Enviada
  2. Contador Atribuído
  3. Documentos Enviados
  4. Abrindo na Receita
  5. CNPJ Obtido
  ```

- [ ] Destacar step atual
- [ ] Mostrar ícones e cores

#### 6.3 Adicionar Rota

- [ ] Adicionar rota `/accounting` como principal

#### 6.4 Testar

- [ ] Testar diferentes estados (sem solicitação, com solicitação pendente, etc)

---

### ✅ **STEP 7: Banco de Dados - Chat/Mensagens**

**Objetivo:** Permitir comunicação entre usuário e contador

#### 7.1 Criar Migration

- [ ] Criar migration: `CreateAccountingMessagesTable`

- [ ] Implementar tabela `accounting_messages`
  ```sql
  - id (UUID, PK)
  - request_id (UUID, FK → company_registration_requests, nullable)
  - company_id (UUID, FK → companies, nullable)
  - sender_id (UUID, FK → users)
  - receiver_id (UUID, FK → users)
  - message (text)
  - attachment_path (varchar, nullable)
  - is_read (boolean)
  - read_at (timestamp)
  - created_at

  -- Constraint: (request_id IS NOT NULL AND company_id IS NULL) OR
  --             (request_id IS NULL AND company_id IS NOT NULL)
  ```

#### 7.2 Criar Entity

- [ ] Criar `accounting-message.entity.ts`

#### 7.3 Testar

- [ ] Rodar migration
- [ ] Verificar constraint funcionando

---

### ✅ **STEP 8: Backend - Service de Chat**

**Objetivo:** Criar lógica para mensagens

#### 8.1 Criar DTOs

- [ ] Criar `send-message.dto.ts`
  ```typescript
  - requestId (opcional)
  - companyId (opcional)
  - receiverId
  - message
  - attachment (opcional)
  ```

#### 8.2 Criar Service

- [ ] Criar `message.service.ts`

- [ ] Implementar métodos:
  ```typescript
  - sendMessage(senderId, dto)
  - getMessagesByRequest(requestId)
  - getMessagesByCompany(companyId)
  - markAsRead(messageId, userId)
  - getUnreadCount(userId)
  ```

#### 8.3 Testar Service

- [ ] Testes unitários

---

### ✅ **STEP 9: Backend - Controller de Chat**

**Objetivo:** Criar endpoints de mensagens

#### 9.1 Criar Controller

- [ ] Criar `message.controller.ts`

- [ ] Implementar endpoints:
  ```typescript
  POST   /api/accounting/messages                    // Enviar mensagem
  GET    /api/accounting/messages/request/:id        // Mensagens de uma solicitação
  GET    /api/accounting/messages/company/:id        // Mensagens de uma empresa
  PATCH  /api/accounting/messages/:id/read           // Marcar como lida
  GET    /api/accounting/messages/unread-count       // Contador de não lidas
  ```

#### 9.2 Testar

- [ ] Testar endpoints via Postman

---

### ✅ **STEP 10: Frontend - Chat Component**

**Objetivo:** Interface de chat entre usuário e contador

#### 10.1 Criar Componente

- [ ] Criar `ChatBox.jsx`

- [ ] Implementar:
  ```javascript
  - Lista de mensagens (scroll automático para última)
  - Input de texto
  - Botão de envio
  - Upload de arquivo (opcional)
  - Indicador de "não lido"
  - Timestamp das mensagens
  ```

#### 10.2 Adicionar Polling (temporário)

- [ ] Implementar polling a cada 5s para buscar novas mensagens
  ```javascript
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  ```

#### 10.3 Testar

- [ ] Testar envio de mensagens
- [ ] Testar recebimento (abrir em 2 abas)

---

### ✅ **STEP 11: Backend - Upload de Documentos**

**Objetivo:** Permitir upload de arquivos

#### 11.1 Configurar Multer

- [ ] Instalar dependências
  ```bash
  npm install @nestjs/platform-express multer
  npm install -D @types/multer
  ```

- [ ] Criar pasta de uploads
  ```bash
  mkdir back-end/uploads
  mkdir back-end/uploads/request-documents
  ```

#### 11.2 Criar Service

- [ ] Criar `document.service.ts`

- [ ] Implementar métodos:
  ```typescript
  - uploadRequestDocument(requestId, userId, file, documentType)
  - getRequestDocuments(requestId)
  - deleteDocument(documentId, userId)
  ```

#### 11.3 Criar Controller

- [ ] Criar `document.controller.ts`

- [ ] Implementar endpoints:
  ```typescript
  POST   /api/accounting/documents/upload            // Upload
  GET    /api/accounting/documents/request/:id       // Listar docs de solicitação
  DELETE /api/accounting/documents/:id               // Deletar
  GET    /api/accounting/documents/:id/download      // Download
  ```

- [ ] Adicionar `@UseInterceptors(FileInterceptor('file'))`

#### 11.4 Testar

- [ ] Testar upload via Postman
- [ ] Verificar arquivo salvo em `uploads/`

---

### ✅ **STEP 12: Frontend - Upload de Documentos**

**Objetivo:** Interface de upload

#### 12.1 Criar Componente

- [ ] Criar `DocumentUpload.jsx`

- [ ] Implementar:
  ```javascript
  - Input file
  - Preview do arquivo selecionado
  - Progress bar (opcional)
  - Lista de documentos enviados
  - Botão de download
  - Botão de deletar
  ```

#### 12.2 Integrar no RequestStatus

- [ ] Adicionar seção "Documentos Solicitados" na página `RequestStatus.jsx`

- [ ] Mostrar quais documentos o contador solicitou

- [ ] Permitir upload

#### 12.3 Testar

- [ ] Testar upload
- [ ] Testar download
- [ ] Testar delete

---

### ✅ **STEP 13: Backend - Dashboard do Contador**

**Objetivo:** Contador visualiza suas solicitações

#### 13.1 Criar Endpoints

- [ ] Adicionar endpoints no `registration-request.controller.ts`:
  ```typescript
  GET /api/accounting/requests/accountant/pending     // Solicitações pendentes
  GET /api/accounting/requests/accountant/active      // Em andamento
  GET /api/accounting/requests/accountant/completed   // Concluídas
  ```

- [ ] Adicionar guard para verificar role `partner_cnpj`

#### 13.2 Implementar Service

- [ ] Adicionar métodos no `registration-request.service.ts`:
  ```typescript
  - getAccountantPendingRequests(accountantId)
  - getAccountantActiveRequests(accountantId)
  - getAccountantCompletedRequests(accountantId)
  ```

#### 13.3 Testar

- [ ] Criar usuário contador (role: partner_cnpj)
- [ ] Atribuir solicitação
- [ ] Testar endpoints

---

### ✅ **STEP 14: Frontend - Dashboard do Contador**

**Objetivo:** Interface para contador gerenciar solicitações

#### 14.1 Criar Página

- [ ] Criar `accountant/AccountantDashboard.jsx`

- [ ] Mostrar cards:
  ```
  - Total de solicitações ativas
  - Solicitações pendentes (urgentes)
  - Empresas gerenciadas
  ```

#### 14.2 Criar Lista de Solicitações

- [ ] Criar `accountant/RequestsList.jsx`

- [ ] Mostrar tabela/cards com:
  ```
  - Nome do usuário
  - Tipo de empresa desejada
  - Data da solicitação
  - Status
  - Ações: [Ver Detalhes] [Chat]
  ```

#### 14.3 Criar Detalhes

- [ ] Criar `accountant/RequestDetails.jsx`

- [ ] Mostrar:
  ```
  - Dados completos da solicitação
  - Documentos enviados pelo usuário
  - Chat
  - Botão "Registrar Empresa" (quando pronto)
  ```

#### 14.4 Adicionar Rotas

- [ ] Adicionar rotas protegidas por role `partner_cnpj`:
  ```
  /accounting/accountant/dashboard
  /accounting/accountant/requests
  /accounting/accountant/requests/:id
  ```

#### 14.5 Testar

- [ ] Logar como contador
- [ ] Ver solicitações atribuídas
- [ ] Navegar pelos detalhes

---

### ✅ **STEP 15: Banco de Dados - Empresas**

**Objetivo:** Tabela de empresas (após abertura real)

#### 15.1 Criar Migration

- [ ] Criar migration: `CreateCompaniesTable`

- [ ] Implementar tabela `companies`
  ```sql
  - id (UUID, PK)
  - user_id (UUID, FK → users)
  - accountant_id (UUID, FK → users)
  - request_id (UUID, FK → company_registration_requests, nullable)
  - legal_name (varchar)
  - trade_name (varchar, nullable)
  - cnpj (varchar, unique)
  - company_type (varchar) -- MEI, ME, EIRELI, LTDA
  - main_activity (varchar) -- CNAE
  - tax_regime (varchar) -- Simples Nacional, Lucro Presumido, Lucro Real
  - opening_date (date)
  - estimated_revenue (decimal)
  - address (jsonb)
  - state_registration (varchar, nullable)
  - municipal_registration (varchar, nullable)
  - status (varchar) -- active, inactive, suspended
  - created_at
  - updated_at
  ```

#### 15.2 Criar Entity

- [ ] Criar `company.entity.ts`

- [ ] Relacionamentos: user, accountant, request

#### 15.3 Testar

- [ ] Rodar migration

---

### ✅ **STEP 16: Backend - Service de Empresas**

**Objetivo:** Lógica de criação e gestão de empresas

#### 16.1 Criar DTOs

- [ ] Criar `create-company.dto.ts`
  ```typescript
  - legalName
  - tradeName
  - cnpj
  - companyType
  - mainActivity
  - taxRegime
  - openingDate
  - estimatedRevenue
  - address
  - stateRegistration
  - municipalRegistration
  ```

#### 16.2 Criar Service

- [ ] Criar `company.service.ts`

- [ ] Implementar métodos:
  ```typescript
  - createCompanyFromRequest(requestId, accountantId, dto)
    * Criar empresa
    * Atualizar solicitação (status: completed, company_id)
    * Notificar usuário

  - getCompaniesByUser(userId)
  - getCompaniesByAccountant(accountantId)
  - getCompanyDetails(companyId)
  - updateCompany(companyId, dto)
  ```

#### 16.3 Testar Service

- [ ] Testes unitários

---

### ✅ **STEP 17: Backend - Controller de Empresas**

**Objetivo:** Endpoints de empresas

#### 17.1 Criar Controller

- [ ] Criar `company.controller.ts`

- [ ] Implementar endpoints:
  ```typescript
  POST   /api/accounting/companies                   // Criar empresa (contador)
  GET    /api/accounting/companies/my-companies      // Minhas empresas (usuário)
  GET    /api/accounting/companies/accountant        // Empresas que gerencio (contador)
  GET    /api/accounting/companies/:id               // Detalhes
  PATCH  /api/accounting/companies/:id               // Atualizar
  ```

#### 17.2 Adicionar Guards

- [ ] Endpoint POST: apenas contadores (`partner_cnpj`)
- [ ] Outros endpoints: usuário pode ver apenas suas empresas

#### 17.3 Testar

- [ ] Testar criação via Postman
- [ ] Verificar vínculo com solicitação

---

### ✅ **STEP 18: Frontend - Contador Registra Empresa**

**Objetivo:** Contador cadastra a empresa após abertura real

#### 18.1 Criar Página

- [ ] Criar `accountant/CreateCompany.jsx`

- [ ] Implementar formulário:
  ```
  - Razão Social
  - Nome Fantasia
  - CNPJ
  - Tipo (MEI, ME, LTDA)
  - CNAE
  - Data de Abertura
  - Regime Tributário
  - Endereço
  - Inscrições (Estadual, Municipal)
  ```

- [ ] Pré-popular com dados da solicitação (quando possível)

- [ ] Upload de documentos oficiais:
  ```
  - Cartão CNPJ (PDF)
  - Certificado MEI (se aplicável)
  - Contrato Social
  - Alvará
  ```

#### 18.2 Adicionar Botão

- [ ] Na página `RequestDetails.jsx`, adicionar botão "Registrar Empresa"

- [ ] Habilitar apenas quando status = 'processing'

#### 18.3 Testar

- [ ] Testar criação
- [ ] Verificar status da solicitação muda para 'completed'
- [ ] Verificar usuário recebe notificação

---

### ✅ **STEP 19: Frontend - Dashboard da Empresa (Usuário)**

**Objetivo:** Usuário visualiza e gerencia sua empresa

#### 19.1 Criar Página

- [ ] Criar `CompanyDashboard.jsx`

- [ ] Implementar tabs:
  ```
  1. Resumo - Informações gerais
  2. Impostos - Guias e pagamentos
  3. Documentos - Arquivos da empresa
  4. Chat - Suporte com contador
  ```

#### 19.2 Tab Resumo

- [ ] Mostrar:
  ```
  - Razão Social / Nome Fantasia
  - CNPJ
  - Tipo / Regime Tributário
  - Data de Abertura
  - Status (Ativa/Inativa)
  - Contador responsável (nome)
  ```

#### 19.3 Tab Documentos

- [ ] Listar documentos da empresa
- [ ] Download
- [ ] Categorias (Constituição, Registros, Certidões, Fiscais)

#### 19.4 Tab Chat

- [ ] Reutilizar componente `ChatBox`
- [ ] Agora vinculado à empresa (não mais à solicitação)

#### 19.5 Adicionar Rota

- [ ] Rota `/accounting/company/:id`

#### 19.6 Testar

- [ ] Logar como usuário
- [ ] Acessar empresa
- [ ] Navegar pelas tabs

---

### ✅ **STEP 20: Banco de Dados - Impostos/Guias**

**Objetivo:** Gerenciar impostos e guias de pagamento

#### 20.1 Criar Migration

- [ ] Criar migration: `CreateTaxPaymentsTable`

- [ ] Implementar tabela `tax_payments`
  ```sql
  - id (UUID, PK)
  - company_id (UUID, FK → companies)
  - generated_by (UUID, FK → users) -- Contador
  - tax_type (varchar) -- DAS, DARF, GPS, ISS, ICMS
  - reference_period (date) -- Mês/ano de referência
  - due_date (date)
  - amount (decimal)
  - barcode (varchar, nullable)
  - file_path (varchar, nullable) -- PDF da guia
  - payment_status (varchar) -- pending, paid, overdue, cancelled
  - paid_at (timestamp, nullable)
  - paid_amount (decimal, nullable)
  - created_at
  - updated_at
  ```

#### 20.2 Criar Entity

- [ ] Criar `tax-payment.entity.ts`

#### 20.3 Testar

- [ ] Rodar migration

---

### ✅ **STEP 21: Backend - Service de Impostos**

**Objetivo:** Lógica para gerar e gerenciar impostos

#### 21.1 Criar DTOs

- [ ] Criar `create-tax-payment.dto.ts`
  ```typescript
  - companyId
  - taxType
  - referencePeriod
  - dueDate
  - amount
  - barcode
  ```

#### 21.2 Criar Service

- [ ] Criar `tax-payment.service.ts`

- [ ] Implementar métodos:
  ```typescript
  - createTaxPayment(accountantId, dto)
  - getTaxPaymentsByCompany(companyId)
  - getTaxPaymentById(taxId)
  - markAsPaid(taxId, userId, paidAmount)
  - getOverdueTaxes(companyId)
  - getUpcomingTaxes(days = 7) // Próximos vencimentos
  ```

#### 21.3 Criar PDF Generator (Opcional - Fase 2)

- [ ] Criar `pdf-generator.service.ts`
- [ ] Gerar PDF de guia DAS (mock inicialmente)

#### 21.4 Testar Service

- [ ] Testes unitários

---

### ✅ **STEP 22: Backend - Controller de Impostos**

**Objetivo:** Endpoints de impostos

#### 22.1 Criar Controller

- [ ] Criar `tax-payment.controller.ts`

- [ ] Implementar endpoints:
  ```typescript
  POST   /api/accounting/taxes                       // Criar guia (contador)
  GET    /api/accounting/taxes/company/:id           // Impostos de uma empresa
  GET    /api/accounting/taxes/:id                   // Detalhes
  PATCH  /api/accounting/taxes/:id/mark-paid         // Marcar como pago (usuário)
  GET    /api/accounting/taxes/:id/download          // Download PDF
  ```

#### 22.2 Adicionar Guards

- [ ] POST: apenas contadores
- [ ] PATCH: apenas dono da empresa
- [ ] GET: dono ou contador da empresa

#### 22.3 Testar

- [ ] Testar via Postman

---

### ✅ **STEP 23: Frontend - Tab Impostos (Usuário)**

**Objetivo:** Usuário visualiza e gerencia impostos

#### 23.1 Criar Componente

- [ ] Criar `TaxPayments.jsx` (ou implementar na tab)

- [ ] Mostrar lista de impostos:
  ```
  ┌─────────────────────────────────────┐
  │ DAS - Novembro/2025                 │
  │ Vencimento: 20/12/2025              │
  │ Valor: R$ 71,00                     │
  │ Status: Pendente ⚠️                 │
  │ [Download PDF] [Marcar como Pago]   │
  └─────────────────────────────────────┘
  ```

- [ ] Filtros:
  ```
  - Todos / Pendentes / Pagos / Vencidos
  - Por tipo de imposto
  - Por período
  ```

#### 23.2 Implementar Ações

- [ ] Download do PDF
- [ ] Marcar como pago (com confirmação)
- [ ] Mostrar alertas de vencimento próximo

#### 23.3 Adicionar Dashboard Widget

- [ ] No `CompanyDashboard`, mostrar resumo:
  ```
  📊 Próximos Impostos
  ─────────────────────
  ⚠️  DAS - Vence em 5 dias
     R$ 71,00
  ```

#### 23.4 Testar

- [ ] Testar visualização
- [ ] Testar marcar como pago

---

### ✅ **STEP 24: Frontend - Contador Gera Impostos**

**Objetivo:** Contador cria guias para empresas

#### 24.1 Criar Página

- [ ] Criar `accountant/GenerateTax.jsx`

- [ ] Formulário:
  ```
  - Selecionar empresa (dropdown)
  - Tipo de imposto (DAS, DARF, GPS, etc)
  - Período de referência (mês/ano)
  - Data de vencimento
  - Valor
  - Código de barras (opcional)
  - Upload PDF (opcional)
  ```

#### 24.2 Adicionar Atalho

- [ ] Na lista de empresas do contador, botão "Gerar Imposto"

#### 24.3 Testar

- [ ] Testar criação
- [ ] Verificar usuário consegue ver e baixar

---

### ✅ **STEP 25: Banco de Dados - Documentos da Empresa**

**Objetivo:** Armazenar documentos após empresa criada

#### 25.1 Criar Migration

- [ ] Criar migration: `CreateCompanyDocumentsTable`

- [ ] Implementar tabela `company_documents`
  ```sql
  - id (UUID, PK)
  - company_id (UUID, FK → companies)
  - uploaded_by (UUID, FK → users)
  - category (varchar) -- constituicao, registros, certidoes, fiscais
  - document_type (varchar)
  - file_name (varchar)
  - file_path (varchar)
  - file_size (integer)
  - expiration_date (date, nullable) -- Para certidões
  - created_at
  ```

#### 25.2 Criar Entity

- [ ] Criar `company-document.entity.ts`

#### 25.3 Testar

- [ ] Rodar migration

---

### ✅ **STEP 26: Backend - Service e Controller de Documentos da Empresa**

**Objetivo:** Upload/download de documentos da empresa

#### 26.1 Estender Service

- [ ] Adicionar métodos no `document.service.ts`:
  ```typescript
  - uploadCompanyDocument(companyId, userId, file, category, documentType)
  - getCompanyDocuments(companyId, category?)
  - deleteCompanyDocument(documentId, userId)
  ```

#### 26.2 Estender Controller

- [ ] Adicionar endpoints no `document.controller.ts`:
  ```typescript
  POST   /api/accounting/documents/company/upload
  GET    /api/accounting/documents/company/:id
  DELETE /api/accounting/documents/:id
  ```

#### 26.3 Testar

- [ ] Testar upload e download

---

### ✅ **STEP 27: Frontend - Gestão de Documentos da Empresa**

**Objetivo:** Usuário e contador fazem upload de documentos

#### 27.1 Implementar na Tab Documentos

- [ ] Categorias:
  ```
  - Constituição (Contrato Social, Alterações)
  - Registros (Cartão CNPJ, Certificado MEI, Alvarás)
  - Certidões (Negativas Federal, Estadual, Municipal)
  - Fiscais (Guias pagas, Declarações)
  ```

- [ ] Listar documentos por categoria
- [ ] Upload
- [ ] Download
- [ ] Delete (apenas quem fez upload)

#### 27.2 Alertas de Vencimento

- [ ] Mostrar alerta quando certidão está próxima de vencer (30 dias)

#### 27.3 Testar

- [ ] Upload de documentos
- [ ] Verificar organização por categoria

---

### ✅ **STEP 28: Notificações**

**Objetivo:** Sistema de notificações básico

#### 28.1 Backend - Emails

- [ ] Configurar serviço de email (NodeMailer ou similar)

- [ ] Criar templates:
  ```
  - Solicitação recebida (usuário)
  - Nova solicitação atribuída (contador)
  - Empresa criada com sucesso (usuário)
  - Novo imposto disponível (usuário)
  - Imposto vencendo em X dias (usuário)
  - Nova mensagem no chat
  ```

- [ ] Enviar emails nos momentos-chave

#### 28.2 Frontend - Notificações In-App (Opcional)

- [ ] Badge no ícone de chat mostrando mensagens não lidas

- [ ] Badge no sino mostrando notificações

#### 28.3 Testar

- [ ] Testar recebimento de emails

---

### ✅ **STEP 29: Integrações Extras (Opcional - Fase 2)**

**Objetivo:** Funcionalidades avançadas

#### 29.1 API Receita Federal

- [ ] Criar `cnpj-lookup.service.ts`
- [ ] Integrar com BrasilAPI ou ReceitaWS
- [ ] Buscar dados de CNPJ automaticamente
- [ ] Pré-popular formulário de criação de empresa

#### 29.2 Calculadora de Impostos

- [ ] Criar calculadora para MEI (fixo R$ 71,00)
- [ ] Calculadora Simples Nacional (por faixa de faturamento)

#### 29.3 Geração Automática de DAS Mensal

- [ ] Cron job que roda todo dia 1º do mês
- [ ] Gera DAS automaticamente para todas as empresas MEI
- [ ] Notifica usuários

#### 29.4 WebSocket para Chat

- [ ] Substituir polling por WebSocket
- [ ] Mensagens em tempo real

---

### ✅ **STEP 30: Banco de Dados - Solicitações de Serviços**

**Objetivo:** Após empresa criada, usuário pode solicitar serviços ao contador

#### 30.1 Criar Migration

- [ ] Criar migration: `CreateServiceRequestsTable`

- [ ] Implementar tabela `service_requests`
  ```sql
  - id (UUID, PK)
  - company_id (UUID, FK → companies)
  - user_id (UUID, FK → users)
  - request_type (varchar) -- certidao_negativa, alteracao_contratual, emissao_nf, duvida
  - subject (varchar)
  - description (text)
  - status (varchar) -- open, in_progress, resolved, closed
  - priority (varchar) -- low, normal, high, urgent
  - resolved_at (timestamp)
  - created_at
  - updated_at
  ```

#### 30.2 Criar Entity

- [ ] Criar `service-request.entity.ts`

#### 30.3 Testar

- [ ] Rodar migration

---

### ✅ **STEP 31: Backend - Service e Controller de Solicitações de Serviço**

**Objetivo:** Usuário solicita serviços ao contador

#### 31.1 Criar DTOs

- [ ] Criar `create-service-request.dto.ts`

#### 31.2 Criar Service

- [ ] Criar `service-request.service.ts`

- [ ] Métodos:
  ```typescript
  - createServiceRequest(userId, companyId, dto)
  - getServiceRequestsByCompany(companyId)
  - updateRequestStatus(requestId, status)
  - resolveRequest(requestId)
  ```

#### 31.3 Criar Controller

- [ ] Criar `service-request.controller.ts`

- [ ] Endpoints:
  ```typescript
  POST   /api/accounting/service-requests
  GET    /api/accounting/service-requests/company/:id
  PATCH  /api/accounting/service-requests/:id/status
  ```

#### 31.4 Testar

- [ ] Testar via Postman

---

### ✅ **STEP 32: Frontend - Solicitações de Serviço**

**Objetivo:** Interface para solicitar serviços

#### 32.1 Criar Modal/Página

- [ ] Criar `ServiceRequestForm.jsx`

- [ ] Campos:
  ```
  - Tipo de serviço (dropdown)
  - Assunto
  - Descrição
  - Prioridade (opcional)
  ```

#### 32.2 Adicionar Botão

- [ ] No `CompanyDashboard`, seção "Precisa de algo?"
- [ ] Botões rápidos:
  ```
  [Solicitar Certidão]
  [Alterar Contrato Social]
  [Emitir Nota Fiscal]
  [Outra Dúvida]
  ```

#### 32.3 Mostrar Histórico

- [ ] Listar solicitações anteriores
- [ ] Status de cada uma

#### 32.4 Testar

- [ ] Testar criação de solicitação
- [ ] Verificar contador recebe notificação

---

### ✅ **STEP 33: Admin - Gerenciamento de Contadores**

**Objetivo:** Admin gerencia contadores parceiros

#### 33.1 Backend - Tabela de Perfil do Contador

- [ ] Criar migration: `CreateAccountantProfilesTable`
  ```sql
  - id (UUID, PK)
  - user_id (UUID, FK → users, unique)
  - company_name (varchar) -- Nome do escritório
  - crc (varchar) -- Registro CRC
  - specialties (text[]) -- ['MEI', 'Tech', 'E-commerce']
  - bio (text)
  - pricing_info (text)
  - average_rating (decimal)
  - total_reviews (integer)
  - is_approved (boolean)
  - is_active (boolean)
  - created_at
  - updated_at
  ```

- [ ] Criar entity `accountant-profile.entity.ts`

#### 33.2 Backend - Endpoints Admin

- [ ] Criar controller ou estender existente:
  ```typescript
  GET    /api/admin/accountants                      // Listar contadores
  POST   /api/admin/accountants                      // Adicionar contador
  PATCH  /api/admin/accountants/:id/approve          // Aprovar
  PATCH  /api/admin/accountants/:id/deactivate       // Desativar
  ```

#### 33.3 Frontend - Página Admin

- [ ] Criar `admin/AccountantsManagement.jsx`

- [ ] Listar contadores com filtros (ativos, pendentes, desativados)

- [ ] Ações: Aprovar, Desativar, Ver Detalhes

#### 33.4 Testar

- [ ] Criar contador
- [ ] Aprovar/desativar

---

### ✅ **STEP 34: Testes e Refinamentos**

**Objetivo:** Testar todo o fluxo end-to-end

#### 34.1 Teste Completo do Fluxo

- [ ] Como Usuário:
  1. Solicitar abertura de CNPJ
  2. Enviar documentos
  3. Trocar mensagens com contador
  4. Ver empresa criada
  5. Ver impostos
  6. Baixar documentos
  7. Solicitar serviço

- [ ] Como Contador:
  1. Ver solicitação atribuída
  2. Solicitar documentos
  3. Responder mensagens
  4. Criar empresa
  5. Gerar impostos
  6. Atender solicitações de serviço

- [ ] Como Admin:
  1. Gerenciar contadores
  2. Ver métricas

#### 34.2 Correções e Ajustes

- [ ] Corrigir bugs encontrados
- [ ] Melhorar UX
- [ ] Adicionar validações faltantes

#### 34.3 Performance

- [ ] Otimizar queries (adicionar índices)
- [ ] Lazy loading de documentos
- [ ] Pagination em listas grandes

#### 34.4 Segurança

- [ ] Validar permissões em todos os endpoints
- [ ] Sanitizar inputs
- [ ] Validar uploads (tipo, tamanho)

---

### ✅ **STEP 35: Documentação e Deploy**

**Objetivo:** Documentar e preparar para produção

#### 35.1 Documentação

- [ ] README do módulo
- [ ] Swagger/OpenAPI para endpoints
- [ ] Diagramas de fluxo
- [ ] Manual do usuário (básico)

#### 35.2 Ambiente de Produção

- [ ] Configurar variáveis de ambiente
- [ ] Configurar armazenamento de arquivos (S3, etc)
- [ ] Configurar emails (SendGrid, etc)
- [ ] Configurar backup de banco

#### 35.3 Deploy

- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Testar em produção

---

## 🎯 Resumo de Prioridades

### **Fase 1 - MVP (Steps 0-19)**
Foco: Solicitação → Chat → Criação de Empresa

- Solicitação de abertura
- Chat básico
- Upload de documentos
- Contador cria empresa
- Dashboard básico

**Prazo estimado:** 3-4 semanas

### **Fase 2 - Gestão (Steps 20-27)**
Foco: Impostos e Documentos

- Gestão de impostos
- Documentos da empresa
- Download/upload
- Notificações

**Prazo estimado:** 2-3 semanas

### **Fase 3 - Extras (Steps 28-35)**
Foco: Funcionalidades avançadas

- Integrações (API Receita)
- Solicitações de serviço
- Admin de contadores
- Refinamentos

**Prazo estimado:** 2-3 semanas

---

## 📊 Checklist Geral

- [ ] **STEP 0**: Preparação do ambiente
- [ ] **STEP 1**: BD - Solicitações
- [ ] **STEP 2**: BD - Documentos da solicitação
- [ ] **STEP 3**: Backend - Service de solicitações
- [ ] **STEP 4**: Backend - Controller de solicitações
- [ ] **STEP 5**: Frontend - Página de solicitação
- [ ] **STEP 6**: Frontend - Dashboard inicial
- [ ] **STEP 7**: BD - Chat/Mensagens
- [ ] **STEP 8**: Backend - Service de chat
- [ ] **STEP 9**: Backend - Controller de chat
- [ ] **STEP 10**: Frontend - Chat component
- [ ] **STEP 11**: Backend - Upload de documentos
- [ ] **STEP 12**: Frontend - Upload de documentos
- [ ] **STEP 13**: Backend - Dashboard do contador
- [ ] **STEP 14**: Frontend - Dashboard do contador
- [ ] **STEP 15**: BD - Empresas
- [ ] **STEP 16**: Backend - Service de empresas
- [ ] **STEP 17**: Backend - Controller de empresas
- [ ] **STEP 18**: Frontend - Contador registra empresa
- [ ] **STEP 19**: Frontend - Dashboard da empresa
- [ ] **STEP 20**: BD - Impostos/Guias
- [ ] **STEP 21**: Backend - Service de impostos
- [ ] **STEP 22**: Backend - Controller de impostos
- [ ] **STEP 23**: Frontend - Tab impostos
- [ ] **STEP 24**: Frontend - Contador gera impostos
- [ ] **STEP 25**: BD - Documentos da empresa
- [ ] **STEP 26**: Backend - Service/Controller docs empresa
- [ ] **STEP 27**: Frontend - Gestão de documentos
- [ ] **STEP 28**: Notificações
- [ ] **STEP 29**: Integrações extras (opcional)
- [ ] **STEP 30**: BD - Solicitações de serviços
- [ ] **STEP 31**: Backend - Service/Controller serviços
- [ ] **STEP 32**: Frontend - Solicitações de serviço
- [ ] **STEP 33**: Admin - Gerenciamento de contadores
- [ ] **STEP 34**: Testes e refinamentos
- [ ] **STEP 35**: Documentação e deploy

---

## 🚀 Próximos Passos

1. Revisar este documento
2. Decidir se vai fazer tudo ou começar pelo MVP (Steps 0-19)
3. Começar pelo **STEP 0** - Preparação do ambiente

**Está pronto para começar? Qual step quer implementar primeiro?** 🎯
