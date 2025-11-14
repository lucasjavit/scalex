# 🎯 Prompts para Implementação do Módulo de Contabilidade

## 📋 Como Usar

Este documento contém **4 prompts especializados** para cada tipo de tarefa:

1. **🗄️ Banco de Dados (Migration)** - Para criar tabelas
2. **🧪 TDD (Testes)** - Para escrever testes antes do código
3. **⚙️ Backend** - Para implementar services, controllers, DTOs
4. **🎨 Frontend** - Para criar páginas e componentes

**Use os prompts na ordem:** Migration → TDD → Backend → Frontend

---

## 🗄️ PROMPT 1: Banco de Dados (Migration)

```
Vamos criar a migration para o STEP [NÚMERO]: [NOME_DA_TABELA].

BOAS PRÁTICAS DE BANCO DE DADOS (OBRIGATÓRIO):

1. NORMALIZAÇÃO
   - Aplicar 3ª Forma Normal (3NF)
   - Eliminar redundâncias
   - Separar entidades corretamente

2. TIPOS DE DADOS
   - UUID para IDs: gen_random_uuid()
   - DECIMAL(15,2) para valores monetários (NUNCA FLOAT/DOUBLE)
   - JSONB para dados semi-estruturados (não JSON)
   - TIMESTAMP WITH TIME ZONE para datas
   - VARCHAR(tamanho) com tamanho apropriado (não sem limite)
   - BOOLEAN para flags
   - TEXT para conteúdo longo
   - ENUM ou VARCHAR com CHECK para status

3. CONSTRAINTS (SEMPRE DEFINIR)
   - PRIMARY KEY em TODAS as tabelas
   - FOREIGN KEY com ON DELETE apropriado:
     * CASCADE: filho não existe sem pai (ex: documentos de uma empresa)
     * SET NULL: filho pode existir sem pai (ex: contador atribuído)
     * RESTRICT: não permite deleção se houver filhos
   - UNIQUE onde necessário (email, cnpj, etc)
   - NOT NULL para campos obrigatórios
   - CHECK para validações (ex: status IN (...), amount > 0)
   - DEFAULT values apropriados

4. ÍNDICES (SEMPRE CRIAR)
   - PRIMARY KEY (automático)
   - FOREIGN KEYS (criar índice explícito: CREATE INDEX)
   - Campos de busca frequente (user_id, status, created_at)
   - Campos usados em WHERE, JOIN, ORDER BY
   - Índices compostos para queries complexas (ex: status + created_at)
   - Nomenclatura: idx_tabela_campo ou idx_tabela_campo1_campo2

5. NOMENCLATURA
   - Tabelas: snake_case, plural (users, company_registration_requests)
   - Colunas: snake_case (user_id, created_at, legal_name)
   - FK: tabela_singular_id (user_id, company_id)
   - Índices: idx_tabela_campo
   - Constraints: fk_tabela_campo, uq_tabela_campo, chk_tabela_campo

6. AUDITORIA
   - created_at: TIMESTAMP DEFAULT NOW() (sempre)
   - updated_at: TIMESTAMP DEFAULT NOW() (sempre)
   - deleted_at: TIMESTAMP NULL (se usar soft delete)
   - created_by / updated_by: se necessário rastreabilidade

7. MIGRATIONS
   - Nome descritivo: CreateCompanyRegistrationRequestsTable
   - Sempre implementar UP (criar) e DOWN (reverter)
   - Testar rollback: npm run migration:revert
   - Versionamento automático (timestamp)
   - Idempotente: pode rodar múltiplas vezes sem erro

ENTREGÁVEIS:

- [ ] Migration: [timestamp]-[NomeDaMigration].ts
      Comando: npm run migration:create [NomeDaMigration]

- [ ] Estrutura da tabela com:
      * Todos os campos com tipos corretos
      * PRIMARY KEY
      * FOREIGN KEYS com ON DELETE
      * UNIQUE constraints
      * NOT NULL constraints
      * CHECK constraints (se aplicável)
      * DEFAULT values

- [ ] Índices:
      * idx_[tabela]_[campo] para cada FK
      * idx_[tabela]_[campo] para campos de busca
      * idx_[tabela]_[campo1]_[campo2] compostos (se aplicável)

- [ ] Método UP: criação completa da tabela
- [ ] Método DOWN: DROP TABLE IF EXISTS

- [ ] Validação:
      * npm run migration:run (deve rodar sem erros)
      * Verificar tabela: \d [nome_tabela] no psql
      * Verificar índices: \d+ [nome_tabela]
      * Testar rollback: npm run migration:revert
      * Rodar novamente: npm run migration:run

REFERÊNCIAS:
- Exemplo: back-end/src/migrations/*
- TypeORM docs: https://typeorm.io/migrations

Proceda com a implementação seguindo estas boas práticas.
```

---

## 🧪 PROMPT 2: TDD (Testes)

```
Vamos escrever os TESTES para o STEP [NÚMERO]: [NOME_DO_COMPONENTE] usando TDD.

METODOLOGIA TDD (RED → GREEN → REFACTOR):

1. RED (Escrever testes que FALHAM)
   - Escrever testes ANTES do código
   - Pensar nos casos de uso
   - Pensar nos casos de erro
   - Todos os testes devem FALHAR inicialmente

2. GREEN (Implementar código mínimo)
   - Fazer os testes passarem
   - Código mínimo necessário
   - Não adicionar funcionalidades extras

3. REFACTOR (Melhorar código)
   - Manter testes verdes
   - Eliminar duplicação
   - Melhorar nomenclatura

TIPOS DE TESTES:

1. TESTES UNITÁRIOS (Services)
   - Testar cada método isoladamente
   - Mockar dependências (repositories, outros services)
   - Casos de sucesso
   - Casos de erro (exceptions)
   - Edge cases (valores nulos, vazios, limites)
   - Coverage mínimo: 80%

2. TESTES DE INTEGRAÇÃO (Controllers)
   - Testar endpoints completos
   - Autenticação (com/sem token)
   - Autorização (roles diferentes)
   - Validação de DTOs
   - Status codes (200, 201, 400, 401, 403, 404, 500)

3. ESTRUTURA DE TESTE
   - describe() para agrupar relacionados
   - it() ou test() para casos individuais
   - beforeEach() para setup
   - afterEach() para cleanup
   - expect() assertions claras
   - Nomes descritivos: "should return user when valid ID is provided"

ENTREGÁVEIS:

TESTES UNITÁRIOS:
- [ ] [nome].service.spec.ts
      - describe('[NomeService]')
      - it('should be defined')
      - it('should [caso de sucesso 1]')
      - it('should [caso de sucesso 2]')
      - it('should throw error when [caso de erro 1]')
      - it('should throw error when [caso de erro 2]')
      - it('should handle [edge case]')

TESTES DE INTEGRAÇÃO (se aplicável):
- [ ] [nome].controller.spec.ts
      - describe('[NomeController]')
      - it('GET /endpoint - should return 200 with data')
      - it('GET /endpoint - should return 401 without token')
      - it('POST /endpoint - should return 201 when valid data')
      - it('POST /endpoint - should return 400 when invalid data')
      - it('POST /endpoint - should return 403 when unauthorized')

TESTES DE ENTITY (se aplicável):
- [ ] [nome].entity.spec.ts
      - it('should create instance with valid data')
      - it('should have correct relationships')

VALIDAÇÃO:
- [ ] Executar: npm test
      Resultado esperado: TODOS os testes FALHANDO (RED)
- [ ] Coverage: verificar com npm run test:cov
- [ ] Commitar testes: git commit -m "test: add tests for [nome]"

REFERÊNCIAS:
- Exemplo: back-end/src/users/users.service.spec.ts
- Jest docs: https://jestjs.io/
- NestJS testing: https://docs.nestjs.com/fundamentals/testing

Proceda escrevendo os TESTES primeiro (RED phase).
```

---

## ⚙️ PROMPT 3: Backend

```
Vamos implementar o BACKEND para o STEP [NÚMERO]: [NOME_DO_COMPONENTE].

PRÉ-REQUISITO: Testes devem estar escritos e FALHANDO (RED phase).

BOAS PRÁTICAS BACKEND (OBRIGATÓRIO):

1. ARQUITETURA EM CAMADAS
   - Controller: recebe requisições, valida, chama service
   - Service: lógica de negócio, transações
   - Repository: acesso ao banco (TypeORM)
   - DTO: validação de entrada/saída
   - Entity: mapeamento da tabela

2. TYPESCRIPT
   - Tipagem forte (evitar any)
   - Interfaces para contratos
   - Enums para valores fixos
   - Types para composições

3. VALIDAÇÃO E SEGURANÇA
   - DTOs com class-validator para TODAS as entradas
   - Guards: FirebaseAuthGuard (autenticação)
   - Guards: RolesGuard (autorização)
   - Sanitização de inputs
   - Não expor dados sensíveis em erros
   - Rate limiting em endpoints sensíveis

4. TRATAMENTO DE ERROS
   - try/catch em operações assíncronas
   - HttpException com status apropriado
   - Mensagens genéricas para usuário
   - Logs detalhados (sem dados sensíveis)

5. PERFORMANCE
   - Evitar N+1 queries (usar relations ou joins)
   - Pagination em listagens
   - Select apenas campos necessários
   - Transactions para operações atômicas

6. SOLID PRINCIPLES
   - Single Responsibility
   - Dependency Injection
   - Interface Segregation

ENTREGÁVEIS:

ENTITY:
- [ ] entities/[nome].entity.ts
      - @Entity('[nome_tabela]')
      - @PrimaryGeneratedColumn('uuid')
      - @Column() com tipos corretos
      - Relacionamentos (@ManyToOne, @OneToMany, etc)
      - @CreateDateColumn(), @UpdateDateColumn()

DTOs:
- [ ] dto/create-[nome].dto.ts
      - class-validator decorators (@IsString, @IsNotEmpty, etc)
      - Validações customizadas se necessário

- [ ] dto/update-[nome].dto.ts (se aplicável)
      - Extends PartialType(Create[Nome]Dto)

SERVICE:
- [ ] services/[nome].service.ts
      - @Injectable()
      - constructor com @InjectRepository
      - Métodos de negócio
      - Tratamento de erros
      - Logs
      - Validações de regras de negócio

CONTROLLER:
- [ ] controllers/[nome].controller.ts
      - @Controller('api/[rota]')
      - @UseGuards(FirebaseAuthGuard)
      - Endpoints REST:
        * @Post() - 201 Created
        * @Get() - 200 OK
        * @Get(':id') - 200 OK ou 404 Not Found
        * @Patch(':id') - 200 OK
        * @Delete(':id') - 204 No Content
      - @Body() com DTOs
      - @Param() para IDs
      - Swagger decorators (@ApiTags, @ApiOperation)

MODULE:
- [ ] [nome].module.ts
      - @Module()
      - imports: [TypeOrmModule.forFeature([Entity])]
      - controllers: [Controller]
      - providers: [Service]
      - exports: [Service] (se necessário)

VALIDAÇÃO:
- [ ] Executar: npm test
      Resultado esperado: TODOS os testes PASSANDO (GREEN)
- [ ] Executar: npm run build (sem erros)
- [ ] Executar: npm run start:dev (iniciar sem erros)
- [ ] Testar endpoints manualmente (Postman/Insomnia)
- [ ] Coverage mínimo 80%: npm run test:cov
- [ ] Commitar: git commit -m "feat: implement [nome]"

SEGURANÇA CHECKLIST:
- [ ] Todas as rotas com FirebaseAuthGuard?
- [ ] Autorização verificada (roles)?
- [ ] DTOs validando todas as entradas?
- [ ] Erros não expõem dados sensíveis?
- [ ] Logs não contêm senhas/tokens?

REFERÊNCIAS:
- Exemplo Service: back-end/src/users/users.service.ts
- Exemplo Controller: back-end/src/users/users.controller.ts
- Exemplo DTO: back-end/src/users/dto/create-user.dto.ts
- NestJS docs: https://docs.nestjs.com/

Proceda com a implementação para passar os testes (GREEN phase).
```

---

## 🎨 PROMPT 4: Frontend

```
Vamos implementar o FRONTEND para o STEP [NÚMERO]: [NOME_DO_COMPONENTE].

BOAS PRÁTICAS FRONTEND (OBRIGATÓRIO):

1. COMPONENTIZAÇÃO
   - Componentes pequenos e reutilizáveis
   - Single Responsibility
   - Props bem definidas
   - PropTypes ou TypeScript

2. ESTADO
   - useState para estado local
   - useContext para estado global (não abusar)
   - Evitar prop drilling

3. PERFORMANCE
   - React.memo para componentes puros
   - useMemo para cálculos pesados
   - useCallback para funções passadas como props
   - Lazy loading: React.lazy() + Suspense
   - Code splitting

4. VALIDAÇÃO
   - Validar formulários antes de enviar
   - Feedback visual de erros
   - Desabilitar submit durante envio

5. UX/UI
   - Loading states (spinners, skeletons)
   - Success feedback (mensagens, toasts)
   - Error handling amigável (não técnico)
   - Responsividade (mobile-first com Tailwind)
   - Acessibilidade (aria-labels, alt text, keyboard navigation)

6. SEGURANÇA
   - Evitar dangerouslySetInnerHTML
   - Sanitizar inputs
   - Não armazenar dados sensíveis no localStorage
   - Verificar permissões antes de renderizar

7. INTERNACIONALIZAÇÃO
   - Usar i18n para textos
   - Suportar pt-BR, en, es

ENTREGÁVEIS:

API SERVICE:
- [ ] services/[nome]Api.js
      - export const [nome]Api = { ... }
      - Métodos CRUD:
        * create(data)
        * getAll(filters)
        * getById(id)
        * update(id, data)
        * delete(id)
      - Tratamento de erros
      - Headers com token Firebase

COMPONENTES:
- [ ] components/[Nome].jsx
      - Props bem definidas
      - PropTypes
      - Estado local se necessário
      - Handlers de eventos
      - Validação
      - Feedback visual

PÁGINAS:
- [ ] pages/[Nome].jsx
      - useEffect para carregar dados
      - useState para estado
      - Loading state
      - Error state
      - Empty state
      - Renderização condicional

HOOKS CUSTOMIZADOS (se aplicável):
- [ ] hooks/use[Nome].js
      - Lógica reutilizável
      - Estado e efeitos encapsulados

ROTAS:
- [ ] Adicionar em routes/AppRoutes.jsx
      - <Route path="/caminho" element={<Componente />} />
      - PermissionRoute se necessário
      - Layout apropriado

VALIDAÇÃO:
- [ ] npm run dev (sem erros)
- [ ] Testar no navegador:
      * Fluxo completo funcional
      * Validação de formulários
      * Mensagens de erro
      * Loading states
      * Responsividade (mobile/tablet/desktop)
      * Acessibilidade básica
- [ ] Testes (se aplicável): [Nome].test.jsx
- [ ] Commitar: git commit -m "feat: add [nome] page/component"

UI/UX CHECKLIST:
- [ ] Loading ao carregar dados?
- [ ] Mensagem de erro amigável?
- [ ] Feedback de sucesso?
- [ ] Validação antes de submit?
- [ ] Botão desabilitado durante submit?
- [ ] Responsivo em mobile?
- [ ] Textos em i18n?

SEGURANÇA CHECKLIST:
- [ ] Inputs validados e sanitizados?
- [ ] Sem dangerouslySetInnerHTML?
- [ ] Permissões verificadas?
- [ ] Dados sensíveis não em localStorage?

REFERÊNCIAS:
- Exemplo Página: front-end/src/modules/auth-social/pages/Home.jsx
- Exemplo Componente: front-end/src/components/Navbar.jsx
- Exemplo Service: front-end/src/services/adminService.js
- Exemplo Hook: front-end/src/hooks/useUserPermissions.js
- React docs: https://react.dev/

Proceda com a implementação.
```

---

## 📋 Ordem de Execução dos Prompts

### Para cada STEP do módulo:

```
1. 🗄️ MIGRATION
   ↓
   Criar tabela no banco
   Testar UP/DOWN
   ✅ Commitar

2. 🧪 TDD (RED)
   ↓
   Escrever testes que FALHAM
   ✅ Commitar testes

3. ⚙️ BACKEND (GREEN)
   ↓
   Implementar Entity, DTO, Service, Controller
   Fazer testes PASSAREM
   ✅ Commitar código

4. 🎨 FRONTEND
   ↓
   Criar páginas/componentes
   Integrar com backend
   ✅ Commitar frontend
```

### Comandos Git:

```bash
# 1. Migration
git add back-end/src/migrations/*
git commit -m "feat(accounting): add [nome-tabela] migration"

# 2. TDD (RED)
git add *.spec.ts
git commit -m "test(accounting): add tests for [componente]"

# 3. Backend (GREEN)
git add back-end/src/modules/accounting/*
git commit -m "feat(accounting): implement [componente]"

# 4. Frontend
git add front-end/src/modules/accounting/*
git commit -m "feat(accounting): add [pagina/componente]"
```

---

## 🎯 Exemplo Prático - STEP 1

### 1️⃣ Migration (Primeiro)
```
Vamos criar a migration para o STEP 1: company_registration_requests.
[... usar PROMPT 1 ...]
```

### 2️⃣ TDD (Segundo)
```
Vamos escrever os TESTES para o STEP 1: CompanyRegistrationRequest usando TDD.
[... usar PROMPT 2 ...]
```

### 3️⃣ Backend (Terceiro)
```
Vamos implementar o BACKEND para o STEP 1: CompanyRegistrationRequest.
[... usar PROMPT 3 ...]
```

### 4️⃣ Frontend (Quarto - quando aplicável)
```
Vamos implementar o FRONTEND para o STEP 1: Formulário de Solicitação de CNPJ.
[... usar PROMPT 4 ...]
```

---

## 📊 Checklist Geral (Sempre Verificar)

### Banco de Dados
- [ ] 3NF aplicada
- [ ] Tipos corretos (UUID, DECIMAL, JSONB, TIMESTAMP WITH TIME ZONE)
- [ ] Constraints (PK, FK, UNIQUE, NOT NULL, CHECK)
- [ ] Índices (PK, FK, campos de busca)
- [ ] Auditoria (created_at, updated_at)
- [ ] UP e DOWN implementados
- [ ] Testado rollback

### Testes
- [ ] RED: Testes escritos primeiro
- [ ] GREEN: Testes passando
- [ ] Coverage ≥ 80%
- [ ] Casos de sucesso
- [ ] Casos de erro
- [ ] Edge cases

### Backend
- [ ] Tipagem forte (sem any)
- [ ] DTOs com validação
- [ ] Guards (autenticação + autorização)
- [ ] Tratamento de erros
- [ ] Logs (sem dados sensíveis)
- [ ] Performance (evitar N+1)
- [ ] SOLID principles

### Frontend
- [ ] Componentização
- [ ] Validação de formulários
- [ ] Loading/Error/Success states
- [ ] Responsividade
- [ ] Acessibilidade
- [ ] i18n
- [ ] Segurança (sem XSS)

### Segurança Geral
- [ ] Autenticação em todas as rotas
- [ ] Autorização por role
- [ ] Validação de entradas (backend + frontend)
- [ ] Sanitização de inputs
- [ ] Erros não expõem dados sensíveis
- [ ] Logs não contêm senhas/tokens

---

## ⚠️ Regras de Ouro

### NÃO FAZER:
- ❌ Pular etapas (sempre: Migration → TDD → Backend → Frontend)
- ❌ Escrever código antes dos testes
- ❌ Usar FLOAT/DOUBLE para dinheiro
- ❌ VARCHAR sem tamanho
- ❌ SELECT *
- ❌ N+1 queries
- ❌ Hardcodear valores
- ❌ Expor stack traces

### SEMPRE FAZER:
- ✅ Seguir a ordem: Migration → TDD → Backend → Frontend
- ✅ TDD: RED → GREEN → REFACTOR
- ✅ UUID para IDs
- ✅ DECIMAL para dinheiro
- ✅ Índices em FKs
- ✅ Constraints completas
- ✅ Testes antes do código
- ✅ Coverage ≥ 80%
- ✅ Validar entradas
- ✅ Tratar erros

---

**Pronto! Use cada prompt na ordem para implementar cada STEP do módulo.** 🚀
