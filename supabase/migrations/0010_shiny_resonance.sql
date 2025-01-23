/*
  # Fix user preferences policies

  1. Changes
    - Add upsert policy for user preferences
    - Add default theme value constraint
    - Add function to validate theme values

  2. Security
    - Ensure users can only manage their own preferences
    - Validate theme values against allowed list
*/

-- Add check constraint for valid themes
ALTER TABLE user_preferences
ADD CONSTRAINT valid_theme CHECK (theme IN ('default', 'dark', 'ocean', 'forest'));

-- Add upsert policy
CREATE POLICY "Users can upsert own preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM user_preferences
      WHERE user_id = auth.uid()
    )
  );

-- Update existing update policy to handle upserts
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);