-- Drop existing voice_agents table and recreate with correct structure
DROP TABLE IF EXISTS voice_agents CASCADE;

CREATE TABLE voice_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  instructions text NOT NULL,
  voice text NOT NULL DEFAULT 'alloy',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE voice_agents ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
CREATE TRIGGER update_voice_agents_updated_at
  BEFORE UPDATE ON voice_agents
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Create RLS policies
CREATE POLICY "Users can manage own voice agents"
  ON voice_agents
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_voice_agents_user_id ON voice_agents(user_id);
CREATE INDEX idx_voice_agents_created_at ON voice_agents(created_at);