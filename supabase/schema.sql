-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  mobile_number TEXT,
  aadhaar_number TEXT,
  pan_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wallet_address_check CHECK (char_length(wallet_address) > 0)
);

-- Create payment_methods table
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  method_type TEXT NOT NULL CHECK (method_type IN ('bank', 'upi')),
  
  -- Bank fields
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  account_holder_name TEXT,
  
  -- UPI fields
  upi_id TEXT,
  upi_app TEXT,
  upi_mobile_number TEXT,
  
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reference_id TEXT NOT NULL UNIQUE,
  sender_wallet_address TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  token_amount NUMERIC(28, 18) NOT NULL,
  inr_amount NUMERIC(16, 2),
  transaction_hash TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" 
ON public.users FOR SELECT 
USING (wallet_address = auth.jwt()->>'wallet_address');

CREATE POLICY "Users can update their own data" 
ON public.users FOR UPDATE 
USING (wallet_address = auth.jwt()->>'wallet_address');

-- Create policies for payment_methods table
CREATE POLICY "Users can view their own payment methods" 
ON public.payment_methods FOR SELECT 
USING (user_id IN (SELECT id FROM public.users WHERE wallet_address = auth.jwt()->>'wallet_address'));

CREATE POLICY "Users can insert their own payment methods" 
ON public.payment_methods FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.users WHERE wallet_address = auth.jwt()->>'wallet_address'));

CREATE POLICY "Users can update their own payment methods" 
ON public.payment_methods FOR UPDATE 
USING (user_id IN (SELECT id FROM public.users WHERE wallet_address = auth.jwt()->>'wallet_address'));

CREATE POLICY "Users can delete their own payment methods" 
ON public.payment_methods FOR DELETE 
USING (user_id IN (SELECT id FROM public.users WHERE wallet_address = auth.jwt()->>'wallet_address'));

-- Create policies for transactions table
CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT 
USING (user_id IN (SELECT id FROM public.users WHERE wallet_address = auth.jwt()->>'wallet_address'));

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create function to find or create user by wallet address
CREATE OR REPLACE FUNCTION public.find_or_create_user_by_wallet(p_wallet_address TEXT)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if user exists
  SELECT id INTO v_user_id FROM public.users WHERE wallet_address = p_wallet_address;
  
  -- If not exists, create a new placeholder user
  IF v_user_id IS NULL THEN
    INSERT INTO public.users (wallet_address, full_name) 
    VALUES (p_wallet_address, 'New User') 
    RETURNING id INTO v_user_id;
  END IF;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 