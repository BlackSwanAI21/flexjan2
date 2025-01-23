export interface Message {
  role: 'user' | 'assistant';
  content: string;
  run_id?: string;
}

export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant';
  content: Array<{ type: 'text'; text: { value: string } }>;
  run_id?: string;
  created_at: string;
}

export interface Thread {
  id: string;
}

export interface Run {
  id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'expired';
}