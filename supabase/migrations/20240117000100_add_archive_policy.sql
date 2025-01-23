-- Add policy for archiving shared conversations
CREATE POLICY "Agent owners can archive shared conversations"
ON conversations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM agents
    WHERE agents.id = conversations.agent_id
    AND agents.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM agents
    WHERE agents.id = conversations.agent_id
    AND agents.user_id = auth.uid()
  )
); 