-- Add column to track shared conversations
ALTER TABLE conversations
ADD COLUMN is_shared boolean DEFAULT false;

-- Add index for shared conversation queries
CREATE INDEX idx_conversations_shared ON conversations(is_shared) 
WHERE is_shared = true;

-- Update RLS policies to consider is_shared flag
CREATE POLICY "Users can view shared conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (is_shared = true AND user_id = auth.uid())
  );