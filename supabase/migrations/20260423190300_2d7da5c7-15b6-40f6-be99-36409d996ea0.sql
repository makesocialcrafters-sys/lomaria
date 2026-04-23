-- Remove any existing version of the job (idempotent)
DO $$
DECLARE
  job_id bigint;
BEGIN
  SELECT jobid INTO job_id FROM cron.job WHERE jobname = 'onboarding-reminders-hourly';
  IF job_id IS NOT NULL THEN
    PERFORM cron.unschedule(job_id);
  END IF;
END $$;

-- Schedule the hourly onboarding reminder job
SELECT cron.schedule(
  'onboarding-reminders-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://otzcvsbmswxcxpnqafpc.supabase.co/functions/v1/send-onboarding-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'onboarding_reminders_service_role_key' LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $$
);