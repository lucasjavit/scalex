-- ============================================
-- ENGLISH COURSE - BASIC DATA
-- Insert basic lessons and questions (originally in init.sql)
-- ============================================

-- Insert basic lessons
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(1, 'Introduction to Basic Questions', 'Learn to answer basic questions about yourself and your surroundings', 'beginner', 'Present Simple - Questions with "What", "Where", "Who"', ARRAY['pen', 'book', 'table', 'chair', 'room', 'wall', 'door', 'window']),
(2, 'Actions and Present Continuous', 'Practice describing actions happening now', 'beginner', 'Present Continuous - "What are you doing?"', ARRAY['standing', 'sitting', 'walking', 'talking', 'writing', 'reading', 'opening', 'closing']),
(3, 'Prepositions of Place', 'Learn to describe location and position', 'elementary', 'Prepositions - in, on, under, behind, in front of', ARRAY['on the table', 'in the room', 'under the chair', 'behind the door', 'next to'])
ON CONFLICT (lesson_number) DO NOTHING;

-- Insert sample questions for Lesson 1
INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id,
    1,
    'What is this?',
    'It''s a pen',
    ARRAY['That''s a pen', 'It is a pen', 'This is a pen'],
    'Demonstrative pronouns with "to be"',
    'easy'
FROM english_lessons WHERE lesson_number = 1
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id,
    2,
    'Is this a book?',
    'Yes, it''s a book',
    ARRAY['Yes, it is', 'Yes, that''s a book', 'Yes, this is a book'],
    'Yes/No questions with "to be"',
    'easy'
FROM english_lessons WHERE lesson_number = 1
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id,
    3,
    'Where is the book?',
    'The book is on the table',
    ARRAY['It''s on the table', 'On the table'],
    'Questions with "Where"',
    'medium'
FROM english_lessons WHERE lesson_number = 1
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id,
    4,
    'What color is the pen?',
    'The pen is blue',
    ARRAY['It''s blue', 'Blue'],
    'Questions about color',
    'easy'
FROM english_lessons WHERE lesson_number = 1
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- Insert sample questions for Lesson 2
INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id,
    1,
    'What are you doing?',
    'I''m reading a book',
    ARRAY['I am reading', 'I''m reading'],
    'Present Continuous',
    'medium'
FROM english_lessons WHERE lesson_number = 2
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id,
    2,
    'Are you sitting or standing?',
    'I''m sitting',
    ARRAY['I am sitting', 'Sitting'],
    'Alternative questions with Present Continuous',
    'medium'
FROM english_lessons WHERE lesson_number = 2
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- Log successful insertion
DO $$
BEGIN
    RAISE NOTICE 'Basic English Course data inserted successfully!';
    RAISE NOTICE 'Added 3 basic lessons with sample questions.';
END $$;
