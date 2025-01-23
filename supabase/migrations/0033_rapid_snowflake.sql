-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own conversations" ON conversations;
DROP POLICY IF EXISTS "Anonymous users can access shared conversations" ON conversations;

-- Create more permissive policies for conversations
CREATE POLICY "Authenticated users can manage conversations"
  ON conversations
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid()
  )
  WITH CHECK (
    user_id = auth.uid()
  );

CREATE POLICY "Anonymous users can access shared agents"
  ON conversations
  FOR ALL
  TO anon
  USING (
    shared_token IS NOT NULL AND
    shared_token = current_setting('app.current_share_token', true)
  )
  WITH CHECK (
    shared_token IS NOT NULL AND
    shared_token = current_setting('app.current_share_token', true)
  );

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_shared_token ON conversations(shared_token);