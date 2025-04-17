import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

// Create a variable to hold the Supabase client but don't initialize it yet
let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

// Helper function to check if Supabase environment variables are present
export const isSupabaseInitialized = (): boolean => {
  return supabaseConfig.isInitialized();
};

// Function to initialize Supabase only when needed
const initSupabase = (): SupabaseClient | null => {
  // If we've already initialized it, return the instance
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Check if Supabase can be initialized
  if (!supabaseConfig.isInitialized()) {
    console.warn('Supabase cannot be initialized: missing configuration');
    return null;
  }

  // Only create the client if both URL and key are available
  try {
    const { url, anonKey } = supabaseConfig.getRequiredConfig();
    supabaseInstance = createClient(url, anonKey, {
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

  // Check if Supabase Admin can be initialized
  if (!supabaseConfig.isAdminInitialized()) {
    console.warn('Supabase Admin cannot be initialized: missing configuration');
    return null;
  }

  // Only create the admin client if both URL and service key are available
  try {
    const { url, serviceRoleKey } = supabaseConfig.getRequiredAdminConfig();
    supabaseAdminInstance = createClient(url, serviceRoleKey, {
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