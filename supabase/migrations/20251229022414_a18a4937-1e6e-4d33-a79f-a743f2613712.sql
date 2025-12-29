-- Fix function search_path security warning
CREATE OR REPLACE FUNCTION public.set_rejected_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    NEW.rejected_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;