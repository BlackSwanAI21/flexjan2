export function validateEnv() {
  const required = [
    'NODE_ENV',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'WEBHOOK_SECRET',
    'ALLOWED_ORIGINS'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
} 