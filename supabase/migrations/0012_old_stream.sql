/*
  # Add logo storage support
  
  1. Changes
    - Add logo_url column to user_preferences
    - Add logo_alt_text column for accessibility
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add columns for logo
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS logo_alt_text text;