import { supabase } from '../lib/supabase';

export async function cleanupLocalStorage() {
  // Clear all Supabase-related items from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('sb-')) {
      localStorage.removeItem(key);
    }
  }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, metadata: {
  first_name: string;
  last_name: string;
  company_name: string;
}) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  
  if (authError) throw authError;

  // Create profile record
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: metadata.first_name,
        last_name: metadata.last_name,
        company_name: metadata.company_name
      });

    if (profileError) throw profileError;
  }

  return authData;
}

export async function signOut() {
  await supabase.auth.signOut();
  await cleanupLocalStorage();
}