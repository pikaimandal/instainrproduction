import { supabase, supabaseAdmin } from '@/lib/supabase';
import { NewTransaction, Transaction, TransactionStatus } from '@/types/database';

/**
 * Get all transactions for a user
 */
export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data as Transaction[];
}

/**
 * Get a transaction by reference ID
 */
export async function getTransactionByReferenceId(referenceId: string): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('reference_id', referenceId)
    .single();

  if (error) {
    console.error('Error fetching transaction by reference ID:', error);
    return null;
  }

  return data as Transaction;
}

/**
 * Create a new transaction (admin only function)
 */
export async function createTransaction(transaction: NewTransaction): Promise<Transaction | null> {
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .insert([transaction])
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    return null;
  }

  return data as Transaction;
}

/**
 * Update a transaction status (admin only function)
 */
export async function updateTransactionStatus(
  referenceId: string,
  status: TransactionStatus,
  transactionHash?: string
): Promise<Transaction | null> {
  const updates: any = { status };
  
  if (transactionHash) {
    updates.transaction_hash = transactionHash;
  }

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .update(updates)
    .eq('reference_id', referenceId)
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction status:', error);
    return null;
  }

  return data as Transaction;
}

/**
 * Get transaction count for a user in the last X days
 */
export async function getRecentTransactionCount(userId: string, days: number = 30): Promise<number> {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);

  const { count, error } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'success')
    .gte('created_at', dateFrom.toISOString());

  if (error) {
    console.error('Error counting recent transactions:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get total transaction volume for a user 
 */
export async function getTotalTransactionVolume(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('transactions')
    .select('token_amount')
    .eq('user_id', userId)
    .eq('status', 'success');

  if (error) {
    console.error('Error calculating transaction volume:', error);
    return 0;
  }

  return data.reduce((sum, tx) => sum + Number(tx.token_amount), 0);
} 