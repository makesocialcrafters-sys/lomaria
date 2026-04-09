
-- Add Stripe Connect account ID to profiles
ALTER TABLE public.profiles ADD COLUMN stripe_account_id TEXT;

-- Allow service role to write stripe_account_id (used by edge functions)
CREATE POLICY "Service role can update stripe_account_id"
  ON public.profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);
