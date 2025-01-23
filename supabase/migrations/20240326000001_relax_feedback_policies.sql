-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anonymous users can create shared feedback" ON agent_feedback;
DROP POLICY IF EXISTS "Anonymous users can read shared feedback" ON agent_feedback;
DROP POLICY IF EXISTS "Users can create their own feedback" ON agent_feedback;
DROP POLICY IF EXISTS "Users can read feedback for accessible agents" ON agent_feedback;

-- Create a single permissive policy for feedback
CREATE POLICY "Anyone can create and read feedback"
  ON agent_feedback
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Keep the trigger to set share_token for tracking purposes
CREATE OR REPLACE FUNCTION set_feedback_share_token()
RETURNS TRIGGER AS $$
BEGIN
  -- Set share token if available in current session
  NEW.share_token := current_setting('app.current_share_token', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS set_feedback_share_token_trigger ON agent_feedback;
CREATE TRIGGER set_feedback_share_token_trigger
  BEFORE INSERT ON agent_feedback
  FOR EACH ROW
  EXECUTE FUNCTION set_feedback_share_token(); 