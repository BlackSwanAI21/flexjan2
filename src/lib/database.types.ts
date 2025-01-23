export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          company_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          key_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          key_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          key_hash?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}