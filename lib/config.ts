/**
 * Application Configuration
 * 
 * This module centralizes all environment variables and configuration settings.
 * It provides type safety and validation for environment variables.
 */

// Database configuration
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Helper function to check if Supabase can be initialized
  isInitialized: function(): boolean {
    return !!(this.url && this.anonKey);
  },
  
  // Helper function to check if Supabase Admin can be initialized
  isAdminInitialized: function(): boolean {
    return !!(this.url && this.serviceRoleKey);
  },
  
  // Get required environment variables or throw helpful errors
  getRequiredConfig: function() {
    if (!this.url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
    if (!this.anonKey) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
    
    return {
      url: this.url,
      anonKey: this.anonKey,
    };
  },
  
  // Get admin configuration or throw helpful errors
  getRequiredAdminConfig: function() {
    if (!this.url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
    if (!this.serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
    
    return {
      url: this.url,
      serviceRoleKey: this.serviceRoleKey,
    };
  }
};

// World App configuration
export const worldAppConfig = {
  appId: process.env.NEXT_PUBLIC_WORLD_APP_ID || '',
  developerApiKey: process.env.WORLDCOIN_DEVELOPER_API_KEY || '',
  
  // Helper function to check if World App can be initialized
  isInitialized: function(): boolean {
    return !!this.appId;
  },
  
  // Helper function to check if developer API is available
  isApiInitialized: function(): boolean {
    return !!this.developerApiKey;
  }
};

// Payment configuration
export const paymentConfig = {
  recipientAddress: process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS || '',
  
  isConfigured: function(): boolean {
    return !!this.recipientAddress;
  }
};

// Helper to check if all required configuration is available
export function checkRequiredConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  if (!supabaseConfig.url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseConfig.anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!worldAppConfig.appId) missing.push('NEXT_PUBLIC_WORLD_APP_ID');
  
  return {
    valid: missing.length === 0,
    missing
  };
}

// Export all config as default for convenience
export default {
  supabase: supabaseConfig,
  worldApp: worldAppConfig,
  payment: paymentConfig,
  checkRequiredConfig
}; 