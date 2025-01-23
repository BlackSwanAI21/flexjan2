-- Drop existing policies first
DROP POLICY IF EXISTS "Shared agent users can create conversations as OP" ON conversations;
DROP POLICY IF EXISTS "Shared agent users can create messages" ON conversation_messages;

-- Create more permissive policies for shared conversations
CREATE POLICY "Anyone can create shared conversations"
  ON conversations
  FOR INSERT
  TO anon
  WITH CHECK (
    is_shared = true AND
    agent_id IN (
      SELECT agent_id
      FROM shared_agent_urls
      WHERE url_token = current_setting('app.current_share_token', true)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

CREATE POLICY "Anyone can create messages in shared conversations"
  ON conversation_messages
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND is_shared = true
    )
  );

-- Add better error handling function
CREATE OR REPLACE FUNCTION handle_shared_conversation_error()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT EXISTS (
      SELECT 1 FROM shared_agent_urls
      WHERE url_token = current_setting('app.current_share_token', true)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    ) THEN
      RAISE EXCEPTION 'Invalid or expired share token';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for error handling
CREATE TRIGGER shared_conversation_error_check
  BEFORE INSERT ON conversations
  FOR EACH ROW
  WHEN (NEW.is_shared = true)
  EXECUTE FUNCTION handle_shared_conversation_error();