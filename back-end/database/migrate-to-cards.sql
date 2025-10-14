-- Migration script to convert questions to cards (front/back style)
-- Run this after updating init.sql

-- Add new columns for front/back text
ALTER TABLE english_questions 
ADD COLUMN IF NOT EXISTS front_text TEXT,
ADD COLUMN IF NOT EXISTS back_text TEXT;

-- Migrate existing data
-- For now, we'll copy question_text to front_text and expected_answer to back_text
-- This is a temporary migration - proper data should be inserted via the sample data script
UPDATE english_questions 
SET 
    front_text = question_text,
    back_text = expected_answer
WHERE front_text IS NULL OR back_text IS NULL;

-- Make the new columns NOT NULL after migration
ALTER TABLE english_questions 
ALTER COLUMN front_text SET NOT NULL,
ALTER COLUMN back_text SET NOT NULL;

-- Drop old columns that are no longer needed
ALTER TABLE english_questions 
DROP COLUMN IF EXISTS question_text,
DROP COLUMN IF EXISTS expected_answer,
DROP COLUMN IF EXISTS alternative_answers;

-- Update comments
COMMENT ON COLUMN english_questions.front_text IS 'English phrase/sentence on the front of the card';
COMMENT ON COLUMN english_questions.back_text IS 'Portuguese translation on the back of the card';

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Migration to card system completed successfully!';
    RAISE NOTICE 'Questions table now supports front/back card style.';
    RAISE NOTICE 'Run the new sample data script to populate with proper card data.';
END $$;
