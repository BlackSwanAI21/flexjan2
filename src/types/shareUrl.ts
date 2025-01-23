export interface ShareUrl {
  id: string;
  agent_id: string;
  url_token: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  created_by: string;
  encrypted_api_key?: string;
  usage_limit: number;
  used_count: number;
}