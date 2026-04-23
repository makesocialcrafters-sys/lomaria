CREATE OR REPLACE FUNCTION public.is_realtime_topic_participant(_topic text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _connection_id uuid;
  _id_part text;
BEGIN
  IF _topic IS NULL THEN
    RETURN false;
  END IF;

  -- Accept 'chat:<uuid>' or 'typing-<uuid>'
  IF position('chat:' in _topic) = 1 THEN
    _id_part := substring(_topic from 6);
  ELSIF position('typing-' in _topic) = 1 THEN
    _id_part := substring(_topic from 8);
  ELSE
    RETURN false;
  END IF;

  BEGIN
    _connection_id := _id_part::uuid;
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
