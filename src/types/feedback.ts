export interface Feedback {
  id: string;
  agent_id: string;
  user_id?: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  share_token?: string;
}