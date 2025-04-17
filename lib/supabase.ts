import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create a variable to hold the Supabase client but don't initialize it yet
let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

// Helper function to check if Supabase environment variables are present
export const isSupabaseInitialized = (): boolean => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// Function to initialize Supabase only when needed
const initSupabase = (): SupabaseClient | null => {
  // If we've already initialized it, return the instance
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If either is missing, log a warning and return null
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables:',
      !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : '',
      !supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : ''
    );
    return null;
  }

  // Only create the client if both URL and key are available
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return supabaseInstance;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return null;
  }
};

// Function to initialize Supabase Admin only when needed
const initSupabaseAdmin = (): SupabaseClient | null => {
  // If we've already initialized it, return the instance
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // If either is missing, log a warning and return null
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Missing Supabase admin environment variables:',
      !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : '',
      !supabaseServiceKey ? 'SUPABASE_SERVICE_ROLE_KEY' : ''
    );
    return null;
  }

  // Only create the admin client if both URL and service key are available
  try {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    return supabaseAdminInstance;
  } catch (error) {
    console.error('Error initializing Supabase admin client:', error);
    return null;
  }
};

// Proxy to safely handle Supabase operations
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    // Initialize Supabase on first use
    const client = initSupabase();
    
    // If client couldn't be initialized, return a dummy function that returns empty results
    if (!client) {
      // If attempting to access a method that returns a query builder
      if (['from', 'rpc', 'storage'].includes(prop as string)) {
        return () => ({
          select: () => ({ data: null, error: { message: 'Supabase not initialized' } }),
          insert: () => ({ data: null, error: { message: 'Supabase not initialized' } }),
          update: () => ({ data: null, error: { message: 'Supabase not initialized' } }),
          delete: () => ({ data: null, error: { message: 'Supabase not initialized' } }),
          eq: () => ({ data: null, error: { message: 'Supabase not initialized' } }),
          neq: () => ({ data: null, error: { message: 'Supabase not initialized' } }),
          single: () => ({ data: null, error: { message: 'Supabase not initialized' } }),
          order: () => ({ data: null, error: { message: 'Supabase not initialized' } }),
        });
      }
      
      // Return a dummy value for other properties
      return () => ({ data: null, error: { message: 'Supabase not initialized' } });
    }
    
    // Return the actual Supabase property
    return client[prop as keyof SupabaseClient];
  }
});

// Proxy to safely handle Supabase Admin operations
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    // Initialize Supabase Admin on first use
    const client = initSupabaseAdmin();
    
    // If client couldn't be initialized, return a dummy function that returns empty results
    if (!client) {
      // If attempting to access a method that returns a query builder
      if (['from', 'rpc', 'storage'].includes(prop as string)) {
        return () => ({
          select: () => ({ data: null, error: { message: 'Supabase Admin not initialized' } }),
          insert: () => ({ data: null, error: { message: 'Supabase Admin not initialized' } }),
          update: () => ({ data: null, error: { message: 'Supabase Admin not initialized' } }),
          delete: () => ({ data: null, error: { message: 'Supabase Admin not initialized' } }),
          eq: () => ({ data: null, error: { message: 'Supabase Admin not initialized' } }),
          neq: () => ({ data: null, error: { message: 'Supabase Admin not initialized' } }),
          single: () => ({ data: null, error: { message: 'Supabase Admin not initialized' } }),
          order: () => ({ data: null, error: { message: 'Supabase Admin not initialized' } }),
        });
      }
      
      // Return a dummy value for other properties
      return () => ({ data: null, error: { message: 'Supabase Admin not initialized' } });
    }
    
    // Return the actual Supabase property
    return client[prop as keyof SupabaseClient];
  }
});

export default supabase; 