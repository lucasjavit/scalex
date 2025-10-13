-- ============================================
-- CURSO DE INGLÊS - DADOS EM PORTUGUÊS
-- Lições e perguntas com tradução contextual
-- ============================================

-- NOTA: Este arquivo contém lições focadas para falantes de português
-- As perguntas incluem contextos comuns e erros típicos de brasileiros

-- ============================================
-- NÍVEL INICIANTE - Erros Comuns de Brasileiros
-- ============================================

-- Lição 13: Falsos Cognatos (False Friends)
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(13, 'False Friends - Falsos Cognatos', 'Aprenda palavras que parecem português mas têm significado diferente', 'beginner', 'Common false cognates', ARRAY['actually', 'realize', 'pretend', 'library', 'college', 'eventually', 'assist', 'push'])
ON CONFLICT (lesson_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 1,
    'Where do you borrow books? (biblioteca)',
    'I borrow books from the library',
    ARRAY['From the library', 'At the library', 'The library'],
    'Library vs Livraria',
    'easy'
FROM english_lessons WHERE lesson_number = 13
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 2,
    'What does "actually" mean? (na verdade ou atualmente?)',
    'Actually means "na verdade"',
    ARRAY['It means na verdade', 'In fact', 'Na verdade'],
    'Actually vs Atualmente',
    'medium'
FROM english_lessons WHERE lesson_number = 13
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 3,
    'Do you go to university or college?',
    'I go to college',
    ARRAY['College', 'I attend college', 'University'],
    'College vs Colégio',
    'medium'
FROM english_lessons WHERE lesson_number = 13
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 4,
    'Did you realize your mistake? (perceber)',
    'Yes, I realized my mistake',
    ARRAY['Yes, I did', 'Yes, I realized it', 'I realized'],
    'Realize vs Realizar',
    'medium'
FROM english_lessons WHERE lesson_number = 13
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- Lição 14: Artigos (The, A, An)
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(14, 'Articles in English', 'Quando usar "the", "a", "an" ou nenhum artigo', 'beginner', 'Definite and indefinite articles', ARRAY['the', 'a', 'an', 'some', 'any', 'no article'])
ON CONFLICT (lesson_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 1,
    'Do you like coffee? (com ou sem "the"?)',
    'Yes, I like coffee',
    ARRAY['I like coffee', 'Yes, I do', 'I love coffee'],
    'No article for general things',
    'medium'
FROM english_lessons WHERE lesson_number = 14
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 2,
    'Where is the book I gave you?',
    'The book is on the table',
    ARRAY['It''s on the table', 'On the table', 'The book is here'],
    'The for specific things',
    'medium'
FROM english_lessons WHERE lesson_number = 14
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 3,
    'What do you need to write? (uma ou a caneta?)',
    'I need a pen',
    ARRAY['A pen', 'I need a pen to write'],
    'A for any pen',
    'easy'
FROM english_lessons WHERE lesson_number = 14
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 4,
    'Is she an English teacher?',
    'Yes, she is an English teacher',
    ARRAY['Yes, she is', 'Yes, an English teacher', 'Yes'],
    'An before vowel sound',
    'easy'
FROM english_lessons WHERE lesson_number = 14
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- ============================================
-- NÍVEL ELEMENTAR - Preposições Problemáticas
-- ============================================

-- Lição 15: Preposições de Tempo
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(15, 'Prepositions of Time', 'Quando usar IN, ON, AT para tempo (diferente do português)', 'elementary', 'Time prepositions - in/on/at', ARRAY['in the morning', 'on Monday', 'at night', 'at 5 o''clock', 'in January', 'on weekends'])
ON CONFLICT (lesson_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 1,
    'When do you wake up? (use at)',
    'I wake up at seven o''clock',
    ARRAY['At seven', 'At 7 o''clock', 'I wake up at 7'],
    'AT for specific times',
    'medium'
FROM english_lessons WHERE lesson_number = 15
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 2,
    'When is your birthday? (use in)',
    'My birthday is in December',
    ARRAY['In December', 'It''s in December'],
    'IN for months',
    'medium'
FROM english_lessons WHERE lesson_number = 15
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 3,
    'What do you do on Saturdays?',
    'I rest on Saturdays',
    ARRAY['On Saturdays I rest', 'I relax on Saturdays', 'Rest'],
    'ON for days of the week',
    'medium'
FROM english_lessons WHERE lesson_number = 15
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 4,
    'Do you study at night or in the morning?',
    'I study at night',
    ARRAY['At night', 'I study in the morning', 'In the morning'],
    'AT for night, IN for morning/afternoon/evening',
    'hard'
FROM english_lessons WHERE lesson_number = 15
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- Lição 16: Make vs Do (Fazer)
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(16, 'Make or Do?', 'Quando usar MAKE ou DO (ambos significam "fazer")', 'elementary', 'Collocations with make and do', ARRAY['make a mistake', 'do homework', 'make dinner', 'do exercise', 'make a decision', 'do the dishes'])
ON CONFLICT (lesson_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 1,
    'What do you do after school? (homework)',
    'I do my homework',
    ARRAY['I do homework', 'Do homework', 'My homework'],
    'DO homework',
    'medium'
FROM english_lessons WHERE lesson_number = 16
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 2,
    'Who cooks in your house? (use make)',
    'My mother makes dinner',
    ARRAY['My mom makes dinner', 'My mother', 'She makes dinner'],
    'MAKE meals',
    'medium'
FROM english_lessons WHERE lesson_number = 16
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 3,
    'Do you make or do mistakes when speaking English?',
    'I make mistakes',
    ARRAY['I make mistakes when speaking', 'Make mistakes', 'I do'],
    'MAKE mistakes',
    'medium'
FROM english_lessons WHERE lesson_number = 16
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 4,
    'Do you do exercise every day?',
    'Yes, I do exercise every day',
    ARRAY['Yes, I do', 'Yes, every day', 'I exercise daily'],
    'DO exercise',
    'medium'
FROM english_lessons WHERE lesson_number = 16
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- ============================================
-- NÍVEL INTERMEDIÁRIO - Phrasal Verbs
-- ============================================

-- Lição 17: Phrasal Verbs Comuns
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(17, 'Common Phrasal Verbs', 'Verbos com preposições que mudam o significado', 'intermediate', 'Phrasal verbs with different meanings', ARRAY['get up', 'give up', 'look for', 'turn on', 'turn off', 'pick up', 'put on', 'take off'])
ON CONFLICT (lesson_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 1,
    'What time do you get up in the morning?',
    'I get up at six o''clock',
    ARRAY['At six', 'I get up at 6', 'Six o''clock'],
    'GET UP = acordar/levantar',
    'medium'
FROM english_lessons WHERE lesson_number = 17
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 2,
    'What are you looking for?',
    'I am looking for my keys',
    ARRAY['My keys', 'I''m looking for my keys', 'Looking for my keys'],
    'LOOK FOR = procurar',
    'medium'
FROM english_lessons WHERE lesson_number = 17
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 3,
    'Do you ever give up when something is difficult?',
    'No, I never give up',
    ARRAY['No, I don''t give up', 'Never', 'I don''t give up'],
    'GIVE UP = desistir',
    'hard'
FROM english_lessons WHERE lesson_number = 17
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 4,
    'What do you do when you enter a dark room?',
    'I turn on the light',
    ARRAY['Turn on the light', 'I turn the light on', 'Switch on the light'],
    'TURN ON = ligar',
    'medium'
FROM english_lessons WHERE lesson_number = 17
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- Lição 18: Used to vs Be used to
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(18, 'Used to - Different Meanings', 'Diferença entre USED TO e BE USED TO', 'intermediate', 'Used to for past habits vs be used to for familiarity', ARRAY['used to', 'be used to', 'get used to', 'past habits', 'accustomed'])
ON CONFLICT (lesson_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 1,
    'Did you play football when you were a child?',
    'Yes, I used to play football',
    ARRAY['Yes, I used to', 'I used to play', 'Yes, I did'],
    'USED TO for past habits',
    'hard'
FROM english_lessons WHERE lesson_number = 18
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 2,
    'Are you used to waking up early?',
    'Yes, I am used to waking up early',
    ARRAY['Yes, I am', 'Yes, I''m used to it', 'I''m used to it'],
    'BE USED TO for familiarity',
    'hard'
FROM english_lessons WHERE lesson_number = 18
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 3,
    'Where did you use to live?',
    'I used to live in São Paulo',
    ARRAY['In São Paulo', 'I used to live in SP', 'São Paulo'],
    'USED TO in questions',
    'hard'
FROM english_lessons WHERE lesson_number = 18
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- ============================================
-- NÍVEL AVANÇADO - Nuances da Língua
-- ============================================

-- Lição 19: Modal Verbs - Nuances
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(19, 'Modal Verbs and Their Nuances', 'Diferenças sutis entre CAN, COULD, MAY, MIGHT, SHOULD, MUST', 'advanced', 'Modal verbs for permission, possibility, obligation', ARRAY['can', 'could', 'may', 'might', 'should', 'must', 'have to', 'ought to'])
ON CONFLICT (lesson_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 1,
    'Can I use your phone? (informal permission)',
    'Yes, you can use it',
    ARRAY['Yes, you can', 'Yes, of course', 'Sure'],
    'CAN for informal permission',
    'medium'
FROM english_lessons WHERE lesson_number = 19
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 2,
    'May I ask you a question? (formal permission)',
    'Yes, you may',
    ARRAY['Yes, of course', 'Yes, please do', 'Certainly'],
    'MAY for formal permission',
    'hard'
FROM english_lessons WHERE lesson_number = 19
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 3,
    'It might rain tomorrow. What does "might" express?',
    'Might expresses possibility',
    ARRAY['Possibility', 'It''s possible', 'Maybe'],
    'MIGHT for possibility',
    'hard'
FROM english_lessons WHERE lesson_number = 19
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 4,
    'Must you go now, or can you stay?',
    'I must go now',
    ARRAY['I have to go', 'I must leave', 'I need to go'],
    'MUST for strong obligation',
    'hard'
FROM english_lessons WHERE lesson_number = 19
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- Lição 20: Reported Speech (Discurso Indireto)
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(20, 'Reported Speech', 'Como relatar o que outras pessoas disseram', 'advanced', 'Tense backshift in reported speech', ARRAY['said', 'told', 'asked', 'reported', 'according to', 'he said that'])
ON CONFLICT (lesson_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 1,
    'John said: "I am tired". What did John say?',
    'John said he was tired',
    ARRAY['He said he was tired', 'John said that he was tired', 'He was tired'],
    'Backshift: am → was',
    'hard'
FROM english_lessons WHERE lesson_number = 20
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 2,
    'Mary said: "I will come tomorrow". What did Mary say?',
    'Mary said she would come the next day',
    ARRAY['She said she would come', 'Mary said she would come tomorrow', 'She would come'],
    'Backshift: will → would',
    'hard'
FROM english_lessons WHERE lesson_number = 20
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 3,
    'Peter asked: "Where do you live?" What did Peter ask?',
    'Peter asked where I lived',
    ARRAY['He asked where I lived', 'Peter asked me where I lived', 'Where I lived'],
    'Reported questions',
    'hard'
FROM english_lessons WHERE lesson_number = 20
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 4,
    'She told me: "Don''t be late". What did she tell you?',
    'She told me not to be late',
    ARRAY['Not to be late', 'She said not to be late', 'Don''t be late'],
    'Reported commands',
    'hard'
FROM english_lessons WHERE lesson_number = 20
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- ============================================
-- LOG SUCCESS
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✓ Successfully inserted 8 Portuguese-focused lessons with 35+ questions!';
    RAISE NOTICE '✓ Lessons 13-20 specifically designed for Brazilian Portuguese speakers';
    RAISE NOTICE '✓ Total lessons in database: 20 lessons';
    RAISE NOTICE '✓ Focus: False friends, prepositions, phrasal verbs, modals, reported speech';
END $$;
