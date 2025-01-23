/*
  # Fix Notifications Policy

  1. Changes
    - Add INSERT policy for activity_notifications table to allow the trigger to create notifications
*/

-- Add INSERT policy for notifications created by trigger
CREATE POLICY "System can create notifications"
  ON activity_notifications
  FOR INSERT
  WITH CHECK (true);  -- Allow inserts from triggers