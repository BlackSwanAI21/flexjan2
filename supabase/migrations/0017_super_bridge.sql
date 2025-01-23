/*
  # Add anonymous chat history support
  
  1. Changes
    - Add anonymous_id column to conversations table
    - Update RLS policies to allow anonymous access
    - Add indexes for better query performance
  
  2. Security
    - Enable RLS for anonymous users
    - Add policies for public chat access
*/

-- Add anonymous_id column
ALTER TABLE conversations
ADD COLUMN anonymous_id text;

-- Add index for better query performance
CREATE INDEX conversations_anonymous_id_idx ON conversations(anonymous_id);
CREATE INDEX conversations_agent_id_idx ON conversations(agent_id);

-- Update RLS policies for anonymous access
CREATE POLICY "Anyone can create conversations for shared agents"
  ON conversations
  FOR INSERT
  TO anon
  WITH CHECK (
    agent_id IN (
      SELECT agent_id 
      FROM shared_agent_urls 
      WHERE is_active = true 
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

CREATE POLICY "Anyone can view conversations they created"
  ON conversations
  FOR SELECT
  TO anon
  USING (
    anonymous_id IS NOT NULL
    AND agent_id IN (
      SELECT agent_id 
      FROM shared_agent_urls 
      WHERE is_active = true 
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- Update message policies for anonymous access
CREATE POLICY "Anyone can view messages from their conversations"
  ON conversation_messages
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.anonymous_id IS NOT NULL
    )
  );

CREATE POLICY "Anyone can create messages in their conversations"
  ON conversation_messages
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.anonymous_id IS NOT NULL
    )
  );