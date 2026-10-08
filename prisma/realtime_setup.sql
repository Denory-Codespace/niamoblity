-- ==============================================================================
-- nia mobility - Supabase Realtime, Messaging & Notifications Setup
-- Developed by Denory Codespace
-- Target: Real-time Kenyan Mobility Marketplace
-- ==============================================================================

-- 1. Create Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    driver_id TEXT NOT NULL,
    partner_id TEXT NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    partner_name VARCHAR(255) NOT NULL,
    listing_id TEXT NULL,
    listing_title VARCHAR(255) NULL,
    last_message TEXT NULL,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    unread_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Notifications Table (user_id is TEXT to support specific user UUIDs and system-wide broadcast 'ALL')
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    is_read BOOLEAN DEFAULT FALSE,
    link_url TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Disable RLS for rapid development & testing
ALTER TABLE IF EXISTS conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS drivers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicle_listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agreements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS verification_documents DISABLE ROW LEVEL SECURITY;

-- 5. Enable Supabase Realtime Publication
-- This allows Supabase websockets to push live updates to the frontend
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE 
  users, 
  profiles, 
  drivers, 
  partners, 
  vehicles, 
  vehicle_listings, 
  applications, 
  agreements, 
  conversations, 
  messages, 
  notifications;
