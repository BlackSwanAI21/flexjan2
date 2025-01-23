import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Enable session persistence
    storageKey: 'sb-auth-token', // Key for localStorage
    storage: window.localStorage, // Use localStorage for persistence
    autoRefreshToken: true, // Automatically refresh token
    detectSessionInUrl: true // Detect auth tokens in URL
  }
});

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Handle sign in
    console.log('User signed in:', session?.user?.id);
  } else if (event === 'SIGNED_OUT') {
    // Handle sign out
    console.log('User signed out');
  } else if (event === 'TOKEN_REFRESHED') {
    // Handle token refresh
    console.log('Token refreshed');
  }
});