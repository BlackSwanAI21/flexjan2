-- First drop the existing function
DROP FUNCTION IF EXISTS set_share_token(text);

-- Drop existing policy
DROP POLICY IF EXISTS "Shared agent users can access OP API key" ON api_keys;

-- Create the function with the new parameter name
CREATE OR REPLACE FUNCTION set_share_token(share_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set the token in the current session
  PERFORM set_config('app.current_share_token', share_token, false);
END;
$$;

-- Create a more robust policy for API key access
CREATE POLICY "Shared agent users can access OP API key"
  ON api_keys
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1
      FROM shared_agent_urls
      WHERE url_token = current_setting('app.current_share_token', true)
      AND impersonated_user_id = api_keys.user_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- Ensure the shared_agent_urls policies are correct
DROP POLICY IF EXISTS "Anyone can view active share URLs" ON shared_agent_urls;

CREATE POLICY "Anyone can view active share URLs"
  ON shared_agent_urls
  FOR SELECT
  TO anon
  USING (
    is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  );