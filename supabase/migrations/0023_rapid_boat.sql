-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_shared_agent_urls_token ON shared_agent_urls(url_token);
CREATE INDEX IF NOT EXISTS idx_conversations_agent_user ON conversations(agent_id, user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation ON conversation_messages(conversation_id);

-- Add composite index for share URL lookups
CREATE INDEX IF NOT EXISTS idx_shared_agent_urls_active_expired ON shared_agent_urls(is_active, expires_at) 
WHERE is_active = true;