-- Drop existing policy
DROP POLICY IF EXISTS "Shared agent users can access OP API key" ON api_keys;

-- Create new policy for API key access
CREATE POLICY "Allow API key access for shared agents"
  ON api_keys
  FOR SELECT
  TO anon, authenticated
  USING (
    -- For authenticated users, allow access to their own API key
    (auth.uid() = user_id)
    OR
    -- For shared access, allow access to the agent owner's API key
    EXISTS (
      SELECT 1
      FROM shared_agent_urls sau
      JOIN agents a ON a.id = sau.agent_id
      WHERE sau.url_token = current_setting('app.current_share_token', true)
      AND a.user_id = api_keys.user_id
      AND sau.is_active = true
      AND (sau.expires_at IS NULL OR sau.expires_at > now())
    )
  ); 