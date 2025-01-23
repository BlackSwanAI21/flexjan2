-- First drop the policies that depend on the columns
DROP POLICY IF EXISTS "Only owner can view full share URL data" ON shared_agent_urls;
DROP POLICY IF EXISTS "Public can view limited share URL data" ON shared_agent_urls;

-- Then drop the constraint
ALTER TABLE shared_agent_urls DROP CONSTRAINT IF EXISTS usage_limit_check;

-- Now we can safely drop the columns
ALTER TABLE shared_agent_urls 
DROP COLUMN IF EXISTS encrypted_api_key,
DROP COLUMN IF EXISTS usage_limit,
DROP COLUMN IF EXISTS used_count;

-- Add creator_id column as nullable first
ALTER TABLE shared_agent_urls 
ADD COLUMN creator_id uuid REFERENCES profiles(id);

-- Update existing rows to set creator_id to created_by
UPDATE shared_agent_urls
SET creator_id = created_by;

-- Now make the column NOT NULL
ALTER TABLE shared_agent_urls 
ALTER COLUMN creator_id SET NOT NULL;

-- Create function to set share token
CREATE OR REPLACE FUNCTION set_share_token(token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.share_token', token, false);
END;
$$;

-- Create policy to allow reading API keys using creator_id
CREATE POLICY "Share URL users can read creator's API key"
  ON api_keys
  FOR SELECT
  TO anon
  USING (
    user_id IN (
      SELECT creator_id
      FROM shared_agent_urls
      WHERE url_token = current_setting('app.share_token', TRUE)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
  );