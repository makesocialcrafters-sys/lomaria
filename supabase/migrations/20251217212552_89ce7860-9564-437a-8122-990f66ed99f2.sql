-- Add columns (idempotent)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS study_phase text;

-- Add age constraint (idempotent)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_age_check'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT users_age_check CHECK (age BETWEEN 16 AND 100);
  END IF;
END $$;

-- Add study_phase constraint (idempotent)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_study_phase_check'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT users_study_phase_check CHECK (study_phase IN ('steop', 'cbk_hauptstudium'));
  END IF;
END $$;