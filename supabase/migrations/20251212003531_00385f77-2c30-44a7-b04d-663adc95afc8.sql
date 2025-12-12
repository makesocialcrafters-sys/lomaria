-- Create users table for profiles
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  profile_image TEXT,
  birthyear INTEGER CHECK (birthyear >= 1950 AND birthyear <= EXTRACT(YEAR FROM NOW())),
  gender TEXT CHECK (gender IN ('maennlich', 'weiblich', 'divers', 'keine_angabe')),
  study_program TEXT CHECK (study_program IN ('WiSo-BW', 'WiSo-IBW', 'WiSo-VW', 'WiSo-WUP', 'WiSo-WINF', 'WiRe', 'BBE')),
  semester TEXT CHECK (semester IN ('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Master', 'Doktorat')),
  focus TEXT,
  intents TEXT[],
  interests TEXT[],
  tutoring_subject TEXT,
  tutoring_desc TEXT CHECK (char_length(tutoring_desc) <= 300),
  tutoring_price NUMERIC CHECK (tutoring_price IS NULL OR tutoring_price > 0),
  bio TEXT CHECK (char_length(bio) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all profiles"
ON public.users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can delete own profile"
ON public.users FOR DELETE
TO authenticated
USING (auth.uid() = auth_user_id);

-- Trigger to create user on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Index for activity sorting
CREATE INDEX idx_users_last_active ON public.users(last_active_at DESC);