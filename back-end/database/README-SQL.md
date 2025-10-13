# English Course Database - SQL Scripts

Este diretório contém os scripts SQL para configurar e popular o banco de dados do módulo English Course.

## Arquivos Disponíveis

### 1. `init.sql` (OBRIGATÓRIO)
**Descrição**: Script principal que cria toda a estrutura do banco de dados.

**Contém**:
- Tabelas principais (users, addresses)
- Tabelas do English Course (lessons, questions, progress, reviews, answer_history)
- Índices para performance
- Triggers para updated_at
- 3 lições básicas de exemplo

**Quando usar**: Execute primeiro, ao configurar o banco pela primeira vez.

```bash
psql -U postgres -d scalex < init.sql
```

---

### 2. `english-course-sample-data.sql` (OPCIONAL)
**Descrição**: Dados adicionais com 9 lições completas em inglês padrão.

**Contém**:
- **Beginner** (4-5): Numbers, Days and Time
- **Elementary** (6-7): Food/Drinks, Family
- **Intermediate** (8-10): Past Simple, Future with "going to"
- **Advanced** (11-12): Present Perfect, Conditionals

**Total**: 9 lições + ~40 questões

**Quando usar**: Após executar `init.sql`, se quiser conteúdo em inglês geral.

```bash
psql -U postgres -d scalex < english-course-sample-data.sql
```

---

### 3. `english-course-data-pt-br.sql` (OPCIONAL)
**Descrição**: Lições focadas para falantes de português brasileiro.

**Contém**:
- **Beginner** (13-14): False Friends, Articles
- **Elementary** (15-16): Time Prepositions, Make vs Do
- **Intermediate** (17-18): Phrasal Verbs, Used to
- **Advanced** (19-20): Modal Verbs, Reported Speech

**Total**: 8 lições + ~35 questões

**Quando usar**: Após executar `init.sql`, se seu público for brasileiro.

```bash
psql -U postgres -d scalex < english-course-data-pt-br.sql
```

---

## Ordem Recomendada de Execução

### Configuração Completa (Todos os dados)

```bash
# 1. Criar estrutura do banco (OBRIGATÓRIO)
psql -U postgres -d scalex < init.sql

# 2. Adicionar lições gerais (OPCIONAL)
psql -U postgres -d scalex < english-course-sample-data.sql

# 3. Adicionar lições para brasileiros (OPCIONAL)
psql -U postgres -d scalex < english-course-data-pt-br.sql
```

Após executar todos os 3 arquivos, você terá:
- ✅ **20 lições completas**
- ✅ **~80 questões**
- ✅ Cobertura de Beginner até Advanced
- ✅ Conteúdo geral + específico para brasileiros

---

### Configuração Mínima (Apenas básico)

```bash
# Apenas a estrutura + 3 lições de exemplo
psql -U postgres -d scalex < init.sql
```

---

## Estrutura das Tabelas

### `english_lessons`
Armazena informações sobre cada lição.

```sql
- id (UUID)
- lesson_number (INTEGER) - Número sequencial
- title (VARCHAR) - Título da lição
- description (TEXT) - Descrição
- level (VARCHAR) - beginner, elementary, intermediate, advanced
- grammar_focus (TEXT) - Foco gramatical
- vocabulary_focus (TEXT[]) - Array de vocabulário
- is_active (BOOLEAN) - Ativa/Inativa
```

### `english_questions`
Perguntas de cada lição (estilo Método Callan).

```sql
- id (UUID)
- lesson_id (UUID) - Referência à lição
- question_number (INTEGER) - Número da questão
- question_text (TEXT) - Pergunta
- expected_answer (TEXT) - Resposta esperada
- alternative_answers (TEXT[]) - Respostas alternativas aceitas
- grammar_point (VARCHAR) - Ponto gramatical
- difficulty (VARCHAR) - easy, medium, hard
- audio_url (VARCHAR) - URL do áudio (opcional)
```

### `english_user_progress`
Rastreia progresso do usuário por lição.

```sql
- id (UUID)
- user_id (UUID) - Referência ao usuário
- lesson_id (UUID) - Referência à lição
- status (VARCHAR) - not_started, in_progress, completed, needs_review
- correct_answers (INTEGER) - Respostas corretas
- total_attempts (INTEGER) - Total de tentativas
- accuracy_percentage (DECIMAL) - Porcentagem de acertos
- time_spent_minutes (INTEGER) - Tempo gasto
- last_practiced_at (TIMESTAMP) - Última prática
- completed_at (TIMESTAMP) - Data de conclusão
```

### `english_reviews`
Gerencia revisões espaçadas (algoritmo SM-2).

```sql
- id (UUID)
- user_id (UUID) - Referência ao usuário
- lesson_id (UUID) - Referência à lição
- question_id (UUID) - Referência à questão
- review_count (INTEGER) - Contador de revisões
- next_review_date (TIMESTAMP) - Próxima revisão agendada
- interval_days (INTEGER) - Intervalo em dias
- ease_factor (DECIMAL) - Fator de facilidade (1.3-3.0)
- last_reviewed_at (TIMESTAMP) - Última revisão
- is_due (BOOLEAN) - Revisão pendente?
```

### `english_answer_history`
Histórico completo de todas as respostas.

```sql
- id (UUID)
- user_id (UUID) - Referência ao usuário
- question_id (UUID) - Referência à questão
- user_answer (TEXT) - Resposta do usuário
- is_correct (BOOLEAN) - Correto?
- response_time_seconds (INTEGER) - Tempo de resposta
- feedback (TEXT) - Feedback dado
- created_at (TIMESTAMP) - Data/hora
```

---

## Verificando os Dados Inseridos

Após executar os scripts, você pode verificar:

```sql
-- Ver quantas lições foram inseridas
SELECT level, COUNT(*) as total
FROM english_lessons
GROUP BY level
ORDER BY
    CASE level
        WHEN 'beginner' THEN 1
        WHEN 'elementary' THEN 2
        WHEN 'intermediate' THEN 3
        WHEN 'advanced' THEN 4
    END;

-- Ver todas as lições ordenadas
SELECT lesson_number, title, level,
       (SELECT COUNT(*) FROM english_questions WHERE lesson_id = english_lessons.id) as num_questions
FROM english_lessons
ORDER BY lesson_number;

-- Ver questões de uma lição específica
SELECT question_number, question_text, expected_answer, difficulty
FROM english_questions
WHERE lesson_id = (SELECT id FROM english_lessons WHERE lesson_number = 1)
ORDER BY question_number;
```

---

## Adicionando Suas Próprias Lições

### Criar uma Nova Lição

```sql
INSERT INTO english_lessons (
    lesson_number,
    title,
    description,
    level,
    grammar_focus,
    vocabulary_focus
) VALUES (
    21,
    'Your Lesson Title',
    'Description of the lesson',
    'intermediate',
    'Grammar focus here',
    ARRAY['word1', 'word2', 'word3']
);
```

### Adicionar Questões à Lição

```sql
INSERT INTO english_questions (
    lesson_id,
    question_number,
    question_text,
    expected_answer,
    alternative_answers,
    grammar_point,
    difficulty
) VALUES (
    (SELECT id FROM english_lessons WHERE lesson_number = 21),
    1,
    'Your question here?',
    'Expected answer',
    ARRAY['Alternative 1', 'Alternative 2'],
    'Grammar point being tested',
    'medium'
);
```

---

## Resetando os Dados

### Deletar Todas as Lições e Questões

```sql
-- Isso também deletará automaticamente:
-- - Todas as questões (CASCADE)
-- - Todo o progresso dos usuários (CASCADE)
-- - Todas as revisões (CASCADE)
-- - Todo o histórico de respostas (CASCADE)

DELETE FROM english_lessons;
```

### Resetar Apenas o Progresso de um Usuário

```sql
-- Substitua 'user-uuid-here' pelo UUID do usuário
DELETE FROM english_user_progress WHERE user_id = 'user-uuid-here';
DELETE FROM english_reviews WHERE user_id = 'user-uuid-here';
DELETE FROM english_answer_history WHERE user_id = 'user-uuid-here';
```

---

## Troubleshooting

### Erro: "relation already exists"
**Solução**: As tabelas já foram criadas. Execute apenas os arquivos de dados.

### Erro: "duplicate key value violates unique constraint"
**Solução**: Os dados já foram inseridos. Não é necessário executar novamente.

### Erro: "permission denied"
**Solução**: Certifique-se de estar usando um usuário com permissões adequadas:
```bash
psql -U postgres -d scalex < arquivo.sql
```

### Erro: "database does not exist"
**Solução**: Crie o banco de dados primeiro:
```sql
CREATE DATABASE scalex;
```

---

## Backup e Restore

### Fazer Backup Apenas das Lições

```bash
pg_dump -U postgres -d scalex \
  -t english_lessons \
  -t english_questions \
  --data-only \
  > backup-lessons.sql
```

### Restaurar Backup

```bash
psql -U postgres -d scalex < backup-lessons.sql
```

---

## Informações Adicionais

- **Encoding**: UTF-8
- **Collation**: Configurado para suportar português e inglês
- **Constraints**: Todos os relacionamentos usam CASCADE DELETE
- **Indexes**: Criados automaticamente para melhor performance
- **Triggers**: Auto-atualização de `updated_at` em todas as tabelas

Para mais informações sobre o módulo, consulte:
- [README do Módulo](../../front-end/src/modules/english-course/README.md)
- [Documentação da API](../src/english-course/)
