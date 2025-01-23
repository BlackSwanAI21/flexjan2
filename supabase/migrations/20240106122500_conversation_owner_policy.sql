-- Drop existing policies for authenticated users
DROP POLICY IF EXISTS "Users can manage own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view all conversations for their agents" ON conversations;

-- Create policy for viewing all conversations from user's agents
CREATE POLICY "Users can view all conversations for their agents"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR  -- Their own conversations
    EXISTS (  -- Conversations from their agents
      SELECT 1 FROM agents
      WHERE agents.id = conversations.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- Create separate policies for insert, update, and delete operations
CREATE POLICY "Users can insert own conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations"
  ON conversations
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()); 