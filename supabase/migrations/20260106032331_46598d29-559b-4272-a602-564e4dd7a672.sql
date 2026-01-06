-- =============================================
-- 1. CREATE BLOCKS TABLE (with self-block prevention)
-- =============================================
CREATE TABLE public.blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (blocker_id, blocked_id),
  CONSTRAINT no_self_block CHECK (blocker_id <> blocked_id)
);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- Only blocker can create blocks
CREATE POLICY "Users can create blocks"
  ON public.blocks FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT auth_user_id FROM users WHERE id = blocker_id)
  );

-- Both parties can see blocks involving them (for query filters)
CREATE POLICY "Users can view blocks involving them"
  ON public.blocks FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM users WHERE id = blocker_id
      UNION
      SELECT auth_user_id FROM users WHERE id = blocked_id
    )
  );

-- Blocker can delete own blocks (for future unblock feature)
CREATE POLICY "Users can delete own blocks"
  ON public.blocks FOR DELETE
  USING (
    auth.uid() = (SELECT auth_user_id FROM users WHERE id = blocker_id)
  );

-- =============================================
-- 2. CREATE REPORTS TABLE (with reason constraint)
-- =============================================
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN (
    'inappropriate',
    'harassment', 
    'fake_profile',
    'spam',
    'other'
  )),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Only reporter can create reports
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT auth_user_id FROM users WHERE id = reporter_id)
  );

-- Reporter can view own reports
CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (
    auth.uid() = (SELECT auth_user_id FROM users WHERE id = reporter_id)
  );

-- =============================================
-- 3. ADD DELETE POLICY FOR CONNECTIONS (only accepted/rejected)
-- =============================================
CREATE POLICY "Users can delete own accepted or rejected connections"
  ON public.connections FOR DELETE
  USING (
    (status = 'accepted' OR status = 'rejected')
    AND auth.uid() IN (
      SELECT auth_user_id FROM users WHERE id = from_user
      UNION
      SELECT auth_user_id FROM users WHERE id = to_user
    )
  );