# 🏗️ ScaleX - Plataforma Modular

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Conceito de Plataforma Modular](#conceito-de-plataforma-modular)
3. [Analogias para Entender](#analogias-para-entender)
4. [Arquitetura Técnica](#arquitetura-técnica)
5. [Módulos Planejados](#módulos-planejados)
6. [Estrutura de Preços](#estrutura-de-preços)
7. [Jornadas de Usuários](#jornadas-de-usuários)
8. [Roadmap de Implementação](#roadmap-de-implementação)
9. [Código e Exemplos](#código-e-exemplos)
10. [Métricas e KPIs](#métricas-e-kpis)

---

## 🎯 Visão Geral

### O Problema
A plataforma original tinha 8 módulos integrados em um único produto, forçando o usuário a pagar por tudo mesmo que precisasse apenas de uma funcionalidade específica.

### A Solução
**Plataforma Modular**: Usuários escolhem e pagam apenas pelos módulos que precisam, com total autonomia para adicionar novos módulos conforme suas necessidades evoluem.

### Vantagens

#### Para o Usuário:
- ✅ Paga apenas pelo que precisa
- ✅ Pode começar gratuitamente
- ✅ Adiciona módulos conforme cresce
- ✅ Não se sente sobrecarregado
- ✅ Investimento inicial menor

#### Para o Negócio:
- ✅ Lança módulo por módulo (validação incremental)
- ✅ Múltiplas fontes de receita
- ✅ Maior taxa de conversão (preços menores)
- ✅ Oportunidades constantes de upsell
- ✅ Escalável sem limite

---

## 💡 Conceito de Plataforma Modular

### O que é?
Uma plataforma onde cada funcionalidade é um **módulo independente** que pode ser comprado separadamente.

### Como funciona?

```
DASHBOARD CENTRAL (Hub)
    ├─ Módulo 1: Curso de Inglês (R$197)
    ├─ Módulo 2: Vagas Internacionais (Grátis)
    ├─ Módulo 3: CNPJ + Contador (R$97)
    ├─ Módulo 4: Consultoria LinkedIn (R$147)
    ├─ Módulo 5: Aulas ao Vivo (R$197/mês)
    ├─ Módulo 6: Conversação (Incluso Premium)
    ├─ Módulo 7: Seguros (Sob consulta)
    └─ Módulo 8: Banco/Remessas (Grátis + afiliados)
```

O usuário:
1. Vê todos os módulos disponíveis
2. Escolhe qual(is) comprar
3. Paga apenas pelos selecionados
4. Pode voltar depois para comprar mais

---

## 🎮 Analogias para Entender

### 1. Videogame com DLCs

**❌ Modelo Antigo:**
```
Jogo completo: R$200
- Inclui TUDO (campanha + multiplayer + 100 mapas + 50 personagens)
- Tamanho: 100GB
- Você paga por tudo mesmo que só queira a campanha
```

**✅ Modelo Modular:**
```
Jogo base: R$60
- Apenas campanha
- Tamanho: 20GB

Se quiser mais:
- DLC Multiplayer: +R$40
- DLC Novos Mapas: +R$20
- DLC Personagens: +R$15
```

### 2. Pizzaria

**❌ Menu Degustação Obrigatório:**
```
- 8 pizzas + 5 sobremesas + 3 bebidas
- Preço: R$200
- Problema: "Eu só queria uma pizza!"
```

**✅ À La Carte:**
```
- Pizza calabresa: R$40
- Refrigerante: R$8
- Total: R$48
- Se quiser mais depois, pede sobremesa: +R$15
```

### 3. WeWork (Coworking)

**❌ Alugar prédio inteiro:**
```
- Startup precisa de 2 mesas
- Sistema obriga alugar 100 mesas
- Preço: R$50.000/mês
- Resultado: Startup desiste
```

**✅ Modular:**
```
- Aluga 2 mesas: R$2.000/mês
- Quando crescer, aluga mais: +R$5.000/mês
- Paga conforme cresce
```

---

## 🏗️ Arquitetura Técnica

### Estrutura do Banco de Dados

```sql
-- Tabela de Módulos Disponíveis
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_type ENUM('one-time', 'monthly', 'free') DEFAULT 'one-time',
  icon VARCHAR(10),
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Módulos do Usuário
CREATE TABLE user_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  module_id UUID NOT NULL REFERENCES modules(id),
  purchased_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT true,
  bundle_id UUID NULL,
  UNIQUE(user_id, module_id)
);

-- Tabela de Bundles/Combos
CREATE TABLE bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  billing_type ENUM('one-time', 'monthly') DEFAULT 'one-time',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Módulos inclusos em cada Bundle
CREATE TABLE bundle_modules (
  bundle_id UUID REFERENCES bundles(id),
  module_id UUID REFERENCES modules(id),
  PRIMARY KEY(bundle_id, module_id)
);

-- Histórico de Compras
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  purchase_type ENUM('module', 'bundle') NOT NULL,
  module_id UUID NULL REFERENCES modules(id),
  bundle_id UUID NULL REFERENCES bundles(id),
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status ENUM('pending', 'completed', 'refunded', 'failed'),
  transaction_id VARCHAR(255),
  purchased_at TIMESTAMP DEFAULT NOW()
);
```

### Dados Iniciais (Seed)

```sql
-- Inserir módulos iniciais
INSERT INTO modules (code, name, description, price, billing_type, icon, category) VALUES
  ('english-course', 'Curso de Inglês', 'Aprenda inglês para entrevistas técnicas em 30 dias', 197.00, 'one-time', '📚', 'education'),
  ('job-board', 'Vagas Internacionais', '500+ vagas remotas atualizadas diariamente', 0.00, 'free', '💼', 'career'),
  ('cnpj-guide', 'Abrir CNPJ', 'Guia completo + rede de contadores parceiros', 97.00, 'one-time', '📄', 'legal'),
  ('linkedin-consulting', 'Consultoria LinkedIn', 'Otimize seu perfil profissional', 147.00, 'one-time', '👔', 'career'),
  ('live-classes', 'Aulas de Inglês Premium', 'Aulas ao vivo em grupo 1x/semana', 197.00, 'monthly', '🎓', 'education'),
  ('conversation', 'Conversação', 'Pratique com outros alunos (requer Premium)', 0.00, 'free', '💬', 'education'),
  ('insurance', 'Seguros', 'Plano de saúde + seguros DTI', 0.00, 'free', '🛡️', 'financial'),
  ('banking-guide', 'Receber do Exterior', 'Guia completo para receber em dólar', 0.00, 'free', '💰', 'financial');

-- Inserir bundles
INSERT INTO bundles (code, name, description, price, original_price, billing_type) VALUES
  ('starter', 'Starter Pack', 'Perfeito para começar', 197.00, 197.00, 'one-time'),
  ('professional', 'Professional Pack', 'Tudo para conseguir emprego remoto', 397.00, 491.00, 'one-time'),
  ('premium', 'Premium Membership', 'Fluência + acompanhamento contínuo', 297.00, NULL, 'monthly');

-- Relacionar módulos aos bundles
INSERT INTO bundle_modules (bundle_id, module_id) VALUES
  -- Starter Pack
  ((SELECT id FROM bundles WHERE code = 'starter'), (SELECT id FROM modules WHERE code = 'english-course')),
  ((SELECT id FROM bundles WHERE code = 'starter'), (SELECT id FROM modules WHERE code = 'job-board')),

  -- Professional Pack
  ((SELECT id FROM bundles WHERE code = 'professional'), (SELECT id FROM modules WHERE code = 'english-course')),
  ((SELECT id FROM bundles WHERE code = 'professional'), (SELECT id FROM modules WHERE code = 'job-board')),
  ((SELECT id FROM bundles WHERE code = 'professional'), (SELECT id FROM modules WHERE code = 'cnpj-guide')),
  ((SELECT id FROM bundles WHERE code = 'professional'), (SELECT id FROM modules WHERE code = 'linkedin-consulting')),

  -- Premium
  ((SELECT id FROM bundles WHERE code = 'premium'), (SELECT id FROM modules WHERE code = 'english-course')),
  ((SELECT id FROM bundles WHERE code = 'premium'), (SELECT id FROM modules WHERE code = 'job-board')),
  ((SELECT id FROM bundles WHERE code = 'premium'), (SELECT id FROM modules WHERE code = 'live-classes')),
  ((SELECT id FROM bundles WHERE code = 'premium'), (SELECT id FROM modules WHERE code = 'conversation'));
```

---

## 📦 Módulos Planejados

### Módulo 1: Curso de Inglês ✅ (Já existe)
```
CÓDIGO: english-course
PREÇO: R$197 (pagamento único)
CATEGORIA: Educação

DESCRIÇÃO:
- 30 dias de conteúdo focado em entrevistas técnicas
- Foundation + Professional + Mastery Stages
- Spaced Repetition (SM-2)
- Certificado de conclusão

COMPLEXIDADE: Média (já implementado)
TEMPO ESTIMADO: Pronto
```

### Módulo 2: Vagas Internacionais 💼
```
CÓDIGO: job-board
PREÇO: Grátis
CATEGORIA: Carreira

DESCRIÇÃO:
- Web scraper de RemoteOK, LinkedIn, Indeed
- 500-1000 vagas remotas
- Filtros: Remote, English, Tech stack
- Botão "Apply" (redireciona para vaga original)

COMPLEXIDADE: Baixa-Média
TEMPO ESTIMADO: 1-2 meses
CUSTO: R$20k-50k

VANTAGEM:
- Fácil de implementar
- Agrega muito valor
- Baixo custo de manutenção
- Entrada gratuita (isca)
```

### Módulo 3: CNPJ + Contador 📄
```
CÓDIGO: cnpj-guide
PREÇO: R$97 (pagamento único)
CATEGORIA: Legal

DESCRIÇÃO:
- Guia passo a passo para abrir CNPJ
- Marketplace com 5-10 contadores parceiros
- Comparação de preços
- Templates de contratos
- Você recebe comissão dos contadores

COMPLEXIDADE: Média
TEMPO ESTIMADO: 2-4 meses
CUSTO: R$50k-100k

MODELO DE NEGÓCIO:
- Usuário paga R$97 pelo guia
- Contador paga 20-30% de comissão (R$200-300)
- Receita total por venda: R$300-400
```

### Módulo 4: Consultoria LinkedIn 👔
```
CÓDIGO: linkedin-consulting
PREÇO: R$147 (pagamento único)
CATEGORIA: Carreira

DESCRIÇÃO:
- 1 sessão de 60min com especialista
- Revisão completa do perfil
- Recomendações personalizadas
- Templates de headline/sobre

COMPLEXIDADE: Baixa
TEMPO ESTIMADO: 1 mês
CUSTO: R$20k-30k

ALTERNATIVA MAIS SIMPLES:
- Vender apenas templates (R$47)
- Consultoria opcional (parceiros externos)
```

### Módulo 5: Aulas de Inglês Premium 🎓
```
CÓDIGO: live-classes
PREÇO: R$197/mês (recorrente)
CATEGORIA: Educação

DESCRIÇÃO:
- 4 aulas ao vivo por mês (1x/semana)
- Grupos de 10-15 alunos
- Via Zoom (você é o professor)
- Gravações disponíveis
- Conversação inclusa

COMPLEXIDADE: Média
TEMPO ESTIMADO: 2-3 meses
CUSTO: R$50k-100k

ESFORÇO:
- 1 hora/semana de aula
- 2 horas/semana de suporte
- Receita: 20 alunos × R$197 = R$3.940/mês

ALTERNATIVA (futuro):
- Marketplace de professores (complexidade alta)
- Matching aluno-professor
- Sistema de agendamento
- Tempo: 12-18 meses / Custo: R$500k-1M
```

### Módulo 6: Conversação 💬
```
CÓDIGO: conversation
PREÇO: Incluso no Premium
CATEGORIA: Educação

DESCRIÇÃO:
- Sessões de conversação em grupo
- 3x por semana, horários fixos
- Discord ou Zoom
- Grupos por nível (iniciante, intermediário, avançado)

COMPLEXIDADE: Baixa-Média (manual) / Alta (automático)
TEMPO ESTIMADO: 1 mês (manual) / 18-24 meses (automático)

VERSÃO 1 (Manual - recomendado):
- Você cria salas Zoom manualmente
- Horários fixos: Segunda 20h, Quarta 20h, Sexta 20h
- 5-10 pessoas por sala
- Custo: R$0 (Zoom gratuito até 40min)

VERSÃO 2 (Automático - futuro):
- Matching em tempo real
- Algoritmo de nivelamento (IA)
- Criação de salas on-demand (Zoom API)
- Sistema de fila (WebSockets)
- Custo: R$1M-2M
```

### Módulo 7: Seguros 🛡️
```
CÓDIGO: insurance
PREÇO: Sob consulta / Grátis (afiliados)
CATEGORIA: Financeiro

DESCRIÇÃO:
- Plano de saúde
- Seguro DTI (afastamento)
- Outros seguros

COMPLEXIDADE: Baixa (afiliados) / Alta (corretor)
TEMPO ESTIMADO: 1 semana (afiliados) / 3-6 meses (corretor)

MODELO RECOMENDADO:
- Parcerias com SulAmérica/Unimed
- Links de afiliado
- Comparador simples
- Você ganha 10-30% de comissão
- Custo: R$0
```

### Módulo 8: Banco/Remessas 💰
```
CÓDIGO: banking-guide
PREÇO: Grátis
CATEGORIA: Financeiro

DESCRIÇÃO:
- Guia: "Como receber do exterior em 3 passos"
- Parceria com Wise/Remessa Online
- Tutorial em vídeo
- Link de afiliado

COMPLEXIDADE: Muito Baixa
TEMPO ESTIMADO: 1 semana
CUSTO: R$0

RECEITA:
- Comissão: 30-50% do primeiro ano
- Exemplo: Cliente usa Wise e paga US$100/ano
- Você recebe US$30-50

ALTERNATIVA (NÃO RECOMENDADO):
- Criar banco digital próprio
- Custo: R$10M-50M
- Tempo: 3-5 anos
- Risco: Altíssimo (licenças, compliance)
```

---

## 💰 Estrutura de Preços

### Modelo À La Carte (Individual)

| Módulo | Preço | Tipo | Categoria |
|--------|-------|------|-----------|
| Curso de Inglês | R$197 | Único | Educação |
| Vagas Internacionais | Grátis | - | Carreira |
| CNPJ + Contador | R$97 | Único | Legal |
| Consultoria LinkedIn | R$147 | Único | Carreira |
| Aulas Premium | R$197/mês | Mensal | Educação |
| Conversação | Incluso | - | Educação |
| Seguros | Consulta | Afiliado | Financeiro |
| Banco/Remessas | Grátis | Afiliado | Financeiro |

### Bundles (Combos com Desconto)

#### Starter Pack - R$197
```
Inclui:
✅ Curso de Inglês (R$197)
✅ Vagas Internacionais (Grátis)

Economia: R$0
Ideal para: Iniciantes
```

#### Professional Pack - R$397
```
Inclui:
✅ Curso de Inglês (R$197)
✅ Vagas Internacionais (Grátis)
✅ CNPJ + Contador (R$97)
✅ Consultoria LinkedIn (R$147)

Valor total: R$441
Economia: R$44 (10% de desconto)
Ideal para: Quem quer tudo para começar
```

#### Premium Membership - R$297/mês
```
Inclui:
✅ Curso de Inglês (R$197 - incluso)
✅ Vagas Internacionais (Grátis)
✅ Aulas ao Vivo (R$197/mês)
✅ Conversação (Incluso)
✅ Suporte prioritário

Valor à parte: R$394 (único) + R$197/mês
Economia: R$97 no primeiro mês
Ideal para: Quem quer fluência total
```

---

## 👥 Jornadas de Usuários

### Persona 1: João - "Só preciso passar na entrevista"

**SITUAÇÃO:**
- Desenvolvedor júnior
- Já aplicou para 5 vagas remotas
- Tem entrevista em 2 semanas
- Inglês fraco
- Budget: R$200

**JORNADA:**

```
DIA 1:
1. Encontra ScaleX no Google: "curso inglês entrevistas"
2. Entra no site
3. Cria conta (email + senha)
4. Dashboard mostra:
   [Explore]
   📚 Curso de Inglês - R$197
   💼 Vagas Remotas - GRÁTIS

5. Clica em "Ativar" nas Vagas (grátis)
6. Navega pelas vagas, aplica para 3

DIA 2:
7. Volta ao site
8. Decide comprar o Curso de Inglês
9. Checkout: R$197
10. Paga com cartão

DIA 3-15:
11. Estuda 20min/dia
12. Completa Foundation Stage
13. Pratica com flashcards

DIA 15:
14. Entrevista em inglês
15. Passa! 🎉
16. Recebe oferta: US$5k/mês

MÊS 2:
17. Precisa de CNPJ
18. Volta ao dashboard
19. Compra módulo CNPJ: R$97
20. Contrata contador da rede

LIFETIME VALUE: R$294 + comissão do contador (~R$300)
```

### Persona 2: Maria - "Já trabalho remoto, preciso regularizar"

**SITUAÇÃO:**
- Desenvolvedora plena
- Já trabalha remoto há 3 meses (PF)
- Inglês fluente
- Precisa abrir CNPJ
- Budget: R$500

**JORNADA:**

```
DIA 1:
1. Encontra ScaleX no Google: "como abrir cnpj pj"
2. Entra no site
3. Cria conta
4. Dashboard:
   [Explore]
   📄 CNPJ + Contador - R$97
   💰 Banco/Remessas - Grátis

5. Compra módulo CNPJ: R$97
6. Ativa Banco/Remessas (grátis)

DIA 2-7:
7. Lê guia de CNPJ
8. Escolhe contador na rede
9. Contrata (contador paga comissão para ScaleX)

DIA 8:
10. Lê guia de banco
11. Clica no link afiliado do Wise
12. Abre conta Wise (comissão para ScaleX)

MÊS 3:
13. Descobre que quer melhorar inglês
14. Compra Curso de Inglês: R$197

LIFETIME VALUE: R$294 + comissões (~R$500)
```

### Persona 3: Carlos - "Quero fluência total"

**SITUAÇÃO:**
- Desenvolvedor sênior
- Inglês intermediário
- Quer investir em educação
- Budget: R$500/mês

**JORNADA:**

```
DIA 1:
1. Encontra ScaleX em anúncio
2. Entra no site
3. Vê o Premium Membership
4. Assina Premium: R$297/mês

DIA 2-30:
5. Faz o curso completo
6. Assiste 4 aulas ao vivo
7. Pratica conversação 3x/semana

MÊS 2-6:
8. Continua assinando Premium
9. Melhora muito o inglês
10. Consegue promoção (de US$5k para US$8k/mês)

MÊS 7:
11. Já está fluente
12. Cancela Premium
13. Mantém acesso ao curso e vagas

LIFETIME VALUE: R$1.782 (6 meses × R$297)
```

---

## 🗓️ Roadmap de Implementação

### FASE 1: Core da Plataforma (Mês 1-2)

**Backend:**
```
✅ Criar tabelas:
   - modules
   - user_modules
   - bundles
   - bundle_modules
   - purchases

✅ Criar APIs:
   - GET /api/modules (listar todos)
   - GET /api/user/modules (módulos do usuário)
   - POST /api/modules/:id/purchase (comprar módulo)
   - GET /api/bundles (listar combos)

✅ Middleware de Permissões:
   - checkModuleAccess(moduleCode)
   - Proteger rotas existentes

✅ Integração de Pagamento:
   - Stripe ou PagSeguro
   - Webhooks para ativar módulos
```

**Frontend:**
```
✅ Dashboard com Grid de Módulos:
   - Seção "Meus Módulos"
   - Seção "Explore Mais"
   - Cards com status (ativo/disponível/locked)

✅ Página de Checkout:
   - Resumo da compra
   - Upsells (leve junto)
   - Formulário de pagamento

✅ Navegação modular:
   - /modules/:moduleCode
   - Verificação de acesso
   - Redirecionamento para checkout se não tiver
```

**Módulos Ativos:**
- Curso de Inglês (já existe)
- Vagas Internacionais (desenvolver)

**Objetivo:**
- Primeiras vendas
- 10 clientes pagantes
- Validar conceito

### FASE 2: Expansão (Mês 3-4)

**Backend:**
```
✅ Sistema de Bundles:
   - Lógica de descontos
   - Ativar múltiplos módulos de uma vez

✅ Sistema de Recomendações:
   - "Aproveite e leve junto"
   - Upsells inteligentes
```

**Frontend:**
```
✅ Cards de Bundles
✅ Comparação de preços
✅ Página de cada módulo (/modules/:code)
```

**Novos Módulos:**
- CNPJ + Contador (marketplace simples)
- Banco/Remessas (afiliados)

**Objetivo:**
- Aumentar ticket médio
- 50 clientes
- R$10k-15k/mês de receita

### FASE 3: Premium (Mês 5-6)

**Backend:**
```
✅ Sistema de Assinaturas:
   - Billing recorrente (Stripe Subscriptions)
   - Renovação automática
   - Cancelamento

✅ Agendamento de Aulas:
   - Tabela: classes (id, date, zoom_link, capacity)
   - Inscrições: class_enrollments
```

**Frontend:**
```
✅ Página de Premium
✅ Calendário de aulas
✅ Acesso ao Discord/grupo
```

**Novos Módulos:**
- Aulas ao Vivo Premium
- Conversação (agendada manualmente)

**Objetivo:**
- Receita recorrente
- 10-20 assinantes Premium
- R$2k-4k/mês recorrente

### FASE 4: Otimização (Mês 7-12)

**Backend:**
```
✅ Analytics avançado:
   - Taxa de conversão por módulo
   - LTV por persona
   - Churn rate (cancelamentos)

✅ Sistema de Afiliados:
   - Links de parceiros
   - Tracking de comissões
```

**Frontend:**
```
✅ Dashboard de progresso
✅ Gamificação (achievements)
✅ Perfil do usuário
```

**Objetivo:**
- Escalar para 100-200 clientes
- R$30k-50k/mês
- LTV > R$500

### FASE 5: Automação (Ano 2+)

**Backend:**
```
✅ Conversação automática:
   - Matching em tempo real
   - Algoritmo de nivelamento
   - Zoom API (criar salas on-demand)

✅ Marketplace de Professores:
   - Cadastro de professores
   - Sistema de agendamento
   - Pagamentos
```

**Objetivo:**
- Escalar para 500-1000 clientes
- R$100k-200k/mês
- Produto sustentável

---

## 💻 Código e Exemplos

### 1. Middleware de Permissões

```javascript
// back-end/src/common/middleware/checkModuleAccess.js

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserModule } from '../entities/user-module.entity';

export function CheckModuleAccess(moduleCode: string) {
  @Injectable()
  class ModuleAccessGuard implements CanActivate {
    constructor(
      @InjectRepository(UserModule)
      private userModulesRepository: Repository<UserModule>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const userId = request.user?.id;

      if (!userId) {
        throw new ForbiddenException('User not authenticated');
      }

      // Verifica se o usuário tem acesso ao módulo
      const hasAccess = await this.userModulesRepository.findOne({
        where: {
          userId,
          module: { code: moduleCode },
          isActive: true,
        },
        relations: ['module'],
      });

      // Também verifica se não expirou (para módulos mensais)
      if (hasAccess && hasAccess.expiresAt) {
        if (new Date() > hasAccess.expiresAt) {
          throw new ForbiddenException({
            message: 'Your subscription has expired',
            moduleCode,
            renewUrl: `/checkout/${moduleCode}`,
          });
        }
      }

      if (!hasAccess) {
        throw new ForbiddenException({
          message: 'You do not have access to this module',
          moduleCode,
          purchaseUrl: `/checkout/${moduleCode}`,
        });
      }

      return true;
    }
  }

  return ModuleAccessGuard;
}

// USO:
// @UseGuards(CheckModuleAccess('english-course'))
// @Get('stages')
// async getStages(@Request() req) { ... }
```

### 2. Controller de Módulos

```typescript
// back-end/src/modules/platform/controllers/modules.controller.ts

import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ModulesService } from '../services/modules.service';

@Controller('api/modules')
@UseGuards(JwtAuthGuard)
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  // Lista todos os módulos disponíveis
  @Get()
  async getAllModules() {
    return this.modulesService.findAll();
  }

  // Lista módulos que o usuário possui
  @Get('my-modules')
  async getMyModules(@Request() req) {
    return this.modulesService.getUserModules(req.user.id);
  }

  // Verifica se usuário tem acesso a um módulo específico
  @Get(':code/check-access')
  async checkAccess(@Param('code') code: string, @Request() req) {
    const hasAccess = await this.modulesService.checkUserAccess(req.user.id, code);
    return { hasAccess };
  }

  // Compra um módulo
  @Post(':code/purchase')
  async purchaseModule(@Param('code') code: string, @Request() req) {
    return this.modulesService.createCheckoutSession(req.user.id, code);
  }
}
```

### 3. Service de Módulos

```typescript
// back-end/src/modules/platform/services/modules.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from '../entities/module.entity';
import { UserModule } from '../entities/user-module.entity';
import Stripe from 'stripe';

@Injectable()
export class ModulesService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Module)
    private modulesRepository: Repository<Module>,
    @InjectRepository(UserModule)
    private userModulesRepository: Repository<UserModule>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  // Lista todos os módulos disponíveis
  async findAll(): Promise<Module[]> {
    return this.modulesRepository.find({
      where: { isActive: true },
      order: { category: 'ASC', price: 'ASC' },
    });
  }

  // Lista módulos do usuário
  async getUserModules(userId: string): Promise<UserModule[]> {
    return this.userModulesRepository.find({
      where: { userId, isActive: true },
      relations: ['module'],
    });
  }

  // Verifica se usuário tem acesso
  async checkUserAccess(userId: string, moduleCode: string): Promise<boolean> {
    const userModule = await this.userModulesRepository.findOne({
      where: {
        userId,
        module: { code: moduleCode },
        isActive: true,
      },
      relations: ['module'],
    });

    if (!userModule) return false;

    // Verifica expiração (para módulos mensais)
    if (userModule.expiresAt && new Date() > userModule.expiresAt) {
      return false;
    }

    return true;
  }

  // Cria sessão de checkout
  async createCheckoutSession(userId: string, moduleCode: string) {
    const module = await this.modulesRepository.findOne({
      where: { code: moduleCode },
    });

    if (!module) {
      throw new Error('Module not found');
    }

    // Cria sessão no Stripe
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: module.name,
              description: module.description,
            },
            unit_amount: Math.round(module.price * 100), // Centavos
            ...(module.billingType === 'monthly' && {
              recurring: { interval: 'month' },
            }),
          },
          quantity: 1,
        },
      ],
      mode: module.billingType === 'monthly' ? 'subscription' : 'payment',
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
      metadata: {
        userId,
        moduleId: module.id,
        moduleCode,
      },
    });

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  }

  // Ativa módulo após pagamento (chamado pelo webhook)
  async activateModule(userId: string, moduleId: string, subscriptionEnd?: Date) {
    const userModule = this.userModulesRepository.create({
      userId,
      moduleId,
      purchasedAt: new Date(),
      expiresAt: subscriptionEnd,
      isActive: true,
    });

    return this.userModulesRepository.save(userModule);
  }
}
```

### 4. Webhook do Stripe

```typescript
// back-end/src/modules/platform/controllers/webhooks.controller.ts

import { Controller, Post, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { ModulesService } from '../services/modules.service';

@Controller('webhooks')
export class WebhooksController {
  private stripe: Stripe;

  constructor(private readonly modulesService: ModulesService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      throw new Error('Invalid signature');
    }

    // Pagamento único completado
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, moduleId } = session.metadata;

      await this.modulesService.activateModule(userId, moduleId);
    }

    // Assinatura criada (módulo mensal)
    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object as Stripe.Subscription;
      const { userId, moduleId } = subscription.metadata;

      const periodEnd = new Date(subscription.current_period_end * 1000);
      await this.modulesService.activateModule(userId, moduleId, periodEnd);
    }

    // Assinatura renovada
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      const subscription = await this.stripe.subscriptions.retrieve(
        invoice.subscription as string,
      );

      const { userId, moduleId } = subscription.metadata;
      const periodEnd = new Date(subscription.current_period_end * 1000);

      // Atualiza data de expiração
      await this.modulesService.renewModule(userId, moduleId, periodEnd);
    }

    // Assinatura cancelada
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const { userId, moduleId } = subscription.metadata;

      await this.modulesService.deactivateModule(userId, moduleId);
    }

    return { received: true };
  }
}
```

### 5. Frontend - Dashboard

```jsx
// front-end/src/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import apiService from '../services/api';
import ModuleCard from '../components/ModuleCard';

export default function Dashboard() {
  const [allModules, setAllModules] = useState([]);
  const [myModules, setMyModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Busca todos os módulos
      const modulesData = await apiService.request('/api/modules');
      setAllModules(modulesData);

      // Busca módulos do usuário
      const myModulesData = await apiService.request('/api/modules/my-modules');
      setMyModules(myModulesData.map(m => m.module.code));
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasModule = (moduleCode) => {
    return myModules.includes(moduleCode);
  };

  const handlePurchase = async (module) => {
    try {
      const response = await apiService.request(`/api/modules/${module.code}/purchase`, {
        method: 'POST',
      });

      // Redireciona para Stripe Checkout
      window.location.href = response.checkoutUrl;
    } catch (error) {
      console.error('Error purchasing module:', error);
      alert('Erro ao processar compra. Tente novamente.');
    }
  };

  const handleAccess = (moduleCode) => {
    window.location.href = `/modules/${moduleCode}`;
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  const ownedModules = allModules.filter(m => hasModule(m.code));
  const availableModules = allModules.filter(m => !hasModule(m.code));

  return (
    <div className="dashboard">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        {/* Meus Módulos */}
        {ownedModules.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Meus Módulos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownedModules.map(module => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  owned={true}
                  onAccess={() => handleAccess(module.code)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Módulos Disponíveis */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Explore Mais Módulos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableModules.map(module => (
              <ModuleCard
                key={module.id}
                module={module}
                owned={false}
                onPurchase={() => handlePurchase(module)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
```

### 6. Frontend - ModuleCard Component

```jsx
// front-end/src/components/ModuleCard.jsx

export default function ModuleCard({ module, owned, onAccess, onPurchase }) {
  const formatPrice = (price) => {
    if (price === 0) return 'Grátis';
    return `R$${price.toFixed(2)}`;
  };

  const getBillingText = (billingType) => {
    if (billingType === 'monthly') return '/mês';
    return '';
  };

  const getStatusBadge = () => {
    if (owned) {
      return <span className="badge badge-success">Ativo</span>;
    }
    if (module.price === 0) {
      return <span className="badge badge-info">Grátis</span>;
    }
    if (module.billingType === 'monthly') {
      return <span className="badge badge-primary">Mensal</span>;
    }
    return null;
  };

  return (
    <div className="module-card bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Icon e Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{module.icon}</div>
        {getStatusBadge()}
      </div>

      {/* Título e Descrição */}
      <h3 className="text-xl font-bold mb-2">{module.name}</h3>
      <p className="text-gray-600 text-sm mb-4">{module.description}</p>

      {/* Preço e Ação */}
      <div className="flex items-center justify-between mt-auto">
        <div className="text-left">
          <span className="text-2xl font-bold">
            {formatPrice(module.price)}
          </span>
          <span className="text-gray-500 text-sm">
            {getBillingText(module.billingType)}
          </span>
        </div>

        {owned ? (
          <button
            onClick={onAccess}
            className="btn-primary px-6 py-2"
          >
            Acessar
          </button>
        ) : (
          <button
            onClick={onPurchase}
            className="btn-outline px-6 py-2"
          >
            {module.price === 0 ? 'Ativar' : 'Comprar'}
          </button>
        )}
      </div>
    </div>
  );
}
```

### 7. Protegendo Rotas Existentes

```typescript
// back-end/src/modules/english-learning/course/controllers/stages.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CheckModuleAccess } from '../../../../common/middleware/checkModuleAccess';
import { StagesService } from '../services/stages.service';

@Controller('api/english-course/stages')
@UseGuards(JwtAuthGuard)
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  // Agora requer acesso ao módulo 'english-course'
  @Get()
  @UseGuards(CheckModuleAccess('english-course'))
  async findAll(@Request() req) {
    const userId = req.user.id;
    return this.stagesService.findAllWithProgress(userId);
  }

  // ... outras rotas também protegidas
}
```

---

## 📊 Métricas e KPIs

### Métricas de Conversão

```sql
-- Taxa de conversão por módulo
SELECT
  m.name,
  m.price,
  COUNT(DISTINCT p.user_id) as purchases,
  COUNT(DISTINCT v.user_id) as visitors,
  ROUND(COUNT(DISTINCT p.user_id)::NUMERIC / COUNT(DISTINCT v.user_id) * 100, 2) as conversion_rate
FROM modules m
LEFT JOIN purchases p ON p.module_id = m.id AND p.payment_status = 'completed'
LEFT JOIN page_views v ON v.page = '/modules/' || m.code
GROUP BY m.id, m.name, m.price
ORDER BY conversion_rate DESC;
```

### Lifetime Value (LTV)

```sql
-- LTV por usuário
SELECT
  u.id,
  u.email,
  SUM(p.amount_paid) as total_spent,
  COUNT(DISTINCT p.module_id) as modules_purchased,
  MIN(p.purchased_at) as first_purchase,
  MAX(p.purchased_at) as last_purchase
FROM users u
JOIN purchases p ON p.user_id = u.id AND p.payment_status = 'completed'
GROUP BY u.id, u.email
ORDER BY total_spent DESC;
```

### Taxa de Retenção (Churn)

```sql
-- Churn de assinaturas mensais
SELECT
  DATE_TRUNC('month', um.purchased_at) as month,
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN um.is_active = false THEN 1 END) as churned,
  ROUND(COUNT(CASE WHEN um.is_active = false THEN 1 END)::NUMERIC / COUNT(*) * 100, 2) as churn_rate
FROM user_modules um
JOIN modules m ON m.id = um.module_id
WHERE m.billing_type = 'monthly'
GROUP BY month
ORDER BY month DESC;
```

### Receita por Módulo

```sql
-- MRR (Monthly Recurring Revenue) por módulo
SELECT
  m.name,
  COUNT(DISTINCT um.user_id) as active_subscribers,
  m.price,
  COUNT(DISTINCT um.user_id) * m.price as mrr
FROM modules m
JOIN user_modules um ON um.module_id = m.id AND um.is_active = true
WHERE m.billing_type = 'monthly'
  AND (um.expires_at IS NULL OR um.expires_at > NOW())
GROUP BY m.id, m.name, m.price
ORDER BY mrr DESC;
```

### Funil de Conversão

```sql
-- Análise do funil
WITH funnel AS (
  SELECT
    COUNT(DISTINCT user_id) as total_users,
    COUNT(DISTINCT CASE WHEN has_viewed_modules THEN user_id END) as viewed_modules,
    COUNT(DISTINCT CASE WHEN has_initiated_checkout THEN user_id END) as initiated_checkout,
    COUNT(DISTINCT CASE WHEN has_completed_purchase THEN user_id END) as completed_purchase
  FROM (
    SELECT
      u.id as user_id,
      EXISTS(SELECT 1 FROM page_views WHERE user_id = u.id AND page LIKE '/modules/%') as has_viewed_modules,
      EXISTS(SELECT 1 FROM purchases WHERE user_id = u.id AND payment_status IN ('pending', 'completed')) as has_initiated_checkout,
      EXISTS(SELECT 1 FROM purchases WHERE user_id = u.id AND payment_status = 'completed') as has_completed_purchase
    FROM users u
  ) t
)
SELECT
  'Total Usuários' as stage,
  total_users as count,
  100.0 as percentage
FROM funnel
UNION ALL
SELECT
  'Visualizaram Módulos',
  viewed_modules,
  ROUND(viewed_modules::NUMERIC / total_users * 100, 2)
FROM funnel
UNION ALL
SELECT
  'Iniciaram Checkout',
  initiated_checkout,
  ROUND(initiated_checkout::NUMERIC / total_users * 100, 2)
FROM funnel
UNION ALL
SELECT
  'Completaram Compra',
  completed_purchase,
  ROUND(completed_purchase::NUMERIC / total_users * 100, 2)
FROM funnel;
```

### Dashboard de Métricas (Frontend)

```jsx
// front-end/src/pages/admin/MetricsDashboard.jsx

import { useState, useEffect } from 'react';
import apiService from '../../services/api';

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState({
    mrr: 0,
    totalRevenue: 0,
    activeUsers: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    const data = await apiService.request('/api/admin/metrics');
    setMetrics(data);
  };

  return (
    <div className="metrics-dashboard">
      <h1 className="text-4xl font-bold mb-8">Métricas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* MRR */}
        <div className="metric-card">
          <h3>MRR</h3>
          <p className="text-3xl font-bold">
            R${metrics.mrr.toLocaleString('pt-BR')}
          </p>
          <span className="text-green-500">+15% vs mês anterior</span>
        </div>

        {/* Receita Total */}
        <div className="metric-card">
          <h3>Receita Total</h3>
          <p className="text-3xl font-bold">
            R${metrics.totalRevenue.toLocaleString('pt-BR')}
          </p>
          <span className="text-gray-500">Lifetime</span>
        </div>

        {/* Usuários Ativos */}
        <div className="metric-card">
          <h3>Usuários Ativos</h3>
          <p className="text-3xl font-bold">
            {metrics.activeUsers}
          </p>
          <span className="text-blue-500">+12% vs mês anterior</span>
        </div>

        {/* Taxa de Conversão */}
        <div className="metric-card">
          <h3>Taxa de Conversão</h3>
          <p className="text-3xl font-bold">
            {metrics.conversionRate.toFixed(1)}%
          </p>
          <span className="text-gray-500">Visitante → Cliente</span>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <RevenueChart />
        <ModulesChart />
      </div>
    </div>
  );
}
```

---

## 📝 Checklist de Implementação

### Backend

- [ ] Criar tabelas (modules, user_modules, bundles, purchases)
- [ ] Popular tabela modules com os 8 módulos
- [ ] Criar middleware CheckModuleAccess
- [ ] Criar ModulesController (GET, POST)
- [ ] Criar ModulesService (findAll, getUserModules, checkAccess)
- [ ] Integrar Stripe/PagSeguro
- [ ] Criar WebhooksController
- [ ] Proteger rotas existentes com CheckModuleAccess
- [ ] Criar seeds para módulos iniciais
- [ ] Testar fluxo completo de compra

### Frontend

- [ ] Criar página Dashboard com grid de módulos
- [ ] Criar componente ModuleCard
- [ ] Criar página de Checkout
- [ ] Integrar com API de módulos
- [ ] Criar página /modules/:code para cada módulo
- [ ] Adicionar verificação de acesso (redirect se não tiver)
- [ ] Criar página de sucesso/erro de pagamento
- [ ] Testar fluxo completo

### Módulos Específicos

- [ ] Job Board (scraper + UI)
- [ ] CNPJ (marketplace de contadores)
- [ ] LinkedIn (templates + consultoria)
- [ ] Aulas Premium (agendamento + Zoom)
- [ ] Conversação (Discord/grupos)
- [ ] Seguros (afiliados)
- [ ] Banco (guia + afiliados Wise)

### Analytics

- [ ] Implementar tracking de eventos
- [ ] Dashboard de métricas admin
- [ ] Queries SQL para relatórios
- [ ] Alertas de churn
- [ ] Análise de LTV por persona

---

## 🚨 Avisos Importantes

### O que NÃO fazer

1. **NÃO desenvolver todos os módulos de uma vez**
   - Comece com 2-3 módulos (Inglês + Vagas)
   - Valide antes de fazer mais

2. **NÃO criar banco digital próprio**
   - Custo: R$10M-50M
   - Compliance impossível
   - Use afiliados (Wise/Remessa Online)

3. **NÃO automatizar conversação no início**
   - Matching em tempo real é muito complexo
   - Comece com sessões agendadas manualmente
   - Automatize só se tiver 100+ alunos

4. **NÃO forçar jornada única**
   - Deixe o usuário escolher
   - Não esconda módulos
   - Transparência total

### O que PRIORIZAR

1. **Sistema de módulos funcionando**
   - Backend + Frontend + Pagamento
   - Isso é a base de tudo

2. **2-3 módulos iniciais**
   - Inglês (já tem)
   - Vagas (fácil de fazer)
   - CNPJ (alto valor agregado)

3. **Validação rápida**
   - 10 clientes pagantes em 3 meses
   - Se funcionar, escale
   - Se não funcionar, ajuste

4. **Receita recorrente**
   - Plano Premium (R$197/mês)
   - Comece com aulas manuais
   - 10-20 assinantes = R$2k-4k/mês

---

## 📞 Próximos Passos

Quando for implementar:

1. **Comece pelo Backend:**
   - Crie as tabelas
   - Implemente ModulesService
   - Configure Stripe

2. **Depois Frontend:**
   - Dashboard com grid
   - Integração com API
   - Checkout

3. **Teste o Fluxo:**
   - Criar conta
   - Ver módulos
   - Comprar módulo
   - Acessar conteúdo

4. **Lance com 2-3 módulos:**
   - Não espere ter tudo pronto
   - Valide a ideia primeiro

5. **Meça Resultados:**
   - Taxa de conversão
   - LTV
   - Churn

6. **Itere:**
   - O que funciona? Faça mais
   - O que não funciona? Remova ou ajuste

---

## 📚 Recursos Úteis

### Documentação
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [NestJS Guards](https://docs.nestjs.com/guards)
- [TypeORM Relations](https://typeorm.io/relations)

### Ferramentas
- Stripe Dashboard (gerenciar pagamentos)
- PostHog (analytics)
- Hotjar (heatmaps)
- Mixpanel (funil de conversão)

### Inspiração
- Duolingo (módulos de idioma)
- Udemy (marketplace de cursos)
- Notion (freemium modular)
- Loom (planos escalonados)

---

**Última atualização:** 27/10/2025
**Versão:** 1.0
**Autor:** Claude + Lucas

---

## 💬 Dúvidas?

Se tiver dúvidas durante a implementação:

1. Revise este documento
2. Consulte a documentação oficial das ferramentas
3. Teste em ambiente de desenvolvimento primeiro
4. Implemente de forma incremental

**Boa sorte com a implementação! 🚀**
