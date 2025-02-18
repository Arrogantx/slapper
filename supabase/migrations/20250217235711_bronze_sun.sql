/*
  # Add User Profiles and Chat System

  1. New Tables
    - `user_profiles`
      - Links wallet addresses with X (Twitter) accounts
      - Stores user preferences and stats
    - `chat_messages`
      - Stores trollbox messages
      - Includes timestamps and user references
    - `battle_history`
      - Tracks slap battle outcomes
      - Can be hidden based on user preference

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- User Profiles Table
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  twitter_id text UNIQUE,
  twitter_username text,
  nickname text,
  hide_history boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chat Messages Table
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Battle History Table
CREATE TABLE battle_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES user_profiles(id),
  opponent_id uuid REFERENCES user_profiles(id),
  winner_id uuid REFERENCES user_profiles(id),
  wager_amount numeric,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (wallet_address = auth.jwt()->>'sub')
  WITH CHECK (wallet_address = auth.jwt()->>'sub');

CREATE POLICY "Chat messages are viewable by everyone"
  ON chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can send chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Battle history viewable if not hidden"
  ON battle_history FOR SELECT
  USING (
    NOT EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = battle_history.player_id
      AND hide_history = true
    )
    OR
    auth.jwt()->>'sub' IN (
      SELECT wallet_address FROM user_profiles
      WHERE id IN (battle_history.player_id, battle_history.opponent_id)
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION get_user_stats(user_wallet text)
RETURNS TABLE (
  total_battles bigint,
  wins bigint,
  losses bigint,
  total_wagered numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH user_id AS (
    SELECT id FROM user_profiles WHERE wallet_address = user_wallet
  )
  SELECT 
    COUNT(*)::bigint as total_battles,
    COUNT(CASE WHEN winner_id = user_id.id THEN 1 END)::bigint as wins,
    COUNT(CASE WHEN winner_id != user_id.id THEN 1 END)::bigint as losses,
    COALESCE(SUM(wager_amount), 0) as total_wagered
  FROM battle_history, user_id
  WHERE player_id = user_id.id OR opponent_id = user_id.id;
END;
$$ LANGUAGE plpgsql;