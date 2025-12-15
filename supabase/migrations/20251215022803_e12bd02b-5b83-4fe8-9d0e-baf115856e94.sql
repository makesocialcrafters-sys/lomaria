-- Create messages table for chat functionality
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster message retrieval
CREATE INDEX idx_messages_connection_created ON public.messages(connection_id, created_at);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for messages
-- Users can view messages in their connections
CREATE POLICY "Users can view messages in their connections"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.connections c
    JOIN public.users u ON u.id = c.from_user OR u.id = c.to_user
    WHERE c.id = messages.connection_id
    AND u.auth_user_id = auth.uid()
    AND c.status = 'accepted'
  )
);

-- Users can send messages in their accepted connections
CREATE POLICY "Users can send messages in accepted connections"
ON public.messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = messages.sender_id
    AND u.auth_user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.connections c
    JOIN public.users u ON u.id = c.from_user OR u.id = c.to_user
    WHERE c.id = messages.connection_id
    AND u.auth_user_id = auth.uid()
    AND c.status = 'accepted'
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;