# English Course Module - Callan Method Style

Este módulo implementa um sistema de aprendizado de inglês inspirado no Método Callan, com sistema de revisão espaçada (spaced repetition) similar ao Anki.

## Características Principais

### 1. Sistema de Lições
- Lições organizadas por nível (beginner, elementary, intermediate, advanced)
- Cada lição contém múltiplas perguntas para prática rápida
- Foco em gramática e vocabulário específicos
- Rastreamento de progresso individual por lição

### 2. Método Callan
- Perguntas e respostas rápidas
- Prática de repetição intensiva
- Feedback imediato após cada resposta
- Múltiplas respostas alternativas aceitas

### 3. Sistema de Revisão Espaçada (Spaced Repetition)
- Algoritmo SM-2 para agendamento de revisões
- Revisões automáticas baseadas em desempenho
- Fatores de facilidade ajustáveis (1.30 - 3.00)
- Intervalos crescentes para retenção de longo prazo

### 4. Rastreamento de Progresso
- Estatísticas detalhadas de desempenho
- Histórico completo de respostas
- Porcentagem de acurácia por lição
- Tempo gasto em cada lição

## Estrutura do Código

### Backend (NestJS + TypeORM)

#### Entidades
- **Lesson**: Contém informações sobre cada lição
- **Question**: Perguntas de cada lição com respostas esperadas
- **UserProgress**: Rastreia o progresso do usuário em cada lição
- **Review**: Gerencia o agendamento de revisões (spaced repetition)
- **AnswerHistory**: Histórico completo de todas as respostas

#### Endpoints Principais

##### Lições
- `GET /english-course/lessons` - Lista todas as lições (filtro opcional por nível)
- `GET /english-course/lessons/:id` - Detalhes de uma lição
- `POST /english-course/lessons` - Criar nova lição
- `PATCH /english-course/lessons/:id` - Atualizar lição
- `DELETE /english-course/lessons/:id` - Remover lição

##### Questões
- `GET /english-course/lessons/:lessonId/questions` - Questões de uma lição
- `POST /english-course/questions` - Criar nova questão
- `PATCH /english-course/questions/:id` - Atualizar questão
- `DELETE /english-course/questions/:id` - Remover questão

##### Progresso e Prática
- `GET /english-course/users/:userId/progress` - Progresso do usuário
- `GET /english-course/users/:userId/lessons/:lessonId/progress` - Progresso em lição específica
- `POST /english-course/users/:userId/lessons/:lessonId/submit-answer` - Submeter resposta

##### Revisões
- `GET /english-course/users/:userId/reviews/due` - Revisões pendentes
- `POST /english-course/reviews/mark-due` - Marcar revisões como pendentes

##### Estatísticas
- `GET /english-course/users/:userId/statistics` - Estatísticas gerais
- `GET /english-course/users/:userId/answer-history` - Histórico de respostas

### Frontend (React)

#### Componentes
- **LessonCard**: Card de apresentação de lição com progresso
- **QuestionCard**: Card para responder perguntas
- **FeedbackModal**: Modal de feedback após resposta
- **ProgressStats**: Widget de estatísticas gerais

#### Páginas
- **Dashboard**: Visão geral de todas as lições e progresso
- **Practice**: Página de prática de uma lição específica
- **Review**: Página de revisão de questões agendadas
- **Progress**: Visualização detalhada do progresso em uma lição

## Como Usar

### 1. Configurar Banco de Dados
Execute o script SQL em `back-end/database/init.sql` para criar as tabelas necessárias:

```bash
psql -U seu_usuario -d seu_banco < back-end/database/init.sql
```

### 2. Iniciar o Backend
```bash
cd back-end
npm install
npm run start:dev
```

### 3. Iniciar o Frontend
```bash
cd front-end
npm install
npm run dev
```

### 4. Acessar o Módulo
- Faça login na aplicação
- Clique em "English Course" na navegação
- Comece a praticar!

## Dados de Exemplo

O script SQL já inclui 3 lições de exemplo com várias questões:

1. **Lesson 1**: Introduction to Basic Questions (Beginner)
2. **Lesson 2**: Actions and Present Continuous (Beginner)
3. **Lesson 3**: Prepositions of Place (Elementary)

## Sistema de Revisão (Spaced Repetition)

O sistema usa o algoritmo SM-2 modificado:

- **Primeira revisão**: 1 dia depois
- **Segunda revisão**: 6 dias depois
- **Revisões subsequentes**: Intervalo multiplicado pelo fator de facilidade

### Fator de Facilidade
- Começa em 2.5
- Aumenta +0.1 para respostas corretas (máx: 3.0)
- Diminui -0.2 para respostas incorretas (mín: 1.3)
- Respostas incorretas resetam o intervalo para 1 dia

## Adicionando Novas Lições

### Via API (Recomendado)
```javascript
const newLesson = {
  lessonNumber: 4,
  title: "Past Simple",
  description: "Learn to talk about past events",
  level: "elementary",
  grammarFocus: "Past Simple - regular and irregular verbs",
  vocabularyFocus: ["yesterday", "last week", "ago", "went", "saw", "did"]
};

await apiService.createLesson(newLesson);
```

### Via SQL
```sql
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus)
VALUES (4, 'Past Simple', 'Learn to talk about past events', 'elementary',
        'Past Simple - regular and irregular verbs',
        ARRAY['yesterday', 'last week', 'ago', 'went', 'saw', 'did']);
```

## Personalização

### Ajustar Critério de Conclusão
No arquivo `english-course.service.ts`, linha ~157:

```typescript
// Auto-complete if accuracy is high enough
if (progress.accuracyPercentage >= 80 && progress.totalAttempts >= 10) {
  progress.status = ProgressStatus.COMPLETED;
  progress.completedAt = new Date();
}
```

Modifique os valores `80` (porcentagem) e `10` (tentativas mínimas) conforme necessário.

### Ajustar Algoritmo de Revisão
No arquivo `english-course.service.ts`, método `updateReviewSchedule`:

```typescript
if (review.reviewCount === 1) {
  review.intervalDays = 1;  // Primeira revisão
} else if (review.reviewCount === 2) {
  review.intervalDays = 6;  // Segunda revisão
} else {
  review.intervalDays = Math.round(review.intervalDays * review.easeFactor);
}
```

## Melhorias Futuras

- [ ] Suporte para áudio nas questões
- [ ] Prática de pronúncia com reconhecimento de voz
- [ ] Sistema de conquistas e gamificação
- [ ] Modo de competição entre usuários
- [ ] Exportação de progresso
- [ ] Integração com dicionário
- [ ] Exercícios de escuta
- [ ] Conversação com IA

## Tecnologias Utilizadas

- **Backend**: NestJS, TypeORM, PostgreSQL
- **Frontend**: React, React Router, Bootstrap
- **Algoritmo**: SM-2 (SuperMemo 2) para spaced repetition
- **Inspiração**: Método Callan + Sistema Anki

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório do projeto.
