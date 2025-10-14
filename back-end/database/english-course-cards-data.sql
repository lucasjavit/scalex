-- English Course Cards Data
-- Front/Back card system with English phrases and Portuguese translations

-- Clear existing data
DELETE FROM english_answer_history;
DELETE FROM english_reviews;
DELETE FROM english_user_progress;
DELETE FROM english_questions;
DELETE FROM english_lessons;

-- Reset sequences
-- (No sequences to reset for UUID primary keys)

-- ============================================
-- LESSONS DATA
-- ============================================

-- Lesson 1: Basic Greetings
INSERT INTO english_lessons (id, lesson_number, title, description, level, grammar_focus, vocabulary_focus, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1, 'Basic Greetings', 'Learn essential greetings and polite expressions', 'beginner', 'Present tense, basic verbs', ARRAY['greetings', 'polite expressions', 'introductions'], true);

-- Lesson 2: Numbers and Time
INSERT INTO english_lessons (id, lesson_number, title, description, level, grammar_focus, vocabulary_focus, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440002', 2, 'Numbers and Time', 'Master numbers, time expressions, and basic counting', 'beginner', 'Numbers, time expressions', ARRAY['numbers', 'time', 'counting'], true);

-- Lesson 3: Family and Relationships
INSERT INTO english_lessons (id, lesson_number, title, description, level, grammar_focus, vocabulary_focus, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440003', 3, 'Family and Relationships', 'Learn family members and relationship vocabulary', 'beginner', 'Possessive adjectives, family vocabulary', ARRAY['family', 'relationships', 'possessive'], true);

-- ============================================
-- CARDS DATA - LESSON 1: Basic Greetings
-- ============================================

-- Card 1
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 1, 'Hello', 'Olá', 'Greetings', 'easy');

-- Card 2
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 2, 'Good morning', 'Bom dia', 'Greetings', 'easy');

-- Card 3
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 3, 'Good afternoon', 'Boa tarde', 'Greetings', 'easy');

-- Card 4
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 4, 'Good evening', 'Boa noite', 'Greetings', 'easy');

-- Card 5
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 5, 'How are you?', 'Como você está?', 'Questions', 'medium');

-- Card 6
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 6, 'I am fine, thank you', 'Estou bem, obrigado', 'Responses', 'medium');

-- Card 7
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 7, 'Nice to meet you', 'Prazer em conhecê-lo', 'Introductions', 'medium');

-- Card 8
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 8, 'What is your name?', 'Qual é o seu nome?', 'Questions', 'medium');

-- Card 9
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', 9, 'My name is John', 'Meu nome é John', 'Introductions', 'medium');

-- Card 10
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 10, 'See you later', 'Até mais tarde', 'Farewells', 'easy');

-- ============================================
-- CARDS DATA - LESSON 2: Numbers and Time
-- ============================================

-- Card 1
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 1, 'One', 'Um', 'Numbers', 'easy');

-- Card 2
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 2, 'Two', 'Dois', 'Numbers', 'easy');

-- Card 3
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 3, 'Three', 'Três', 'Numbers', 'easy');

-- Card 4
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', 4, 'Ten', 'Dez', 'Numbers', 'easy');

-- Card 5
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440002', 5, 'What time is it?', 'Que horas são?', 'Time questions', 'medium');

-- Card 6
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440002', 6, 'It is nine o''clock', 'São nove horas', 'Time expressions', 'medium');

-- Card 7
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440002', 7, 'Half past two', 'Duas e meia', 'Time expressions', 'medium');

-- Card 8
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440002', 8, 'Quarter to five', 'Quinze para as cinco', 'Time expressions', 'hard');

-- Card 9
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440002', 9, 'How old are you?', 'Quantos anos você tem?', 'Age questions', 'medium');

-- Card 10
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440002', 10, 'I am twenty-five years old', 'Eu tenho vinte e cinco anos', 'Age responses', 'medium');

-- ============================================
-- CARDS DATA - LESSON 3: Family and Relationships
-- ============================================

-- Card 1
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440003', 1, 'Mother', 'Mãe', 'Family members', 'easy');

-- Card 2
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440003', 2, 'Father', 'Pai', 'Family members', 'easy');

-- Card 3
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440003', 3, 'Sister', 'Irmã', 'Family members', 'easy');

-- Card 4
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440003', 4, 'Brother', 'Irmão', 'Family members', 'easy');

-- Card 5
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440003', 5, 'Grandmother', 'Avó', 'Family members', 'medium');

-- Card 6
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440003', 6, 'Grandfather', 'Avô', 'Family members', 'medium');

-- Card 7
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440003', 7, 'Do you have any siblings?', 'Você tem irmãos?', 'Family questions', 'medium');

-- Card 8
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440003', 8, 'I have two sisters', 'Eu tenho duas irmãs', 'Family responses', 'medium');

-- Card 9
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440003', 9, 'My family is small', 'Minha família é pequena', 'Family descriptions', 'medium');

-- Card 10
INSERT INTO english_questions (id, lesson_id, question_number, front_text, back_text, grammar_point, difficulty) VALUES
('660e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440003', 10, 'I love my family', 'Eu amo minha família', 'Family expressions', 'easy');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check lessons
SELECT 
    lesson_number,
    title,
    level,
    (SELECT COUNT(*) FROM english_questions WHERE lesson_id = l.id) as card_count
FROM english_lessons l
ORDER BY lesson_number;

-- Check cards for lesson 1
SELECT 
    question_number,
    front_text,
    back_text,
    difficulty
FROM english_questions 
WHERE lesson_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY question_number;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'English Course Cards Data loaded successfully!';
    RAISE NOTICE 'Total lessons: %', (SELECT COUNT(*) FROM english_lessons);
    RAISE NOTICE 'Total cards: %', (SELECT COUNT(*) FROM english_questions);
    RAISE NOTICE 'Cards are now in front/back format with English phrases and Portuguese translations.';
END $$;
