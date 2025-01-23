/*
  # Update Voice Agents Schema

  1. Changes
    - Add missing columns to voice_agents table if they don't exist
    - Add new indexes for better query performance
    - Update RLS policies
  
  2. Safety
    - Uses IF NOT EXISTS for all operations
    - Checks for column existence before adding
*/

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'voice_agents' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE voice_agents ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'voice_agents' AND column_name = 'name'
  ) THEN
    ALTER TABLE voice_agents ADD COLUMN name text NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'voice_agents' AND column_name = 'instructions'
  ) THEN
    ALTER TABLE voice_agents ADD COLUMN instructions text NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'voice_agents' AND column_name = 'config'
  ) THEN
    ALTER TABLE voice_agents ADD COLUMN config jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'voice_agents' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE voice_agents ADD COLUMN created_at timestamptz DEFAULT now() NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'voice_agents' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE voice_agents ADD COLUMN updated_at timestamptz DEFAULT now() NOT NULL;
  END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE voice_agents ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_voice_agents_updated_at'
  ) THEN
    CREATE TRIGGER update_voice_agents_updated_at
      BEFORE UPDATE ON voice_agents
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END $$;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can manage own voice agents" ON voice_agents;

-- Create new RLS policy
CREATE POLICY "Users can manage own voice agents"
  ON voice_agents
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_voice_agents_user_id ON voice_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_agents_created_at ON voice_agents(created_at);