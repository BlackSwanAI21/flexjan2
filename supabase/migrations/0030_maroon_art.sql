/*
  # Fix shared conversation access

  1. Changes
    - Add shared_token column to conversations
    - Update RLS policies for shared conversations and messages
    - Add indexes for better performance
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can manage shared conversations" ON conversations;
DROP POLICY IF EXISTS "Anyone can manage shared messages" ON conversation_messages;

-- Add shared_token column if it doesn't exist
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS shared_token text;

-- Create index for shared token lookups
CREATE INDEX IF NOT EXISTS idx_conversations_shared_token 
ON conversations(shared_token) 
WHERE shared_token IS NOT NULL;

-- Create policy for shared conversations
CREATE POLICY "Shared conversations access"
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

-- Create policy for messages in shared conversations
CREATE POLICY "Shared messages access"
  ON conversation_messages
  FOR ALL
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.shared_token IS NOT NULL
      AND conversations.shared_token = current_setting('app.current_share_token', true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.shared_token IS NOT NULL
      AND conversations.shared_token = current_setting('app.current_share_token', true)
    )
  );