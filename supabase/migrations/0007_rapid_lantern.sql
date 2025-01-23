/*
  # Activity Notifications Schema

  1. New Tables
    - `activity_notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `agent_id` (uuid, references agents)
      - `type` (text, e.g., 'feedback')
      - `is_read` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for user access
*/

CREATE TABLE activity_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE activity_notifications ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER update_activity_notifications_updated_at
  BEFORE UPDATE ON activity_notifications
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- RLS Policies
CREATE POLICY "Users can view own notifications"
  ON activity_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON activity_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to create notification on feedback
CREATE OR REPLACE FUNCTION create_feedback_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_notifications (user_id, agent_id, type)
  VALUES (NEW.user_id, NEW.agent_id, 'feedback');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification when feedback is added
CREATE TRIGGER create_feedback_notification_trigger
  AFTER INSERT ON agent_feedback
  FOR EACH ROW
  EXECUTE FUNCTION create_feedback_notification();