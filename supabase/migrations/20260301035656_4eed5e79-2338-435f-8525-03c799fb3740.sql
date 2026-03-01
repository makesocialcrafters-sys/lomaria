
-- 1) Drop old constraint FIRST
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_study_program_check;

-- 2) Migrate legacy values
UPDATE public.users SET study_program = 'wu_wien' WHERE study_program IN ('WiSo', 'WiRe', 'BBE');

-- 3) Add new constraint
ALTER TABLE public.users ADD CONSTRAINT users_study_program_check
  CHECK (study_program IS NULL OR study_program IN (
    'uni_wien', 'meduni_wien', 'tu_wien', 'wu_wien', 'boku_wien',
    'vetmeduni_wien', 'angewandte_wien', 'mdw_wien', 'muk_wien',
    'sfu_wien', 'webster_wien', 'modul_wien', 'ceu_wien', 'jam_wien', 'sonstige'
  ));
