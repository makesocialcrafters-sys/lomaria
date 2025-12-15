-- Create connections table for contact requests
CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT no_self_connection CHECK (from_user != to_user),
  CONSTRAINT unique_connection UNIQUE (from_user, to_user)
);

-- Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Users can view connections they're part of
CREATE POLICY "Users can view their connections"
ON public.connections
FOR SELECT
USING (auth.uid() IN (
  SELECT auth_user_id FROM public.users WHERE id = from_user
  UNION
  SELECT auth_user_id FROM public.users WHERE id = to_user
));

-- Users can create connection requests (as from_user)
CREATE POLICY "Users can create connection requests"
ON public.connections
FOR INSERT
WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = from_user));

-- Users can update connections they received (to accept/reject)
CREATE POLICY "Users can update received connections"
ON public.connections
FOR UPDATE
USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = to_user));

-- Index for faster lookups
CREATE INDEX idx_connections_from_user ON public.connections(from_user);
CREATE INDEX idx_connections_to_user ON public.connections(to_user);
CREATE INDEX idx_connections_status ON public.connections(status);