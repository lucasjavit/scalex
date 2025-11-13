# Database Reset Guide

Este guia explica como resetar o banco de dados completamente, tanto em desenvolvimento quanto em produção.

## Por que resetar o banco?

Resetar o banco é útil quando:
- Você quer garantir que todas as migrations estão aplicadas corretamente
- Houve mudanças estruturais no schema que requerem recriação das tabelas
- Você quer começar com dados limpos (apenas seeds)

## ⚠️ ATENÇÃO

**ISSO VAI DELETAR TODOS OS DADOS DO BANCO!** Use com cuidado em produção.

## Desenvolvimento Local

### Opção 1: Script automatizado (recomendado)

```bash
cd back-end
npm run db:reset
```

Isso vai:
1. Conectar ao PostgreSQL
2. Terminar todas as conexões ativas ao banco `scalex`
3. Dropar o banco `scalex`
4. Criar um novo banco `scalex` vazio

### Opção 2: Manual via psql

```bash
# Conectar ao PostgreSQL
psql -U postgres

# No prompt do psql:
DROP DATABASE scalex;
CREATE DATABASE scalex;
\q
```

### Após resetar o banco

1. **Reinicie o backend**:
   ```bash
   npm run start:dev
   ```

2. **O que acontece automaticamente**:
   - ✅ Migrations são executadas (`main.ts` linhas 18-33)
   - ✅ Tabelas são criadas com schema correto
   - ✅ Seeds rodam automaticamente (`DatabaseInitService`):
     - ATS Platforms (lever, greenhouse, workable, ashby)
     - Aggregators (wellfound, builtin, weworkremotely, remotive, remoteyeah)
     - Popular Companies (93 empresas tech)

3. **Resultado esperado**:
   ```
   ✅ 10 migration(s) executed successfully
   🔧 Initializing database...
   🌱 Running ATS platforms seed...
   ✅ ATS platforms seed completed
   🌱 Running aggregators seed...
   ✅ Aggregators seed completed
   🌱 Running popular companies seed...
   ✅ Popular companies seed completed
   ```

## Produção (Coolify)

### Passo 1: Parar o backend

No painel do Coolify, pare o container do backend para evitar conexões ativas.

### Passo 2: Acessar o banco de dados

Conecte-se ao banco de dados via terminal do Coolify ou psql:

```bash
# Via Coolify terminal (se disponível)
# ou
psql -h <host> -U <user> -d postgres
```

### Passo 3: Resetar o banco

```sql
-- Terminar todas as conexões ativas
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'scalex'
  AND pid <> pg_backend_pid();

-- Dropar e recriar o banco
DROP DATABASE scalex;
CREATE DATABASE scalex;
```

### Passo 4: Reiniciar o backend

No painel do Coolify, reinicie o container do backend.

### Passo 5: Verificar logs

Verifique nos logs do Coolify que:
- ✅ Migrations foram executadas
- ✅ Seeds rodaram com sucesso
- ✅ Backend iniciou sem erros

Exemplo de logs esperados:
```
[Bootstrap] ✅ 10 migration(s) executed successfully
[DatabaseInitService] 🔧 Initializing database...
[DatabaseInitService] ✅ ATS platforms seed completed
[DatabaseInitService] ✅ Aggregators seed completed
[DatabaseInitService] ✅ Popular companies seed completed
[Bootstrap] 🚀 Application is running on: http://localhost:3000
```

## Verificar estado do banco após reset

Após o reset, você pode verificar se tudo está correto:

```bash
cd back-end

# Verificar ordem e integridade das migrations (ANTES de resetar)
npm run migration:verify

# Verificar migrations executadas no banco
npm run migration:show

# Verificar job boards criados
node list-job-boards.js

# Verificar companies criadas
node list-companies.js

# Verificar estado geral
node check-db-state.js
```

Saída esperada:
- **10 job boards**: 4 ATS + 5 agregadores + 1 outro
- **93 companies**: empresas populares de tech
- **108+ scraper configs**: habilitados e prontos

## Troubleshooting

### Erro: "database is being accessed by other users"

Significa que há conexões ativas. Rode:

```sql
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'scalex'
  AND pid <> pg_backend_pid();
```

### Seeds não rodaram automaticamente

Verifique os logs do backend. O `DatabaseInitService` deve aparecer nos logs.

Se não aparecer, pode ser que o módulo não esteja sendo importado corretamente.

### Migrations não rodaram

Verifique que o [main.ts](src/main.ts#L18-L33) tem o código de auto-migration.

Você também pode rodar manualmente:

```bash
npm run migration:run
```

## Fluxo completo de inicialização

Quando o backend inicia pela primeira vez (banco vazio):

1. **Bootstrap** (`main.ts`)
   - Conecta ao banco
   - **Roda migrations automaticamente** (linha 21)
   - Configura CORS, pipes, etc
   - Inicia servidor

2. **DatabaseInitService** (`OnModuleInit`)
   - Roda seed de ATS platforms
   - Roda seed de aggregators
   - Roda seed de popular companies

3. **Cron Jobs** (após 1 minuto)
   - Iniciam scraping automático
   - Verificam job boards e companies
   - Começam a coletar vagas

## Arquivos relacionados

- `reset-database.js` - Script de reset automático
- `src/main.ts` - Auto-execução de migrations
- `src/modules/remote-jobs/services/database-init.service.ts` - Auto-execução de seeds
- `src/migrations/` - Todas as migrations
- `src/modules/remote-jobs/seeds/` - Todos os seeds
