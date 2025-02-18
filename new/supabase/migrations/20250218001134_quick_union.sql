/*
  # Fix chat messages policies and user profile creation

  1. Changes
    - Add trigger to auto-create user profile on first message
    - Update chat message policies to ensure user profile exists
    - Add function to handle user profile creation

  2. Security
    - Maintain RLS policies
    - Ensure proper access control for chat messages
*/

-- Function to ensure user profile exists
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (wallet_address)
  VALUES (NEW.wallet_address)
  ON CONFLICT (wallet_address) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create user profile before chat message
CREATE TRIGGER ensure_user_profile_before_chat
  BEFORE INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION ensure_user_profile();

-- Update chat message policies
DROP POLICY IF EXISTS "Users can send chat messages" ON chat_messages;

CREATE POLICY "Users can send chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    wallet_address = auth.jwt()->>'sub'
  );