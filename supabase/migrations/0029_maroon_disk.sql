-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can create and view shared conversations" ON conversations;
DROP POLICY IF EXISTS "Anyone can view and create messages in shared conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Anyone can manage messages in shared conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Anyone can manage shared conversations" ON conversations;

-- Update conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS shared_token text;

-- Create index for shared token lookups
CREATE INDEX IF NOT EXISTS idx_conversations_shared_token 
ON conversations(shared_token) 
WHERE shared_token IS NOT NULL;

-- Create comprehensive policies for shared conversations
CREATE POLICY "Anyone can manage shared conversations"
  ON conversations
  FOR ALL
  TO anon
  USING (
    shared_token = current_setting('app.current_share_token', true)
  )
  WITH CHECK (
    shared_token = current_setting('app.current_share_token', true)
  );

-- Create policy for messages in shared conversations
CREATE POLICY "Anyone can manage shared messages"
  ON conversation_messages
  FOR ALL
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND shared_token = current_setting('app.current_share_token', true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND shared_token = current_setting('app.current_share_token', true)
    )
  );