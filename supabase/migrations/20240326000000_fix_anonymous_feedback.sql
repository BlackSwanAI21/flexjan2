-- Drop existing policies first
DROP POLICY IF EXISTS "Anonymous users can create shared feedback" ON agent_feedback;
DROP POLICY IF EXISTS "Users can create their own feedback" ON agent_feedback;

-- Create a more permissive policy for feedback creation
CREATE POLICY "Anyone can create feedback for shared agents"
  ON agent_feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- For authenticated users, allow if they own the feedback
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    -- For anonymous users, allow if the agent is shared
    (auth.uid() IS NULL AND agent_id IN (
      SELECT agent_id
      FROM shared_agent_urls
      WHERE url_token = current_setting('app.current_share_token', true)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    ))
  );

-- Update the trigger to handle both cases
CREATE OR REPLACE FUNCTION set_feedback_share_token()
RETURNS TRIGGER AS $$
BEGIN
  -- For anonymous users, set the share token
  IF auth.uid() IS NULL THEN
    NEW.share_token := current_setting('app.current_share_token', true);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql; 