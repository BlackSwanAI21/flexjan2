-- Add is_archived column to conversations
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_conversations_is_archived
ON conversations(is_archived)
WHERE is_archived = true;

-- Update cleanup function to handle archived shared conversations
CREATE OR REPLACE FUNCTION cleanup_old_conversations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete regular anonymous conversations older than 7 days
  DELETE FROM conversations
  WHERE user_id IS NULL
  AND shared_token IS NULL
  AND created_at < NOW() - INTERVAL '7 days';

  -- Delete archived shared conversations older than 30 days
  DELETE FROM conversations
  WHERE is_archived = true
  AND shared_token IS NOT NULL
  AND updated_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Remove existing cleanup job if it exists
DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-conversations');
  PERFORM cron.unschedule('cleanup-conversations-2');
EXCEPTION WHEN OTHERS THEN
  -- Job might not exist, continue
END $$;

-- Schedule new cleanup job
SELECT cron.schedule(
  'cleanup-conversations',
  '0 0 * * *', -- Run at midnight every day
  $$SELECT cleanup_old_conversations()$$
);