import type { Message } from '../chat/types';

export interface Conversation {
  id: string;
  agent_id: string;
  user_id?: string;
  session_id: string;
  shared_token?: string;
  created_at: string;
  updated_at: string;
  messages: (Message & { created_at: string })[];
}