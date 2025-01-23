/*
  # Add policies for shared conversation messages

  1. Drop existing message policies that only work for authenticated users
  2. Add new policies that work for both:
     - Authenticated users viewing their own messages
     - Anonymous users viewing messages in shared conversations
*/

-- Drop existing message policies
DROP POLICY IF EXISTS "Users can view messages from own conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON conversation_messages;

-- Create new policies for conversation messages
CREATE POLICY "Users can view messages from own conversations"
  ON conversation_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON conversation_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can view shared conversation messages"
  ON conversation_messages
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.shared_token = current_setting('app.current_share_token', true)
    )
  );

CREATE POLICY "Anonymous users can create shared conversation messages"
  ON conversation_messages
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.shared_token = current_setting('app.current_share_token', true)
    )
  );

-- Add helpful index for performance
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_lookup 
ON conversation_messages(conversation_id); 