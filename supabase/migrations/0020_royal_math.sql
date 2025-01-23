-- First drop the dependent policy
DROP POLICY IF EXISTS "Share URL users can read creator's API key" ON api_keys;

-- Now we can safely modify the shared_agent_urls table
ALTER TABLE shared_agent_urls
DROP COLUMN IF EXISTS creator_id;

-- Add impersonated_user_id column to clearly show we're using OP's ID
ALTER TABLE shared_agent_urls
ADD COLUMN impersonated_user_id uuid REFERENCES profiles(id);

-- Update existing rows to use created_by as impersonated_user_id
UPDATE shared_agent_urls
SET impersonated_user_id = created_by;

-- Make it required
ALTER TABLE shared_agent_urls
ALTER COLUMN impersonated_user_id SET NOT NULL;

-- Create new policy for API key access
CREATE POLICY "Shared agent users can access OP API key"
  ON api_keys
  FOR SELECT
  TO anon
  USING (
    user_id IN (
      SELECT impersonated_user_id
      FROM shared_agent_urls
      WHERE url_token = current_setting('app.current_share_token', true)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
  );