-- 1. Remove old DELETE policies
DROP POLICY IF EXISTS "Users can delete own accepted or rejected connections" ON public.connections;
DROP POLICY IF EXISTS "Sender can delete rejected connections" ON public.connections;
DROP POLICY IF EXISTS "Sender can delete expired rejected connections" ON public.connections;

-- 2. Create new unified policy: both users can delete pending or rejected connections
CREATE POLICY "Both users can delete non-accepted connections"
ON public.connections
FOR DELETE
TO authenticated
USING (
  status IN ('pending', 'rejected')
  AND auth.uid() IN (
    SELECT auth_user_id FROM users WHERE id = from_user
    UNION
    SELECT auth_user_id FROM users WHERE id = to_user
  )
);