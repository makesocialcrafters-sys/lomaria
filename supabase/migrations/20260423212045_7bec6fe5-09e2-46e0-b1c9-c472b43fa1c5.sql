-- Defense-in-depth: restrict Realtime channel subscriptions to connection participants.
-- Topic naming convention enforced: 'chat:<connection_id>'
-- A user may only subscribe to / send broadcast / presence on a topic whose
-- connection_id corresponds to an accepted connection they participate in.

-- Helper: check whether auth.uid() is a participant of the connection encoded in the topic.
-- SECURITY DEFINER so it can read public.connections / public.users regardless of caller's
-- direct table grants, but it only ever returns a boolean — no data leakage.
CREATE OR REPLACE FUNCTION public.is_realtime_topic_participant(_topic text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _connection_id uuid;
BEGIN
  -- Expect topic format 'chat:<uuid>'
  IF _topic IS NULL OR position('chat:' in _topic) <> 1 THEN
    RETURN false;
  END IF;

  BEGIN
    _connection_id := substring(_topic from 6)::uuid;
  EXCEPTION WHEN others THEN
    RETURN false;
  END;

  RETURN EXISTS (
    SELECT 1
    FROM public.connections c
    JOIN public.users u ON (u.id = c.from_user OR u.id = c.to_user)
    WHERE c.id = _connection_id
      AND c.status = 'accepted'
      AND u.auth_user_id = auth.uid()
  );
END;
$$;

-- Lock down realtime.messages (the channel-subscription gate table).
-- RLS is already enabled on realtime.messages by Supabase; we just need policies.

-- Allow subscribing / receiving on permitted topics only
DROP POLICY IF EXISTS "Participants can read realtime topic"
  ON realtime.messages;
CREATE POLICY "Participants can read realtime topic"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (public.is_realtime_topic_participant((SELECT realtime.topic())));

-- Allow sending broadcast / presence on permitted topics only
DROP POLICY IF EXISTS "Participants can write realtime topic"
  ON realtime.messages;
CREATE POLICY "Participants can write realtime topic"
  ON realtime.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_realtime_topic_participant((SELECT realtime.topic())));
