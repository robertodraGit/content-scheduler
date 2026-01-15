-- Enable pg_net extension for HTTP requests from pg_cron
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule job to publish scheduled posts every minute
SELECT cron.schedule(
  'publish-scheduled-posts',
  '* * * * *',  -- Every minute
  $$
  SELECT
    net.http_post(
      url := current_setting('https://dewvvhwwpvkzcwpqaeay.supabase.co') || '/functions/v1/publish-scheduled',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRld3Z2aHd3cHZremN3cHFhZWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODUwNjM3MiwiZXhwIjoyMDg0MDgyMzcyfQ.g2GWVbZ5R6M358AAiCKXl4ChhTK6AUPTbx1OXq68aFM')
      )
    ) AS request_id;
  $$
);

-- Schedule job to refresh TikTok tokens daily at 2 AM
SELECT cron.schedule(
  'refresh-tiktok-tokens',
  '0 2 * * *',  -- Daily at 2 AM
  $$
  SELECT
    net.http_post(
      url := current_setting('https://dewvvhwwpvkzcwpqaeay.supabase.co') || '/functions/v1/refresh-tokens',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRld3Z2aHd3cHZremN3cHFhZWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODUwNjM3MiwiZXhwIjoyMDg0MDgyMzcyfQ.g2GWVbZ5R6M358AAiCKXl4ChhTK6AUPTbx1OXq68aFM')
      )
    ) AS request_id;
  $$
);

-- IMPORTANTE: Dopo aver eseguito questa migration, configura le variabili:
--
-- Opzione 1 (Consigliata): Esegui nel SQL Editor di Supabase:
--   ALTER DATABASE postgres SET app.supabase_url = 'https://your-project.supabase.co';
--   ALTER DATABASE postgres SET app.service_role_key = 'your-service-role-key';
--
-- Opzione 2: Modifica questo file sostituendo current_setting() con valori diretti
--
-- Verifica i job attivi con: SELECT * FROM cron.job;
