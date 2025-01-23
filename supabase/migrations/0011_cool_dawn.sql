/*
  # Update theme constraints

  1. Changes
    - Remove theme check constraint to allow custom themes
    - Add JSON column for custom theme colors
  
  2. Security
    - Maintain existing RLS policies
*/

-- Remove the theme check constraint
ALTER TABLE user_preferences
DROP CONSTRAINT IF EXISTS valid_theme;

-- Add column for custom theme colors
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS custom_theme_colors jsonb;