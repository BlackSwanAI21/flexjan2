-- Add last_request column to webhooks table
alter table public.webhooks 
add column if not exists last_request jsonb; 