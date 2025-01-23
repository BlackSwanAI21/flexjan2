-- Make user_id nullable in conversations table
ALTER TABLE conversations
ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can manage conversations" ON conversations;
DROP POLICY IF EXISTS "Anonymous users can access shared agents" ON conversations;

-- Create comprehensive policies for conversations
CREATE POLICY "Users can manage own conversations"
  ON conversations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anonymous users can manage shared conversations"
  ON conversations
  FOR ALL
  TO anon
  USING (
    shared_token = current_setting('app.current_share_token', true)
  )
  WITH CHECK (
    shared_token = current_setting('app.current_share_token', true)
  );

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_conversations_shared_token_lookup 
ON conversations(shared_token) 
WHERE shared_token IS NOT NULL;