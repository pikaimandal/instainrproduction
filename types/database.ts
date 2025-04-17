export interface User {
  id: string;
  wallet_address: string;
  full_name: string;
  email?: string;
  mobile_number?: string;
  aadhaar_number?: string;
  pan_number?: string;
  created_at: string;
  updated_at: string;
}

export type PaymentMethodType = 'bank' | 'upi';
export type UpiApp = 'gpay' | 'phonepe' | 'paytm' | 'bhim';
export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface PaymentMethod {
  id: string;
  user_id: string;
  method_type: PaymentMethodType;
  
  // Bank fields
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  account_holder_name?: string;
  
  // UPI fields
  upi_id?: string;
  upi_app?: UpiApp;
  upi_mobile_number?: string;
  
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  reference_id: string;
  sender_wallet_address: string;
  recipient_address: string;
  token_symbol: string;
  token_amount: number;
  inr_amount?: number;
  transaction_hash?: string;
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
}

export interface NewUser {
  wallet_address: string;
  full_name: string;
  email?: string;
  mobile_number?: string;
  aadhaar_number?: string;
  pan_number?: string;
}

export interface BankDetails {
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
}

export interface UpiDetails {
  upi_id: string;
  upi_app: UpiApp;
  upi_mobile_number: string;
}

export interface NewPaymentMethod {
  user_id: string;
  method_type: PaymentMethodType;
  bank_details?: BankDetails;
  upi_details?: UpiDetails;
  is_default?: boolean;
}

export interface NewTransaction {
  user_id: string;
  reference_id: string;
  sender_wallet_address: string;
  recipient_address: string;
  token_symbol: string;
  token_amount: number;
  inr_amount?: number;
  transaction_hash?: string;
  status: TransactionStatus;
} 