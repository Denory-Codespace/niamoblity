-- ============================================================================== 
-- nia mobility - Migration Patch SQL
-- Developed by Denory Codespace
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- Safe to re-run — all statements use IF NOT EXISTS / IF EXISTS guards.
-- ==============================================================================

-- SECTION 1: ADD MISSING COLUMNS
-- ============================================================

-- avatar_url on users (for profile photo syncing)
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL;

-- avatar_url on drivers (driver photo)
ALTER TABLE IF EXISTS drivers ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL;

-- phone on partners (for contact display)
ALTER TABLE IF EXISTS partners ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NULL;

-- Fix verification_documents: app sends file_url not file_path, and no mime_type
ALTER TABLE IF EXISTS verification_documents ADD COLUMN IF NOT EXISTS file_url TEXT NULL;
ALTER TABLE IF EXISTS verification_documents ALTER COLUMN file_path DROP NOT NULL;
ALTER TABLE IF EXISTS verification_documents ALTER COLUMN mime_type DROP NOT NULL;

-- Attachment support on messages (for file/media sharing in chat)
ALTER TABLE IF EXISTS messages ADD COLUMN IF NOT EXISTS attachment_name TEXT NULL;
ALTER TABLE IF EXISTS messages ADD COLUMN IF NOT EXISTS attachment_url  TEXT NULL;
ALTER TABLE IF EXISTS messages ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(20) NULL;


-- SECTION 2: ENSURE ALL TABLES EXIST
-- ============================================================

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

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    attachment_name TEXT NULL,
    attachment_url TEXT NULL,
    attachment_type VARCHAR(20) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    user_role VARCHAR(20) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    reference_id TEXT NULL,
    amount_kes NUMERIC(10,2) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    mpesa_receipt_number VARCHAR(100) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- SECTION 3: DISABLE RLS ON ALL TABLES
-- The app manages auth itself. RLS blocks anon key reads — must be OFF.
-- ============================================================

ALTER TABLE IF EXISTS users                  DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles               DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS drivers                DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS partners               DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicles               DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicle_listings       DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS applications           DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agreements             DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS verification_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations          DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages               DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications          DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_transactions   DISABLE ROW LEVEL SECURITY;


-- SECTION 4: GRANT FULL ACCESS TO ANON + AUTHENTICATED ROLES
-- ============================================================

GRANT ALL ON ALL TABLES    IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL ROUTINES  IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES    IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;


-- SECTION 5: REALTIME PUBLICATION
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

DO $$
DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users','profiles','drivers','partners','vehicles',
    'vehicle_listings','applications','agreements',
    'verification_documents','conversations','messages',
    'notifications','payment_transactions'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename=tbl
    ) THEN
      BEGIN
        EXECUTE format('ALTER PUBLICATION %I ADD TABLE %I.%I','supabase_realtime','public',tbl);
      EXCEPTION WHEN OTHERS THEN NULL;
      END;
    END IF;
  END LOOP;
END $$;


-- SECTION 6: PERFORMANCE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_listings_county_status ON vehicle_listings(county, status);
CREATE INDEX IF NOT EXISTS idx_applications_driver    ON applications(driver_id);
CREATE INDEX IF NOT EXISTS idx_applications_partner   ON applications(partner_id);
CREATE INDEX IF NOT EXISTS idx_agreements_status      ON agreements(status);
CREATE INDEX IF NOT EXISTS idx_messages_conv          ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user     ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verif_docs_user        ON verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_partner       ON vehicles(partner_id);
CREATE INDEX IF NOT EXISTS idx_listings_partner       ON vehicle_listings(partner_id);
CREATE INDEX IF NOT EXISTS idx_payment_user           ON payment_transactions(user_id);

-- ==============================================================================
-- DONE — nia mobility Migration Patch Applied
-- ==============================================================================
