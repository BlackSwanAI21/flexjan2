/*
  # Fix shared conversations and messages access

  1. Changes
    - Drop existing policies for shared conversations
    - Create new policies for anonymous access
    - Add indexes for performance optimization
    
  2. Security
    - Enable anonymous access for shared conversations
    - Maintain RLS protection for private conversations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create shared conversations" ON conversations;
DROP POLICY IF EXISTS "Anyone can create messages in shared conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Shared agent users can view messages" ON conversation_messages;

-- Create more permissive policies for shared conversations
CREATE POLICY "Anyone can create and view shared conversations"
  ON conversations
  FOR ALL
  TO anon
  USING (
    is_shared = true AND
    agent_id IN (
      SELECT agent_id
      FROM shared_agent_urls
      WHERE url_token = current_setting('app.current_share_token', true)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
  )
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

-- Update message policies to be more permissive
CREATE POLICY "Anyone can view and create messages in shared conversations"
  ON conversation_messages
  FOR ALL
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND is_shared = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND is_shared = true
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_conversation_messages_conversation_id 
ON conversation_messages(conversation_id);

CREATE INDEX idx_conversations_shared_agent 
ON conversations(agent_id) 
WHERE is_shared = true;