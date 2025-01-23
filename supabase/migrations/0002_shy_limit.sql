/*
  # Fix Profile RLS Policies

  1. Changes
    - Add INSERT policy for profiles table to allow new user registration
    - Ensure authenticated users can only insert their own profile
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create comprehensive policies
CREATE POLICY "Users can manage own profile"
  ON profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow new users to create their profile during signup
CREATE POLICY "Users can create their profile during signup"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);