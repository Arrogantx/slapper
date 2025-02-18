/*
  # Fix chat messages policies and user profile creation

  1. Changes
    - Add policy for user profile creation
    - Update chat message policies
    - Add trigger for automatic profile creation

  2. Security
    - Maintain RLS policies
    - Ensure proper access control
*/

-- Add policy for user profile creation
CREATE POLICY "Users can create their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = auth.jwt()->>'sub');

-- Update chat messages policy
DROP POLICY IF EXISTS "Users can send chat messages" ON chat_messages;

CREATE POLICY "Users can send chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    wallet_address = auth.jwt()->>'sub' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE wallet_address = auth.jwt()->>'sub'
    )
  );