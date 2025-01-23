/*
  # Add agents table

  1. New Tables
    - `agents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `assistant_id` (text, OpenAI assistant ID)
      - `name` (text)
      - `model` (text)
      - `instructions` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `agents` table
    - Add policies for users to manage their own agents
*/

CREATE TABLE agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  assistant_id text NOT NULL,
  name text NOT NULL,
  model text NOT NULL,
  instructions text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- RLS Policies
CREATE POLICY "Users can view own agents"
  ON agents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agents"
  ON agents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents"
  ON agents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);