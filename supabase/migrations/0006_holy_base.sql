/*
  # Add agent feedback table

  1. New Tables
    - `agent_feedback`
      - `id` (uuid, primary key)
      - `agent_id` (uuid, references agents)
      - `user_id` (uuid, references profiles)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `agent_feedback` table
    - Add policies for authenticated users to:
      - Create their own feedback
      - Read feedback for agents they can access
*/

CREATE TABLE agent_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE agent_feedback ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER update_agent_feedback_updated_at
  BEFORE UPDATE ON agent_feedback
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- RLS Policies
CREATE POLICY "Users can create their own feedback"
  ON agent_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read feedback for accessible agents"
  ON agent_feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = agent_feedback.agent_id
      AND agents.user_id = auth.uid()
    )
  );