-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Both users can delete non-accepted connections" ON public.connections;

-- Create new policy that allows deleting ANY connection (pending, rejected, OR accepted)
CREATE POLICY "Both users can delete their connections"
ON public.connections
FOR DELETE
USING (
  auth.uid() IN (
    SELECT users.auth_user_id FROM users WHERE users.id = connections.from_user
    UNION
    SELECT users.auth_user_id FROM users WHERE users.id = connections.to_user
  )
);