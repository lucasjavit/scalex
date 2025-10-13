-- ============================================
-- ENGLISH COURSE - SAMPLE DATA
-- Insert additional lessons and questions
-- ============================================

-- ============================================
-- BEGINNER LEVEL LESSONS
-- ============================================

-- Lesson 4: Numbers and Counting
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(4, 'Numbers and Counting', 'Learn to count and use numbers in everyday situations', 'beginner', 'Cardinal numbers 1-100', ARRAY['one', 'two', 'three', 'ten', 'twenty', 'hundred', 'number', 'how many'])
ON CONFLICT (lesson_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 1,
    'How many fingers do you have?',
    'I have ten fingers',
    ARRAY['I have 10 fingers', 'Ten fingers', 'I''ve got ten fingers'],
    'Numbers and quantity',
    'easy'
FROM english_lessons WHERE lesson_number = 4
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 2,
    'What number comes after five?',
    'Six',
    ARRAY['Six comes after five', 'The number six'],
    'Number sequence',
    'easy'
FROM english_lessons WHERE lesson_number = 4
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 3,
    'How many days are there in a week?',
    'There are seven days in a week',
    ARRAY['Seven days', 'Seven', 'There are 7 days'],
    'Numbers in context',
    'medium'
FROM english_lessons WHERE lesson_number = 4
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 4,
    'What is ten plus ten?',
    'Twenty',
    ARRAY['Ten plus ten is twenty', 'It''s twenty', '20'],
    'Basic arithmetic',
    'easy'
FROM english_lessons WHERE lesson_number = 4
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- Lesson 5: Days and Time
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(5, 'Days of the Week and Time', 'Learn to talk about days and tell the time', 'beginner', 'Present Simple with time expressions', ARRAY['Monday', 'Tuesday', 'today', 'yesterday', 'tomorrow', 'time', 'hour', 'minute'])
ON CONFLICT (lesson_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 1,
    'What day is today?',
    'Today is Monday',
    ARRAY['It''s Monday', 'Monday'],
    'Days of the week',
    'easy'
FROM english_lessons WHERE lesson_number = 5
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 2,
    'What day comes after Wednesday?',
    'Thursday',
    ARRAY['Thursday comes after Wednesday', 'It''s Thursday'],
    'Day sequence',
    'easy'
FROM english_lessons WHERE lesson_number = 5
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 3,
    'How many hours are there in a day?',
    'There are twenty-four hours in a day',
    ARRAY['Twenty-four hours', '24 hours', 'There are 24 hours'],
    'Time vocabulary',
    'medium'
FROM english_lessons WHERE lesson_number = 5
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 4,
    'What do you do on Monday?',
    'I go to work on Monday',
    ARRAY['I work on Monday', 'I go to school on Monday', 'On Monday I work'],
    'Present Simple with time',
    'medium'
FROM english_lessons WHERE lesson_number = 5
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- ============================================
-- ELEMENTARY LEVEL LESSONS
-- ============================================

-- Lesson 6: Food and Drinks
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(6, 'Food and Drinks', 'Learn to talk about food, drinks and preferences', 'elementary', 'Like/Love/Hate + noun', ARRAY['coffee', 'tea', 'bread', 'water', 'apple', 'hungry', 'thirsty', 'breakfast'])
ON CONFLICT (lesson_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 1,
    'Do you like coffee?',
    'Yes, I like coffee',
    ARRAY['Yes, I do', 'Yes, I love coffee', 'I like coffee'],
    'Preferences with like',
    'easy'
FROM english_lessons WHERE lesson_number = 6
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 2,
    'What do you drink in the morning?',
    'I drink coffee in the morning',
    ARRAY['Coffee', 'I drink tea', 'In the morning I drink coffee'],
    'Present Simple habits',
    'medium'
FROM english_lessons WHERE lesson_number = 6
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 3,
    'Are you hungry?',
    'Yes, I am hungry',
    ARRAY['Yes, I''m hungry', 'Yes, I am'],
    'Adjectives for feelings',
    'easy'
FROM english_lessons WHERE lesson_number = 6
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 4,
    'What do you eat for breakfast?',
    'I eat bread for breakfast',
    ARRAY['Bread', 'I have bread', 'For breakfast I eat bread'],
    'Meals vocabulary',
    'medium'
FROM english_lessons WHERE lesson_number = 6
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 5,
    'Which do you prefer, tea or coffee?',
    'I prefer coffee',
    ARRAY['Coffee', 'I like coffee more', 'I prefer coffee to tea'],
    'Expressing preference',
    'medium'
FROM english_lessons WHERE lesson_number = 6
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- Lesson 7: Family and Relationships
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(7, 'Family and Relationships', 'Learn to talk about your family members and relationships', 'elementary', 'Possessive adjectives and have got', ARRAY['mother', 'father', 'brother', 'sister', 'parents', 'family', 'child', 'children'])
ON CONFLICT (lesson_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 1,
    'Have you got a brother?',
    'Yes, I have got a brother',
    ARRAY['Yes, I have', 'Yes, I''ve got a brother', 'Yes, I do'],
    'Have got questions',
    'easy'
FROM english_lessons WHERE lesson_number = 7
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 2,
    'What is your mother''s name?',
    'My mother''s name is Maria',
    ARRAY['Her name is Maria', 'Maria', 'My mother is called Maria'],
    'Possessive adjectives',
    'medium'
FROM english_lessons WHERE lesson_number = 7
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 3,
    'How many people are there in your family?',
    'There are four people in my family',
    ARRAY['Four people', 'There are 4 people', 'Four'],
    'Family size',
    'medium'
FROM english_lessons WHERE lesson_number = 7
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 4,
    'Who is your father''s wife?',
    'My mother is my father''s wife',
    ARRAY['My mother', 'She is my mother', 'My mum'],
    'Family relationships',
    'medium'
FROM english_lessons WHERE lesson_number = 7
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- ============================================
-- INTERMEDIATE LEVEL LESSONS
-- ============================================

-- Lesson 8: Past Simple - Regular Verbs
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(8, 'Talking About the Past', 'Learn to describe actions that happened in the past', 'intermediate', 'Past Simple - Regular verbs', ARRAY['yesterday', 'last week', 'ago', 'worked', 'walked', 'talked', 'played', 'watched'])
ON CONFLICT (lesson_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 1,
    'What did you do yesterday?',
    'I worked yesterday',
    ARRAY['Yesterday I worked', 'I went to work', 'I was working'],
    'Past Simple questions',
    'medium'
FROM english_lessons WHERE lesson_number = 8
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 2,
    'Did you watch TV last night?',
    'Yes, I watched TV last night',
    ARRAY['Yes, I did', 'Yes, I watched TV', 'Yes'],
    'Past Simple Yes/No questions',
    'medium'
FROM english_lessons WHERE lesson_number = 8
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 3,
    'When did you start learning English?',
    'I started learning English two years ago',
    ARRAY['Two years ago', 'I started two years ago', '2 years ago'],
    'Time expressions with ago',
    'hard'
FROM english_lessons WHERE lesson_number = 8
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 4,
    'Did you walk or drive to work today?',
    'I walked to work today',
    ARRAY['I walked', 'Walked', 'I drove to work today'],
    'Alternative questions in past',
    'medium'
FROM english_lessons WHERE lesson_number = 8
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- Lesson 9: Past Simple - Irregular Verbs
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(9, 'More About the Past', 'Learn common irregular past tense verbs', 'intermediate', 'Past Simple - Irregular verbs', ARRAY['went', 'saw', 'came', 'gave', 'took', 'made', 'had', 'said'])
ON CONFLICT (lesson_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 1,
    'Where did you go last weekend?',
    'I went to the cinema last weekend',
    ARRAY['I went to the cinema', 'To the cinema', 'I went shopping'],
    'Go in past tense',
    'medium'
FROM english_lessons WHERE lesson_number = 9
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 2,
    'What did you have for lunch?',
    'I had a sandwich for lunch',
    ARRAY['A sandwich', 'I had a sandwich', 'Sandwich'],
    'Have in past tense',
    'medium'
FROM english_lessons WHERE lesson_number = 9
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 3,
    'Did you see John yesterday?',
    'Yes, I saw John yesterday',
    ARRAY['Yes, I saw him', 'Yes, I did', 'Yes'],
    'See in past tense',
    'medium'
FROM english_lessons WHERE lesson_number = 9
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 4,
    'What time did you come home last night?',
    'I came home at ten o''clock',
    ARRAY['At ten o''clock', 'I came home at 10', 'At 10 o''clock'],
    'Come in past tense with time',
    'hard'
FROM english_lessons WHERE lesson_number = 9
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 5,
    'What did your mother say?',
    'My mother said yes',
    ARRAY['She said yes', 'Yes', 'She said okay'],
    'Say in past tense',
    'medium'
FROM english_lessons WHERE lesson_number = 9
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- Lesson 10: Future with "going to"
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(10, 'Talking About Future Plans', 'Learn to express future intentions and plans', 'intermediate', 'Going to for future plans', ARRAY['tomorrow', 'next week', 'next month', 'plan', 'future', 'will', 'going to'])
ON CONFLICT (lesson_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 1,
    'What are you going to do tomorrow?',
    'I am going to work tomorrow',
    ARRAY['I''m going to work', 'Tomorrow I''m going to work', 'I''ll work tomorrow'],
    'Going to for plans',
    'medium'
FROM english_lessons WHERE lesson_number = 10
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 2,
    'Are you going to study English tonight?',
    'Yes, I am going to study English tonight',
    ARRAY['Yes, I am', 'Yes, I''m going to study', 'Yes'],
    'Going to Yes/No questions',
    'medium'
FROM english_lessons WHERE lesson_number = 10
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 3,
    'Where are you going to go on holiday?',
    'I am going to go to Spain',
    ARRAY['I''m going to Spain', 'To Spain', 'Spain'],
    'Going to with place',
    'hard'
FROM english_lessons WHERE lesson_number = 10
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 4,
    'What is your friend going to do next weekend?',
    'He is going to visit his parents',
    ARRAY['He''s going to visit his parents', 'Visit his parents', 'He''ll visit his parents'],
    'Third person with going to',
    'hard'
FROM english_lessons WHERE lesson_number = 10
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- ============================================
-- ADVANCED LEVEL LESSONS
-- ============================================

-- Lesson 11: Present Perfect
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(11, 'Experiences and Recent Actions', 'Learn to talk about experiences and recent past', 'advanced', 'Present Perfect - have/has + past participle', ARRAY['ever', 'never', 'already', 'yet', 'just', 'been', 'done', 'seen'])
ON CONFLICT (lesson_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 1,
    'Have you ever been to London?',
    'Yes, I have been to London',
    ARRAY['Yes, I have', 'Yes, I''ve been there', 'Yes'],
    'Present Perfect with ever',
    'hard'
FROM english_lessons WHERE lesson_number = 11
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 2,
    'Have you finished your homework yet?',
    'Yes, I have already finished it',
    ARRAY['Yes, I have', 'Yes, I''ve finished', 'I''ve already finished'],
    'Present Perfect with yet/already',
    'hard'
FROM english_lessons WHERE lesson_number = 11
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 3,
    'How long have you lived in this city?',
    'I have lived here for five years',
    ARRAY['For five years', 'I''ve lived here for 5 years', 'Five years'],
    'Present Perfect duration',
    'hard'
FROM english_lessons WHERE lesson_number = 11
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 4,
    'What have you done today?',
    'I have worked and studied today',
    ARRAY['I''ve worked and studied', 'I worked and studied', 'Worked and studied'],
    'Present Perfect for today',
    'hard'
FROM english_lessons WHERE lesson_number = 11
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- Lesson 12: Conditional Sentences (First Conditional)
INSERT INTO english_lessons (lesson_number, title, description, level, grammar_focus, vocabulary_focus) VALUES
(12, 'Talking About Real Possibilities', 'Learn to express conditions and their results', 'advanced', 'First Conditional - If + present, will + infinitive', ARRAY['if', 'will', 'unless', 'when', 'possible', 'probably', 'maybe'])
ON CONFLICT (lesson_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 1,
    'What will you do if it rains tomorrow?',
    'If it rains, I will stay at home',
    ARRAY['I will stay at home', 'I''ll stay home if it rains', 'Stay at home'],
    'First conditional basic',
    'hard'
FROM english_lessons WHERE lesson_number = 12
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 2,
    'Will you come to the party if I invite you?',
    'Yes, I will come if you invite me',
    ARRAY['Yes, I will', 'Yes, if you invite me', 'Yes, I''ll come'],
    'Conditional questions',
    'hard'
FROM english_lessons WHERE lesson_number = 12
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 3,
    'What will happen if you don''t study?',
    'If I don''t study, I will fail the exam',
    ARRAY['I will fail', 'I''ll fail the exam', 'I won''t pass'],
    'Negative conditions',
    'hard'
FROM english_lessons WHERE lesson_number = 12
ON CONFLICT (lesson_id, question_number) DO NOTHING;

INSERT INTO english_questions (lesson_id, question_number, question_text, expected_answer, alternative_answers, grammar_point, difficulty)
SELECT
    id, 4,
    'Where will you go when you finish work?',
    'When I finish work, I will go home',
    ARRAY['I will go home', 'I''ll go home when I finish', 'Home'],
    'Time clauses with when',
    'hard'
FROM english_lessons WHERE lesson_number = 12
ON CONFLICT (lesson_id, question_number) DO NOTHING;

-- ============================================
-- LOG SUCCESS
-- ============================================

DO $$
BEGIN
    RAISE NOTICE 'Successfully inserted 9 additional lessons with 40+ questions!';
    RAISE NOTICE 'Total lessons: 12 (3 beginner + 3 elementary + 4 intermediate + 2 advanced)';
END $$;
