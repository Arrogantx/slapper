/*
  # Update chat messages table to use wallet_address

  1. Changes
    - Modify chat_messages table to use wallet_address instead of user_id UUID
    - Update foreign key relationship
    - Update RLS policies

  2. Security
    - Maintain RLS policies for chat messages
    - Ensure proper access control
*/

-- Modify chat_messages table
ALTER TABLE chat_messages DROP CONSTRAINT chat_messages_user_id_fkey;
ALTER TABLE chat_messages DROP COLUMN user_id;
ALTER TABLE chat_messages ADD COLUMN wallet_address text NOT NULL;

-- Add foreign key constraint
ALTER TABLE chat_messages 
  ADD CONSTRAINT chat_messages_wallet_address_fkey 
  FOREIGN KEY (wallet_address) 
  REFERENCES user_profiles(wallet_address);

-- Update policies
DROP POLICY IF EXISTS "Chat messages are viewable by everyone" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can send chat messages" ON chat_messages;

CREATE POLICY "Chat messages are viewable by everyone"
  ON chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Users can send chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = auth.jwt()->>'sub');