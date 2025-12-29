-- Add rejected_at column to connections table
ALTER TABLE public.connections 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ DEFAULT NULL;

-- Drop existing incomplete UPDATE policy
DROP POLICY IF EXISTS "Users can update received connections" ON public.connections;

-- Create complete policy for receiver to accept or reject pending connections
CREATE POLICY "Receiver can update pending connections"
ON public.connections
FOR UPDATE
USING (
  status = 'pending'
  AND auth.uid() = (
    SELECT users.auth_user_id
    FROM users
    WHERE users.id = connections.to_user
  )
)
WITH CHECK (
  status IN ('accepted', 'rejected')
);

-- Create function to automatically set rejected_at timestamp
CREATE OR REPLACE FUNCTION public.set_rejected_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    NEW.rejected_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function on update
DROP TRIGGER IF EXISTS trigger_set_rejected_at ON public.connections;
CREATE TRIGGER trigger_set_rejected_at
BEFORE UPDATE ON public.connections
FOR EACH ROW
EXECUTE FUNCTION public.set_rejected_at();