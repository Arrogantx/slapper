/*
  # Pre-sale System Schema

  1. New Tables
    - `admin_addresses`
      - `address` (text, primary key) - Admin wallet addresses
      - `created_at` (timestamp)
    
    - `presale_requests`
      - `id` (uuid, primary key)
      - `wallet_address` (text) - User's wallet address
      - `twitter_handle` (text) - User's Twitter handle
      - `status` (text) - Status of the request (pending/approved/denied)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `presale_deposits`
      - `id` (uuid, primary key)
      - `wallet_address` (text) - User's wallet address
      - `amount` (numeric) - Amount of AVAX deposited
      - `tx_hash` (text) - Transaction hash
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access and user access
*/

-- Admin addresses table
CREATE TABLE admin_addresses (
  address text PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

-- Presale requests table
CREATE TABLE presale_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  twitter_handle text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Presale deposits table
CREATE TABLE presale_deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  amount numeric NOT NULL,
  tx_hash text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE presale_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE presale_deposits ENABLE ROW LEVEL SECURITY;

-- Policies for admin_addresses
CREATE POLICY "Admin addresses are publicly readable"
  ON admin_addresses
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for presale_requests
CREATE POLICY "Users can view their own requests"
  ON presale_requests
  FOR SELECT
  TO authenticated
  USING (wallet_address = auth.jwt()->>'sub');

CREATE POLICY "Users can create their own requests"
  ON presale_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = auth.jwt()->>'sub');

CREATE POLICY "Admins can view all requests"
  ON presale_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_addresses 
      WHERE address = auth.jwt()->>'sub'
    )
  );

-- Policies for presale_deposits
CREATE POLICY "Users can view their own deposits"
  ON presale_deposits
  FOR SELECT
  TO authenticated
  USING (wallet_address = auth.jwt()->>'sub');

CREATE POLICY "Users can create their own deposits"
  ON presale_deposits
  FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = auth.jwt()->>'sub');

CREATE POLICY "Admins can view all deposits"
  ON presale_deposits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_addresses 
      WHERE address = auth.jwt()->>'sub'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updating updated_at
CREATE TRIGGER update_presale_requests_updated_at
  BEFORE UPDATE ON presale_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();