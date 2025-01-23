/*
  # Add conversations and messages tables

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `agent_id` (uuid, references agents)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `conversation_messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `role` (text, either 'user' or 'assistant')
      - `content` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own conversations and messages
*/

-- Create conversations table
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversation_messages table
CREATE TABLE conversation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at on conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- RLS Policies for conversations
CREATE POLICY "Users can view own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages from own conversations"
  ON conversation_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON conversation_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.user_id = auth.uid()
    )
  );