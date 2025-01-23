/*
  # Voice AI Database Schema

  1. New Tables
    - voice_agents
      - Stores voice agent configurations
      - Links to base agents table
    - voice_conversations
      - Tracks voice chat sessions
      - Stores WebRTC session data
    - voice_messages
      - Stores text and audio messages
      - Handles transcriptions and audio URLs

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Add policies for shared access

  3. Changes
    - Add voice-specific fields to existing tables
    - Create indexes for performance
*/

-- Create voice_agents table
CREATE TABLE voice_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  config jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create voice_conversations table
CREATE TABLE voice_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES voice_agents(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  status text NOT NULL CHECK (status IN ('active', 'completed', 'terminated')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create voice_messages table
CREATE TABLE voice_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES voice_conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE voice_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_messages ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_voice_agents_agent_id ON voice_agents(agent_id);
CREATE INDEX idx_voice_conversations_agent_id ON voice_conversations(agent_id);
CREATE INDEX idx_voice_conversations_user_id ON voice_conversations(user_id);
CREATE INDEX idx_voice_messages_conversation_id ON voice_messages(conversation_id);

-- Create updated_at triggers
CREATE TRIGGER update_voice_agents_updated_at
  BEFORE UPDATE ON voice_agents
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_voice_conversations_updated_at
  BEFORE UPDATE ON voice_conversations
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Create RLS policies
CREATE POLICY "Users can manage own voice agents"
  ON voice_agents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = voice_agents.agent_id
      AND agents.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = voice_agents.agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own voice conversations"
  ON voice_conversations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own voice messages"
  ON voice_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM voice_conversations
      WHERE voice_conversations.id = voice_messages.conversation_id
      AND voice_conversations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM voice_conversations
      WHERE voice_conversations.id = voice_messages.conversation_id
      AND voice_conversations.user_id = auth.uid()
    )
  );