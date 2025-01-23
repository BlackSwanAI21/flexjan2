/*
  # Add shared agent URLs support
  
  1. New Tables
    - `shared_agent_urls`
      - `id` (uuid, primary key) - Unique identifier for the share URL
      - `agent_id` (uuid) - Reference to the agent being shared
      - `url_token` (text) - Unique token for the share URL
      - `is_active` (boolean) - Whether the share URL is active
      - `created_at` (timestamptz) - When the share URL was created
      - `expires_at` (timestamptz) - Optional expiration date
  
  2. Security
    - Enable RLS
    - Add policies for URL creation and access
*/

-- Create shared_agent_urls table
CREATE TABLE shared_agent_urls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  url_token text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
);

-- Enable RLS
ALTER TABLE shared_agent_urls ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create share URLs for their agents"
  ON shared_agent_urls
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view share URLs for their agents"
  ON shared_agent_urls
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active share URLs"
  ON shared_agent_urls
  FOR SELECT
  TO anon
  USING (
    is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  );

-- Create function to generate unique URL token
CREATE OR REPLACE FUNCTION generate_unique_url_token()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  token text := '';
  i integer := 0;
BEGIN
  WHILE i < 10 LOOP
    token := token || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    i := i + 1;
  END LOOP;
  
  -- Ensure token is unique
  WHILE EXISTS (SELECT 1 FROM shared_agent_urls WHERE url_token = token) LOOP
    token := '';
    i := 0;
    WHILE i < 10 LOOP
      token := token || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
      i := i + 1;
    END LOOP;
  END LOOP;
  
  RETURN token;
END;
$$;