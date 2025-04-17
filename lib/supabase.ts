import { createClient } from '@supabase/supabase-js';

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Throw clear error messages in development but use sensible defaults in production
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:',
    !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : '',
    !supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : ''
  );
  
  // Only throw in development to prevent crashing the production app
  if (process.env.NODE_ENV === 'development') {
    throw new Error('Missing required Supabase environment variables. Check .env.local file.');
  }
}

// For client-side usage - use empty strings as fallbacks to prevent runtime errors
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);

// For server-side operations that require higher privileges (admin)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const supabaseAdmin = createClient(
  supabaseUrl || '', 
  supabaseServiceKey || ''
);

export default supabase; 