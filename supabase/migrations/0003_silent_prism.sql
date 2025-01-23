/*
  # Cleanup orphaned users

  This migration removes auth users that don't have corresponding profile records.
  This helps clean up any users created before the profiles table was set up.

  1. Changes
    - Removes auth users without profile records
    - Ensures data consistency between auth and profiles tables
*/

-- Function to clean up orphaned users
CREATE OR REPLACE FUNCTION cleanup_orphaned_users()
RETURNS void AS $$
BEGIN
  -- Delete auth users that don't have corresponding profiles
  DELETE FROM auth.users
  WHERE id NOT IN (
    SELECT id FROM profiles
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;