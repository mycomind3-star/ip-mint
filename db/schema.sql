-- IP Mint Database Schema
-- Run this against your Supabase (or any PostgreSQL) database

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  wallet_address TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'creator', 'founder', 'agency')),
  mints_used INTEGER NOT NULL DEFAULT 0,
  mints_reset_date TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Mints
CREATE TABLE IF NOT EXISTS mints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  token_id INTEGER UNIQUE NOT NULL,
  content_hash TEXT NOT NULL,
  content_preview TEXT NOT NULL DEFAULT '',
  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'file')),
  ipfs_uri TEXT NOT NULL DEFAULT '',
  tx_hash TEXT NOT NULL DEFAULT '',
  network TEXT NOT NULL DEFAULT 'polygon',
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- NextAuth accounts (for OAuth/email providers)
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  type TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  UNIQUE (provider, provider_account_id)
);

-- NextAuth sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mints_user_id ON mints (user_id);
CREATE INDEX IF NOT EXISTS idx_mints_content_hash ON mints (content_hash);
CREATE INDEX IF NOT EXISTS idx_mints_token_id ON mints (token_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users (wallet_address);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (session_token);
