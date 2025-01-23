-- Add cleanup function for old anonymous conversations
CREATE OR REPLACE FUNCTION cleanup_old_anonymous_conversations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete anonymous conversations older than 7 days
  DELETE FROM conversations
  WHERE user_id IS NULL
  AND created_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Create a scheduled job to run cleanup daily
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cleanup-anonymous-conversations',
  '0 0 * * *', -- Run at midnight every day
  $$SELECT cleanup_old_anonymous_conversations()$$
);