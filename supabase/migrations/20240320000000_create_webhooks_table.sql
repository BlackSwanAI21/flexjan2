-- Create webhooks table
create table if not exists public.webhooks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  webhook_url text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.webhooks enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own webhooks" on webhooks;
drop policy if exists "Users can create their own webhooks" on webhooks;
drop policy if exists "Users can update their own webhooks" on webhooks;
drop policy if exists "Users can delete their own webhooks" on webhooks;
drop policy if exists "Public can view webhooks by ID" on webhooks;

-- Create policies
create policy "Users can view their own webhooks"
  on webhooks for select
  using (auth.uid() = user_id);

create policy "Users can create their own webhooks"
  on webhooks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own webhooks"
  on webhooks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own webhooks"
  on webhooks for delete
  using (auth.uid() = user_id);

-- Allow public access to webhooks by ID
create policy "Public can view webhooks by ID"
  on webhooks for select
  using (true);

-- Create function to generate webhook URL
create or replace function generate_webhook_url()
returns trigger as $$
declare
  base_url text;
begin
  -- Get the base URL from config, defaulting to localhost if not set
  base_url := coalesce(
    current_setting('app.base_url', true),
    'http://localhost:3000'
  );
  
  -- Ensure base_url doesn't end with a slash
  if right(base_url, 1) = '/' then
    base_url := left(base_url, -1);
  end if;
  
  -- Generate the complete webhook URL
  new.webhook_url := base_url || '/api/webhook/' || encode(gen_random_bytes(16), 'hex');
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
drop trigger if exists generate_webhook_url_trigger on webhooks;

-- Create trigger to automatically generate webhook URL
create trigger generate_webhook_url_trigger
  before insert on webhooks
  for each row
  execute function generate_webhook_url(); 