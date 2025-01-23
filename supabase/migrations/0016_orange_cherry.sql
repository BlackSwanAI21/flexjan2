/*
  # Add public agent access policy

  1. Changes
    - Adds RLS policy to allow public access to shared agents
    - Policy checks for active and non-expired share URLs
    - Ensures proper security by only exposing agents with valid share URLs

  2. Security
    - Only allows SELECT operations
    - Validates share URL status and expiration
    - No modification access granted to public users
*/

-- Add policy for public agent access
CREATE POLICY "Anyone can view shared agents"
  ON agents
  FOR SELECT
  TO anon
  USING (
    id IN (
      SELECT agent_id 
      FROM shared_agent_urls 
      WHERE is_active = true 
      AND (expires_at IS NULL OR expires_at > now())
    )
  );