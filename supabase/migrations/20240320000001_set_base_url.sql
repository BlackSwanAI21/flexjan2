-- Set the base URL for webhook generation
select set_config('app.base_url', 'http://localhost:5173', false);

-- Grant usage on the configuration to authenticated users
grant usage on schema public to authenticated; 