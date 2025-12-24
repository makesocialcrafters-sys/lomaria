-- Enable REPLICA IDENTITY FULL for realtime reliability
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add read_at column for read receipts
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ DEFAULT NULL;

-- Create RLS policy for updating messages (marking as read)
CREATE POLICY "Users can mark messages as read in their connections"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM connections c
    JOIN users u ON (u.id = c.from_user OR u.id = c.to_user)
    WHERE c.id = messages.connection_id 
    AND u.auth_user_id = auth.uid() 
    AND c.status = 'accepted'
  )
);