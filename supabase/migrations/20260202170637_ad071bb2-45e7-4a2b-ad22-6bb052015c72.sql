-- Add email notifications preference column
ALTER TABLE public.users 
ADD COLUMN email_notifications_enabled boolean NOT NULL DEFAULT true;