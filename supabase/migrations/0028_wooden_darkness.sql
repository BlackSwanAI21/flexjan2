/*
  # Enhance conversation tracking
  
  1. Changes
    - Add session_id to track unique browser sessions
    - Add metadata JSONB field for additional context
    - Add indexes for better query performance
*/

-- Add new tracking columns to conversations
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS session_id text,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add index for session lookups
CREATE INDEX IF NOT EXISTS idx_conversations_session_id 
ON conversations(session_id);

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_conversations_lookup 
ON conversations(agent_id, session_id, is_shared);

-- Update RLS policies to handle session-based access
CREATE POLICY "Session users can access their conversations"
  ON conversations
  FOR ALL
  TO anon
  USING (
    session_id = current_setting('app.session_id', true)
    OR is_shared = true
  )
  WITH CHECK (
    session_id = current_setting('app.session_id', true)
    OR is_shared = true
  );