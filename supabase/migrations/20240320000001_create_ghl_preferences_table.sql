-- Drop existing table if it exists (this will cascade and remove all policies and triggers)
drop table if exists public.ghl_preferences cascade;

-- Create GHL preferences table
create table public.ghl_preferences (
    preference_id uuid default gen_random_uuid() primary key,
    id uuid references auth.users(id) not null,
    assistant_id text not null,
    time_detection_enabled boolean default false,
    timezone text,
    moderation_enabled boolean default false,
    moderation_level text check (moderation_level in ('light', 'medium', 'compliant')),
    moderation_prompt text,
    webhook_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(id, assistant_id)
);

-- Enable RLS
alter table ghl_preferences enable row level security;

-- Create policies
create policy "Users can view their own GHL preferences"
    on ghl_preferences for select
    using (auth.uid() = id);

create policy "Users can create their own GHL preferences"
    on ghl_preferences for insert
    with check (auth.uid() = id);

create policy "Users can update their own GHL preferences"
    on ghl_preferences for update
    using (auth.uid() = id);

create policy "Users can delete their own GHL preferences"
    on ghl_preferences for delete
    using (auth.uid() = id);

-- Add policy for webhook access
create policy "Allow webhook access to GHL preferences"
    on ghl_preferences for select
    to anon
    using (true);  -- This allows reading any preference, which is needed for webhook handling

-- Create function to update updated_at on changes
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger to update updated_at
create trigger handle_ghl_preferences_updated_at
    before update on ghl_preferences
    for each row
    execute procedure public.handle_updated_at(); 