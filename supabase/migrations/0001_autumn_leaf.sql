/*
  # Initial Schema Setup

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `first_name` (text)
      - `last_name` (text)
      - `company_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `api_keys`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `key_hash` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  first_name text,
  last_name text,
  company_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create api_keys table
CREATE TABLE api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  key_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON api_keys
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();