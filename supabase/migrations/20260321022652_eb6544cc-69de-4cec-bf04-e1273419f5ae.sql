
-- Drop the overly permissive view count policy
DROP POLICY "Anyone can increment view count" ON public.videos;

-- Create a security definer function for view count increment instead
CREATE OR REPLACE FUNCTION public.increment_view_count(video_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.videos SET view_count = view_count + 1 WHERE id = video_id;
END;
$$;
