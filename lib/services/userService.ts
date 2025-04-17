import { supabase, supabaseAdmin } from '@/lib/supabase';
import { NewUser, User } from '@/types/database';

/**
 * Find a user by wallet address
 */
export async function getUserByWalletAddress(walletAddress: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error) {
      console.error('Error fetching user by wallet address:', error);
      return null;
    }

    return data as User;
  } catch (err) {
    console.error('Exception in getUserByWalletAddress:', err);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: NewUser): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data as User;
  } catch (err) {
    console.error('Exception in createUser:', err);
    return null;
  }
}

/**
 * Update user information
 */
export async function updateUser(userId: string, userData: Partial<NewUser>): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data as User;
  } catch (err) {
    console.error('Exception in updateUser:', err);
    return null;
  }
}

/**
 * Find or create a user by wallet address (admin function)
 * This uses the admin client to bypass RLS policies
 */
export async function findOrCreateUserByWalletAddress(walletAddress: string): Promise<User | null> {
  try {
    // Check if supabaseAdmin is initialized
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is missing - trying to use regular client');
      // Fallback to regular client if admin key is missing
      return await getUserByWalletAddress(walletAddress);
    }

    // First try to get the user
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user with admin client:', fetchError);
      // Try with regular client as fallback
      return await getUserByWalletAddress(walletAddress);
    }

    if (existingUser) {
      return existingUser as User;
    }

    // If user doesn't exist, create a new one with minimal data
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert([{ wallet_address: walletAddress, full_name: 'New User' }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating user with admin client:', createError);
      return null;
    }

    return newUser as User;
  } catch (err) {
    console.error('Exception in findOrCreateUserByWalletAddress:', err);
    return null;
  }
}

/**
 * Check if a user has completed their profile
 */
export function isUserProfileComplete(user: User): boolean {
  return !!(
    user.full_name && 
    user.full_name !== 'New User' && 
    user.email && 
    user.mobile_number && 
    user.aadhaar_number && 
    user.pan_number
  );
} 