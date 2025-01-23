-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON conversations;
DROP POLICY IF EXISTS "Session users can access their conversations" ON conversations;
DROP POLICY IF EXISTS "Shared conversations access" ON conversations;

-- Create comprehensive RLS policies for conversations
CREATE POLICY "Users can manage own conversations"
  ON conversations
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    agent_id IN (
      SELECT agent_id
      FROM shared_agent_urls
      WHERE url_token = current_setting('app.current_share_token', true)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR
    agent_id IN (
      SELECT agent_id
      FROM shared_agent_urls
      WHERE url_token = current_setting('app.current_share_token', true)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- Create policy for anonymous access to shared conversations
CREATE POLICY "Anonymous users can access shared conversations"
  ON conversations
  FOR ALL
  TO anon
  USING (
    agent_id IN (
      SELECT agent_id
      FROM shared_agent_urls
      WHERE url_token = current_setting('app.current_share_token', true)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
  )
  WITH CHECK (
    agent_id IN (
      SELECT agent_id
      FROM shared_agent_urls
      WHERE url_token = current_setting('app.current_share_token', true)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_agent_user_shared
ON conversations(agent_id, user_id, shared_token);