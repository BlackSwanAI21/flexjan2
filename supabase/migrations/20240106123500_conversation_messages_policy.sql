-- Drop existing message policies
DROP POLICY IF EXISTS "Users can view messages from own conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Anonymous users can view shared conversation messages" ON conversation_messages;
DROP POLICY IF EXISTS "Anonymous users can create shared conversation messages" ON conversation_messages;

-- Create policy for viewing messages
CREATE POLICY "Users can view all messages from their agents conversations"
  ON conversation_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN agents a ON a.id = c.agent_id
      WHERE c.id = conversation_messages.conversation_id
      AND (
        -- User owns the conversation
        c.user_id = auth.uid()
        OR
        -- User owns the agent
        a.user_id = auth.uid()
      )
    )
  );

-- Create policy for creating messages in own conversations
CREATE POLICY "Users can create messages in own conversations"
  ON conversation_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND user_id = auth.uid()
    )
  );

-- Create policy for anonymous users to view shared conversation messages
CREATE POLICY "Anonymous users can view shared conversation messages"
  ON conversation_messages
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND shared_token = current_setting('app.current_share_token', true)
    )
  );

-- Create policy for anonymous users to create messages in shared conversations
CREATE POLICY "Anonymous users can create shared conversation messages"
  ON conversation_messages
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND shared_token = current_setting('app.current_share_token', true)
    )
  ); 