-- Enable RLS on the tables if not already enabled
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_agent_urls ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous users to read shared_agent_urls
CREATE POLICY "Anonymous users can read shared agent urls"
ON shared_agent_urls
FOR SELECT
TO public
USING (
  is_active = true
  AND (expires_at IS NULL OR expires_at > now())
);

-- Policy to allow anonymous users to read user_preferences (logo only) through share token
CREATE POLICY "Anonymous users can read logo through share token"
ON user_preferences
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM shared_agent_urls
    WHERE shared_agent_urls.created_by = user_preferences.user_id
    AND shared_agent_urls.is_active = true
    AND (shared_agent_urls.expires_at IS NULL OR shared_agent_urls.expires_at > now())
  )
); 