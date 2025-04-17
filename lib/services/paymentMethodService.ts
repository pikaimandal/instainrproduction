import { supabase } from '@/lib/supabase';
import { NewPaymentMethod, PaymentMethod, BankDetails, UpiDetails } from '@/types/database';

/**
 * Get all payment methods for a user
 */
export async function getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  if (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }

  return data as PaymentMethod[];
}

/**
 * Get default payment method for a user
 */
export async function getDefaultPaymentMethod(userId: string): Promise<PaymentMethod | null> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    console.error('Error fetching default payment method:', error);
    return null;
  }

  return data as PaymentMethod;
}

/**
 * Add a bank payment method
 */
export async function addBankPaymentMethod(
  userId: string, 
  bankDetails: BankDetails, 
  isDefault: boolean = false
): Promise<PaymentMethod | null> {
  // If setting this as default, first unset all existing defaults
  if (isDefault) {
    await unsetDefaultPaymentMethods(userId);
  }

  const paymentMethod: NewPaymentMethod = {
    user_id: userId,
    method_type: 'bank',
    bank_details: bankDetails,
    is_default: isDefault
  };

  const { data, error } = await supabase
    .from('payment_methods')
    .insert([{
      user_id: userId,
      method_type: 'bank',
      bank_name: bankDetails.bank_name,
      account_number: bankDetails.account_number,
      ifsc_code: bankDetails.ifsc_code,
      account_holder_name: bankDetails.account_holder_name,
      is_default: isDefault
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding bank payment method:', error);
    return null;
  }

  return data as PaymentMethod;
}

/**
 * Add a UPI payment method
 */
export async function addUpiPaymentMethod(
  userId: string, 
  upiDetails: UpiDetails,
  isDefault: boolean = false
): Promise<PaymentMethod | null> {
  // If setting this as default, first unset all existing defaults
  if (isDefault) {
    await unsetDefaultPaymentMethods(userId);
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .insert([{
      user_id: userId,
      method_type: 'upi',
      upi_id: upiDetails.upi_id,
      upi_app: upiDetails.upi_app,
      upi_mobile_number: upiDetails.upi_mobile_number,
      is_default: isDefault
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding UPI payment method:', error);
    return null;
  }

  return data as PaymentMethod;
}

/**
 * Update payment method
 */
export async function updatePaymentMethod(
  paymentMethodId: string,
  updates: Partial<PaymentMethod>
): Promise<PaymentMethod | null> {
  const { data, error } = await supabase
    .from('payment_methods')
    .update(updates)
    .eq('id', paymentMethodId)
    .select()
    .single();

  if (error) {
    console.error('Error updating payment method:', error);
    return null;
  }

  return data as PaymentMethod;
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', paymentMethodId);

  if (error) {
    console.error('Error deleting payment method:', error);
    return false;
  }

  return true;
}

/**
 * Set a payment method as default
 */
export async function setDefaultPaymentMethod(paymentMethodId: string, userId: string): Promise<boolean> {
  // First unset all existing defaults
  await unsetDefaultPaymentMethods(userId);

  // Then set this one as default
  const { error } = await supabase
    .from('payment_methods')
    .update({ is_default: true })
    .eq('id', paymentMethodId);

  if (error) {
    console.error('Error setting default payment method:', error);
    return false;
  }

  return true;
}

/**
 * Unset all default payment methods for a user
 */
async function unsetDefaultPaymentMethods(userId: string): Promise<void> {
  const { error } = await supabase
    .from('payment_methods')
    .update({ is_default: false })
    .eq('user_id', userId)
    .eq('is_default', true);

  if (error) {
    console.error('Error unsetting default payment methods:', error);
  }
} 