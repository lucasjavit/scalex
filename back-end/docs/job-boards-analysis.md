# Análise Completa de Job Boards - APIs vs Scraping

**Data**: 2025-11-07
**Objetivo**: Categorizar plataformas de vagas por método de extração de dados

---

## 🟢 COM API PÚBLICA (Funcionam Melhor)

### 1. **Wellfound.com** (ex-AngelList) ✅
- **API**: `https://wellfound.com/api/v2/jobs`
- **Documentação**: Pública e bem documentada
- **Dados**: JSON estruturado, fácil de consumir
- **Filtros**: Remote, location, skills, company size
- **Status**: ✅ **Funcionando no nosso sistema** (25 vagas)
- **Rate Limit**: Não documentado, mas liberal
- **Autenticação**: Não requerida para endpoints públicos

### 2. **Built In** ✅
- **API**: `https://builtin.com/api/jobs`
- **Documentação**: API REST pública
- **Dados**: JSON com filtros (remote, location, skills)
- **Parâmetros**: `remote=true`, `per_page=100`
- **Status**: ✅ **Funcionando no nosso sistema** (25 vagas)
- **Qualidade**: Dados muito bem estruturados
- **Foco**: Tech jobs em startups e scale-ups

### 3. **Greenhouse.io** ⚠️ (API limitada)
- **API**: `https://boards-api.greenhouse.io/v1/boards/COMPANY/jobs`
- **Problema**: Precisa da URL específica da empresa
- **Exemplo**: `https://boards-api.greenhouse.io/v1/boards/deel/jobs`
- **Limitação**: **Não é um agregador** - cada empresa tem endpoint próprio
- **Dados**: JSON muito bem estruturado
- **Uso Recomendado**: Apenas para empresas específicas que sabemos usar Greenhouse
- **Status Atual**: ❌ Empresas no BD retornando 404

### 4. **Lever.co** ⚠️ (API limitada)
- **API**: `https://api.lever.co/v0/postings/COMPANY?mode=json`
- **Problema**: Precisa do slug da empresa
- **Exemplo**: `https://api.lever.co/v0/postings/netflix?mode=json`
- **Limitação**: **Não é um agregador** - cada empresa tem endpoint próprio
- **Dados**: JSON excelente, muito detalhado
- **Uso Recomendado**: Apenas para empresas específicas que sabemos usar Lever
- **Status Atual**: ❌ Empresas no BD retornando 404

---

## 🟡 COM JSON-LD (Schema.org) - Scraping Estruturado

Estas plataformas não têm API pública, mas usam **JSON-LD** (dados estruturados no HTML conforme Schema.org), o que facilita muito o scraping.

### 5. **Workable.com** 🟡
- **Método**: JSON-LD (Schema.org JobPosting)
- **URL Pattern**: `https://apply.workable.com/COMPANY/`
- **Qualidade**: Dados muito bem estruturados
- **Problema**: Cada empresa tem sua página própria
- **Tipo**: ATS (Applicant Tracking System)
- **Uso**: Não é agregador

### 6. **RemoteRocketship.com** 🟡 ✅ RECOMENDADO
- **Método**: JSON-LD + HTML
- **URL**: `https://www.remoterocketship.com`
- **Qualidade**: Agregador com JSON-LD bem estruturado
- **Potencial**: ✅ **Bom para adicionar**
- **Foco**: Remote jobs curados manualmente
- **Tipo**: Agregador

### 7. **SmartRecruiters.com** 🟡
- **Método**: JSON-LD
- **URL Pattern**: `https://jobs.smartrecruiters.com/COMPANY`
- **Qualidade**: JSON-LD bem estruturado
- **Problema**: Por empresa, não agregador
- **Tipo**: ATS

### 8. **Teamtailor.com** 🟡
- **Método**: JSON-LD
- **URL Pattern**: `https://career.teamtailor.com/COMPANY`
- **Qualidade**: Excelente JSON-LD
- **Problema**: Por empresa
- **Tipo**: ATS

### 9. **Homerun.co** 🟡
- **Método**: JSON-LD
- **URL Pattern**: `https://COMPANY.homerun.co`
- **Qualidade**: Bom JSON-LD
- **Problema**: Por empresa
- **Tipo**: ATS

### 10. **RemoteYeah.com** 🟡 ✅ (JÁ TEMOS)
- **Método**: JSON-LD muito bem estruturado
- **URL**: `https://remoteyeah.com`
- **Status**: ✅ **Funcionando no nosso sistema** (25 vagas)
- **Tipo**: Agregador

---

## 🔴 SCRAPING COMPLEXO (HTML Parsing)

Estas plataformas **NÃO** têm API e **NÃO** usam JSON-LD (ou usam mal). Requerem scraping HTML complexo.

### 11. **Work at a Startup** (YCombinator) 🔴 ⚠️ RECOMENDADO
- **URL**: `https://www.workatastartup.com/jobs`
- **Método**: HTML scraping
- **Dificuldade**: Média (estrutura relativamente limpa)
- **Potencial**: ✅ **Vale a pena** (vagas de startups YC)
- **Qualidade**: Vagas de alta qualidade
- **Foco**: Startups do Y Combinator
- **Status Atual**: Habilitado mas precisa implementação

### 12. **Glassdoor.com** 🔴❌ NÃO RECOMENDADO
- **Método**: HTML scraping + proteção anti-bot
- **Dificuldade**: **MUITO ALTA**
- **Problemas**:
  - Cloudflare protection
  - Captcha frequente
  - Login necessário para maioria das vagas
  - JavaScript rendering obrigatório
- **Recomendação**: ❌ **Não vale a pena**
- **Alternativa**: Usar agregadores que já coletam do Glassdoor

### 13. **ADP.com** 🔴❌ NÃO RELEVANTE
- **Tipo**: ATS corporativo (não é job board)
- **Método**: Cada empresa tem instância própria
- **URL Pattern**: Varia muito
- **Recomendação**: ❌ **Não é útil para agregação**

### 14. **Rippling.com** 🔴❌ NÃO RELEVANTE
- **Tipo**: HR software (não job board público)
- **Recomendação**: ❌ **Não tem vagas públicas**

### 15. **Gusto.com** 🔴❌ NÃO RELEVANTE
- **Tipo**: Payroll software (não job board)
- **Recomendação**: ❌ **Não é relevante**

---

## 🔴 ATS PLATFORMS (Não são Agregadores)

Estas são plataformas que **empresas usam internamente**. Cada empresa tem sua própria página. **Não servem como agregadores**.

### 16. **Breezy.hr**
- **URL Pattern**: `https://COMPANY.breezy.hr`
- **Método**: JSON-LD por empresa
- **Tipo**: ATS

### 17. **Recruitee.com**
- **URL Pattern**: `https://COMPANY.recruitee.com`
- **Método**: JSON-LD por empresa
- **Tipo**: ATS

### 18. **Pinpoint HQ** (pinpointhq.com)
- **URL Pattern**: `https://COMPANY.pinpointhq.com`
- **Método**: JSON-LD por empresa
- **Tipo**: ATS

### 19. **iCIMS**
- **URL Pattern**: `https://careers.icims.com/COMPANY`
- **Método**: HTML scraping complexo
- **Tipo**: ATS enterprise

### 20. **Jobvite**
- **URL Pattern**: `https://jobs.jobvite.com/COMPANY`
- **Método**: HTML scraping
- **Tipo**: ATS

### 21. **Dover.io**
- **Tipo**: Plataforma de recrutamento (não job board)
- **Uso**: Interno para recruiters

### 22. **Keka.com**
- **Tipo**: HR software (não job board)

### 23. **CareerPuck.com**
- **Tipo**: ATS pequeno
- **Popularidade**: Baixa

### 24. **Gem.com**
- **Tipo**: Recruiting CRM (não job board)

### 25. **Trakstar.com**
- **Tipo**: ATS corporativo

### 26. **CatsOne.com**
- **Tipo**: ATS antigo
- **Popularidade**: Baixa

### 27. **ApplyToJob.com**
- **Tipo**: ATS genérico
- **Popularidade**: Baixa

---

## 🤔 CASO ESPECIAL

### 28. **Notion.site** 🤔
- **Tipo**: Algumas empresas criam páginas de vagas no Notion
- **Problema**: Cada página tem estrutura completamente diferente
- **Método**: Impossível criar scraper genérico
- **Recomendação**: ❌ **Impossível padronizar**

---

## 🎯 RECOMENDAÇÃO FINAL

### ✅ MANTER/ADICIONAR (Agregadores que valem a pena)

#### JÁ IMPLEMENTADOS:
1. ✅ **Wellfound** - API pública (25 vagas funcionando)
2. ✅ **Built In** - API pública (25 vagas funcionando)
3. ✅ **RemoteYeah** - JSON-LD (25 vagas funcionando)

#### ADICIONAR (Prioridade Alta):
4. 🆕 **RemoteOK** - `https://remoteok.com`
   - **API**: `https://remoteok.com/api` ✅
   - **Método**: JSON API pública
   - **Qualidade**: Excelente, muito popular

5. 🆕 **We Work Remotely** - `https://weworkremotely.com`
   - **Método**: JSON-LD + RSS feed
   - **Qualidade**: Curadoria manual, alta qualidade
   - **Popularidade**: #1 em remote jobs

6. 🆕 **Remote.co** - `https://remote.co/remote-jobs`
   - **Método**: JSON-LD
   - **Qualidade**: Curadoria manual
   - **Foco**: Remote-first companies

7. 🆕 **Himalayas** - `https://himalayas.app/jobs`
   - **Método**: JSON-LD
   - **Qualidade**: Moderna, bem estruturada
   - **Foco**: Remote tech jobs

8. 🆕 **JustRemote** - `https://justremote.co`
   - **Método**: JSON-LD
   - **Qualidade**: Boa curadoria
   - **Foco**: Remote jobs worldwide

#### ADICIONAR (Prioridade Média):
9. 🆕 **RemoteRocketship** - `https://www.remoterocketship.com`
   - **Método**: JSON-LD
   - **Status**: Já está no BD mas desabilitado

10. 🆕 **Work at a Startup** - `https://www.workatastartup.com/jobs`
    - **Método**: HTML scraping
    - **Status**: Já está no BD e habilitado, precisa implementação

---

### ❌ REMOVER/DESABILITAR

#### Empresas Individuais (41 total):
- **Todas as URLs Lever company-specific** (25 empresas)
  - binance, stripe, netflix, uber, reddit, etc.
  - Motivo: URLs retornando 404

- **Todas as URLs Greenhouse company-specific** (16 empresas)
  - nubank, deel, airbnb, spotify, slack, etc.
  - Motivo: URLs retornando 404

#### ATS Platforms (não são agregadores):
- Breezy, Recruitee, iCIMS, Jobvite, Pinpoint
- SmartRecruiters, Teamtailor, Homerun
- Motivo: Cada empresa tem página própria, não servem como agregadores

#### Não Relevantes:
- **Glassdoor** - Proteção anti-bot muito forte
- **HR Software** (Rippling, Gusto, Keka, ADP) - Não têm vagas públicas
- **Notion** - Impossível padronizar

---

## 📊 RESUMO ESTATÍSTICO ATUAL

### Database Status:
- **Total no BD**: 73 job boards
- **Habilitados**: 44 (60%)
- **Funcionando**: 3 (7% dos habilitados) ❌ PROBLEMA!
- **Com 404**: 41 (93% dos habilitados) ❌ PROBLEMA!
- **Desabilitados**: 29 (40%)

### Resultados Atuais:
- **Total de vagas**: 75
- **RemoteYeah**: 25 vagas ✅
- **Built In**: 25 vagas ✅
- **Wellfound**: 25 vagas ✅
- **Outros 41**: 0 vagas ❌

---

## 🔄 PLANO DE AÇÃO

### 1. DESABILITAR (41 plataformas)
Criar migration para desabilitar:
- 25 empresas Lever individuais
- 16 empresas Greenhouse individuais

### 2. ADICIONAR (6-10 agregadores)
Prioridade alta:
- RemoteOK (API)
- We Work Remotely (JSON-LD)
- Remote.co (JSON-LD)
- Himalayas (JSON-LD)
- JustRemote (JSON-LD)

Prioridade média:
- RemoteRocketship (já no BD, reabilitar)
- Work at a Startup (implementar scraper)

### 3. IMPLEMENTAR
- Sistema de remoção de duplicatas
- Rate limiting para APIs
- Cache de resultados
- Monitoramento de health dos scrapers

---

## 📝 NOTAS TÉCNICAS

### JSON-LD vs API vs HTML Scraping

**API (Melhor)**:
- ✅ Dados estruturados e confiáveis
- ✅ Performance alta
- ✅ Fácil manutenção
- ❌ Rate limits
- ❌ Requer autenticação às vezes

**JSON-LD (Bom)**:
- ✅ Dados bem estruturados (Schema.org)
- ✅ Relativamente estável
- ✅ Não requer autenticação
- ❌ Depende de HTML parsing
- ❌ Pode mudar sem aviso

**HTML Scraping (Pior)**:
- ❌ Frágil (quebra fácil)
- ❌ Difícil manutenção
- ❌ Performance baixa
- ❌ Pode ser bloqueado
- ✅ Funciona quando não há alternativa

### Estratégia de Scraping

1. **Tentar API primeiro** (se disponível)
2. **Fallback para JSON-LD** (se API falhar)
3. **Último recurso: HTML scraping**

### Anti-bot Detection

Plataformas com proteção forte:
- Glassdoor (Cloudflare + Captcha)
- LinkedIn (Login obrigatório)
- Indeed (Rate limiting agressivo)

**Recomendação**: Evitar estas plataformas e focar em agregadores menores que são mais permissivos.

---

## 🔗 REFERÊNCIAS

- [Schema.org JobPosting](https://schema.org/JobPosting)
- [RemoteOK API Docs](https://remoteok.com/api)
- [Lever API Docs](https://github.com/lever/postings-api)
- [Greenhouse API Docs](https://developers.greenhouse.io/job-board.html)
- [Job na Gringa](https://www.jobnagringa.com.br/) - Referência de curadoria

---

**Última atualização**: 2025-11-07
**Autor**: Análise técnica para ScaleX Remote Jobs
