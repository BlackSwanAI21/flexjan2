/*
  # Add first message field to agents table

  1. Changes
    - Add `first_message` column to `agents` table
    - Set default value to empty string
    - Make column non-nullable
*/

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS first_message text NOT NULL DEFAULT '';