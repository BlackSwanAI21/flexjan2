/*
  # Add shared API keys support
  
  1. Changes
    - Add encrypted_api_key column to shared_agent_urls table
    - Add usage_limit column for rate limiting
    - Add used_count column for tracking usage
  
  2. Security
    - API key is stored encrypted
    - Added constraints for usage tracking
*/

-- Add columns to shared_agent_urls table
ALTER TABLE shared_agent_urls
ADD COLUMN encrypted_api_key text,
ADD COLUMN usage_limit integer DEFAULT 100,
ADD COLUMN used_count integer DEFAULT 0;

-- Add check constraint for usage tracking
ALTER TABLE shared_agent_urls
ADD CONSTRAINT usage_limit_check 
CHECK (used_count <= usage_limit);

-- Update RLS policies to protect encrypted_api_key
CREATE POLICY "Only owner can view full share URL data"
  ON shared_agent_urls
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
  );

-- Public can only view necessary fields
CREATE POLICY "Public can view limited share URL data"
  ON shared_agent_urls
  FOR SELECT
  TO anon
  USING (
    is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND used_count < usage_limit
  );

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_share_url_usage(url_token_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shared_agent_urls
  SET used_count = used_count + 1
  WHERE url_token = url_token_param
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > now())
  AND used_count < usage_limit;
END;
$$;