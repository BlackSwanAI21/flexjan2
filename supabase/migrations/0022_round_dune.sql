-- Drop existing conversation policies
DROP POLICY IF EXISTS "Anyone can create conversations for shared agents" ON conversations;
DROP POLICY IF EXISTS "Anyone can view conversations they created" ON conversations;
DROP POLICY IF EXISTS "Anyone can view messages from their conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Anyone can create messages in their conversations" ON conversation_messages;

-- Create new policies for shared link access
CREATE POLICY "Shared agent users can access OP conversations"
  ON conversations
  FOR SELECT
  TO anon
  USING (
    agent_id IN (
      SELECT agent_id
      FROM shared_agent_urls
      WHERE url_token = current_setting('app.current_share_token', true)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

CREATE POLICY "Shared agent users can create conversations as OP"
  ON conversations
  FOR INSERT
  TO anon
  WITH CHECK (
    agent_id IN (
      SELECT agent_id
      FROM shared_agent_urls sau
      WHERE url_token = current_setting('app.current_share_token', true)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
    AND user_id = (
      SELECT impersonated_user_id
      FROM shared_agent_urls
      WHERE url_token = current_setting('app.current_share_token', true)
      LIMIT 1
    )
  );

-- Update message policies
CREATE POLICY "Shared agent users can view messages"
  ON conversation_messages
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN shared_agent_urls sau ON c.agent_id = sau.agent_id
      WHERE c.id = conversation_id
      AND sau.url_token = current_setting('app.current_share_token', true)
      AND sau.is_active = true
      AND (sau.expires_at IS NULL OR sau.expires_at > now())
    )
  );

CREATE POLICY "Shared agent users can create messages"
  ON conversation_messages
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN shared_agent_urls sau ON c.agent_id = sau.agent_id
      WHERE c.id = conversation_id
      AND sau.url_token = current_setting('app.current_share_token', true)
      AND sau.is_active = true
      AND (sau.expires_at IS NULL OR sau.expires_at > now())
    )
  );