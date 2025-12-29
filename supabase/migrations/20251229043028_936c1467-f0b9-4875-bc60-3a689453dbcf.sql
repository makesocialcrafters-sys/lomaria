-- Step 1: Drop old constraint first
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_study_program_check;

-- Step 2: Migrate existing data to new simplified values
UPDATE public.users 
SET study_program = 'WiSo' 
WHERE study_program LIKE 'WiSo-%';

-- Step 3: Add new constraint with simplified values (after data is clean)
ALTER TABLE public.users
ADD CONSTRAINT users_study_program_check
CHECK (study_program IS NULL OR study_program = ANY (ARRAY['WiSo'::text, 'WiRe'::text, 'BBE'::text]));