/*
  # Fix user preferences policies to prevent infinite recursion
  
  1. Changes
    - Drop conflicting policies
    - Create single, correct policy for upserts
  
  2. Security
    - Maintain proper user isolation
    - Fix infinite recursion issue
*/

-- Drop conflicting policies
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can upsert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

-- Create single, correct policy for all write operations
CREATE POLICY "Users can manage own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id); 