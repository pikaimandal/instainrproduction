import { createClient } from '@supabase/supabase-js';

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log warning if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables:',
    !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : '',
    !supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : ''
  );
}

// For client-side usage - use empty strings as fallbacks to prevent runtime errors
// but log a warning if we're in development
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Helper function to check if Supabase is properly initialized
export const isSupabaseInitialized = () => {
  return !!supabaseUrl && !!supabaseAnonKey;
};

// For server-side operations that require higher privileges (admin)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const supabaseAdmin = createClient(
  supabaseUrl || '', 
  supabaseServiceKey || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

export default supabase; 