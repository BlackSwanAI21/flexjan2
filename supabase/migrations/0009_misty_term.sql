-- Create user preferences table
CREATE TABLE user_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'default',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();