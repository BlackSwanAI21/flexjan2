/*
  # Fix conversation messages table and permissions

  1. Changes
    - Ensure conversation_messages table exists with correct structure
    - Add proper indexes for performance
    - Update RLS policies for better access control
    - Add cascade delete trigger for cleanup

  2. Security
    - Enable RLS
    - Add policies for authenticated and anonymous access
    - Ensure proper data isolation
*/

-- Ensure conversation_messages table exists with correct structure
CREATE TABLE IF NOT EXISTS conversation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view and create messages in shared conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Users can view messages from own conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON conversation_messages;

-- Create comprehensive policies
CREATE POLICY "Users can manage own messages"
  ON conversation_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can manage messages in shared conversations"
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

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id 
ON conversation_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at 
ON conversation_messages(created_at);

-- Add trigger for cleanup
CREATE OR REPLACE FUNCTION cleanup_orphaned_messages()
RETURNS trigger AS $$
BEGIN
  DELETE FROM conversation_messages
  WHERE conversation_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_conversation_messages
  BEFORE DELETE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_orphaned_messages();