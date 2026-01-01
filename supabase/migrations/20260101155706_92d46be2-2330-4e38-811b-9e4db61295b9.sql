-- Policy: Sender can delete expired rejected connections (after 72h cooldown)
CREATE POLICY "Sender can delete expired rejected connections"
ON public.connections
FOR DELETE
TO authenticated
USING (
  status = 'rejected'
  AND rejected_at IS NOT NULL
  AND rejected_at < NOW() - INTERVAL '72 hours'
  AND auth.uid() = (
    SELECT users.auth_user_id 
    FROM users 
    WHERE users.id = connections.from_user
  )
);