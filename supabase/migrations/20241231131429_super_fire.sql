-- Add thread_id to conversations table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' 
    AND column_name = 'thread_id'
  ) THEN
    ALTER TABLE conversations 
    ADD COLUMN thread_id text;
  END IF;
END $$;

-- Add index for faster lookups if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_conversations_thread_id'
  ) THEN
    CREATE INDEX idx_conversations_thread_id ON conversations(thread_id);
  END IF;
END $$;