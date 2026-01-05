-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the deadline reminder job to run every day at 08:00 UTC
SELECT
  cron.schedule(
    'process-deadline-reminders',
    '0 8 * * *',
    $$
    -- Function to trigger the edge function using the vaulted secret
    BEGIN
      PERFORM
        net.http_post(
          url := 'https://eaihouxeccyyhekkiano.supabase.co/functions/v1/process-reminders',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
          ),
          body := '{}'::jsonb
        );
    END;
    $$
  );


