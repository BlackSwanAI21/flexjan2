/*
  # Add shared feedback support
  
  1. Changes
    - Make user_id nullable in agent_feedback table
    - Add share_token column to agent_feedback
    - Add policies for anonymous feedback through share token
    
  2. Security
    - Maintain existing authenticated user policies
    - Use same share token pattern as conversations
    - Ensure proper isolation between shared and authenticated feedback
*/

-- Up Migration
DO $$ 
BEGIN
  -- Make user_id nullable if it isn't already
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agent_feedback' 
    AND column_name = 'user_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE agent_feedback ALTER COLUMN user_id DROP NOT NULL;
  END IF;

  -- Add share_token column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'agent_feedback' 
    AND column_name = 'share_token'
  ) THEN
    ALTER TABLE agent_feedback ADD COLUMN share_token text;
  END IF;
END $$;

-- Create index for share token lookups
CREATE INDEX IF NOT EXISTS idx_agent_feedback_share_token 
ON agent_feedback(share_token) 
WHERE share_token IS NOT NULL;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anonymous users can create shared feedback" ON agent_feedback;
DROP POLICY IF EXISTS "Anonymous users can read shared feedback" ON agent_feedback;

-- Add policy for anonymous users to create feedback through share token
CREATE POLICY "Anonymous users can create shared feedback"
  ON agent_feedback
  FOR INSERT
  TO anon
  WITH CHECK (
    share_token = current_setting('app.current_share_token', true)
    AND agent_id IN (
      SELECT agent_id
      FROM shared_agent_urls
      WHERE url_token = current_setting('app.current_share_token', true)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS set_feedback_share_token_trigger ON agent_feedback;
DROP FUNCTION IF EXISTS set_feedback_share_token();

-- Add trigger to set share_token on insert
CREATE OR REPLACE FUNCTION set_feedback_share_token()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set share_token for anonymous users
  IF auth.uid() IS NULL THEN
    NEW.share_token := current_setting('app.current_share_token', true);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_feedback_share_token_trigger
  BEFORE INSERT ON agent_feedback
  FOR EACH ROW
  EXECUTE FUNCTION set_feedback_share_token();

-- Add policy for reading feedback through share token
CREATE POLICY "Anonymous users can read shared feedback"
  ON agent_feedback
  FOR SELECT
  TO anon
  USING (
    agent_id IN (
      SELECT agent_id
      FROM shared_agent_urls
      WHERE url_token = current_setting('app.current_share_token', true)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- Down Migration
COMMENT ON TABLE agent_feedback IS 'Down Migration:

-- Remove anonymous policies
DROP POLICY IF EXISTS "Anonymous users can create shared feedback" ON agent_feedback;
DROP POLICY IF EXISTS "Anonymous users can read shared feedback" ON agent_feedback;

-- Remove trigger and function
DROP TRIGGER IF EXISTS set_feedback_share_token_trigger ON agent_feedback;
DROP FUNCTION IF EXISTS set_feedback_share_token();

-- Remove share token index
DROP INDEX IF EXISTS idx_agent_feedback_share_token;

-- Remove share token column and make user_id required again
ALTER TABLE agent_feedback 
  DROP COLUMN share_token,
  ALTER COLUMN user_id SET NOT NULL;
'; 