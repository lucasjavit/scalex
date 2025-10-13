# Correções do Sistema de Revisões Anki

## Problema Identificado
O sistema de revisões do Anki estava mostrando todas as cartas independentemente de estarem marcadas como disponíveis para revisão. As cartas que foram praticadas anteriormente e não deveriam aparecer estavam sendo exibidas.

## Correções Implementadas

### 1. **Método `getDueReviews` Melhorado**
- Adicionada chamada automática para `markReviewsAsDue()` antes de buscar revisões
- Garantia de que apenas cartas realmente devidas sejam retornadas
- Verificação dupla: `isDue: true` E `nextReviewDate <= now`

### 2. **Método `submitDifficulty` Corrigido**
- Atualização correta do campo `isDue` baseado na dificuldade selecionada
- Para "again": `isDue = true` (mostra novamente na sessão)
- Para "hard", "good", "easy": `isDue = false` (não mostra até próxima data)

### 3. **Método `markReviewsAsDue` Otimizado**
- Atualização eficiente de revisões que passaram da data de revisão
- Query otimizada para marcar apenas revisões necessárias

### 4. **Criação Automática de Revisões Iniciais**
- Novo método `createInitialReviews()` para criar entradas de revisão
- Chamado automaticamente quando uma lição é completada
- Garante que todas as perguntas da lição entrem no sistema de revisão

### 5. **Melhorias na Lógica de Criação de Revisões**
- Revisões iniciais criadas com `isDue: true` para disponibilidade imediata
- Revisões subsequentes marcadas como `isDue: false` até próxima data
- Controle preciso do campo `lastReviewedAt`

## Como Funciona Agora

1. **Primeira Vez**: Quando uma lição é completada, todas as perguntas são adicionadas ao sistema de revisão com `isDue: true`

2. **Revisão**: Quando o usuário acessa as revisões, apenas cartas com `isDue: true` e `nextReviewDate <= now` são mostradas

3. **Após Revisão**: Dependendo da dificuldade selecionada:
   - **Again**: Carta fica disponível imediatamente (`isDue: true`)
   - **Hard/Good/Easy**: Carta fica indisponível até próxima data (`isDue: false`)

4. **Atualização Automática**: O sistema marca automaticamente cartas como devidas quando a data de revisão é atingida

## Arquivos Modificados
- `back-end/src/english-course/english-course.service.ts`
- `back-end/test-reviews.js` (script de teste)

## Teste
Execute o script de teste para verificar se as correções estão funcionando:
```bash
cd back-end
node test-reviews.js
```

## Resultado Esperado
- Apenas cartas realmente devidas para revisão aparecem
- Cartas já revisadas não aparecem até a próxima data programada
- Sistema de repetição espaçada funciona corretamente conforme algoritmo Anki
