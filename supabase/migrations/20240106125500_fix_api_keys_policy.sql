-- Drop ALL existing policies for api_keys
DROP POLICY IF EXISTS "Allow API key access for shared agents" ON api_keys;
DROP POLICY IF EXISTS "Shared agent users can access OP API key" ON api_keys;
DROP POLICY IF EXISTS "Users can view own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can insert own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update own api keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete own api keys" ON api_keys;

-- Disable RLS temporarily
ALTER TABLE api_keys DISABLE ROW LEVEL SECURITY;

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policy for API key access
CREATE POLICY "api_keys_access_policy"
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
      WHERE sau.url_token = current_setting('app.current_share_token', true)::text
      AND a.user_id = api_keys.user_id
      AND sau.is_active = true
      AND (sau.expires_at IS NULL OR sau.expires_at > now())
    )
  );

-- Add policies for authenticated users to manage their own keys
CREATE POLICY "api_keys_insert_policy"
  ON api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "api_keys_update_policy"
  ON api_keys
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "api_keys_delete_policy"
  ON api_keys
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id); 