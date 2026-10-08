-- ==============================================================================
-- nia mobility - Complete Supabase Master Setup (Tables, Realtime & Messaging)
-- Developed by Denory Codespace
-- Target: Real-time Kenyan Mobility Ecosystem
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Open your Supabase Project Dashboard
-- 2. Go to: SQL Editor -> New Query
-- 3. Paste this entire script and click "Run"
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ENUMS (Safe creation)
-- ------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('DRIVER', 'PARTNER', 'ADMIN', 'SUPPORT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('UNVERIFIED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE arrangement_type AS ENUM ('DAILY_TARGET', 'WEEKLY_TARGET', 'MONTHLY_TARGET', 'REVENUE_SHARE', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_frequency AS ENUM ('DAILY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE responsibility_type AS ENUM ('DRIVER', 'PARTNER', 'SHARED', 'SHARED_50_50');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_type AS ENUM ('SEDAN', 'HATCHBACK', 'SUV', 'VAN', 'MOTORCYCLE', 'BOX_TRUCK');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE transmission_type AS ENUM ('AUTOMATIC', 'MANUAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE fuel_type AS ENUM ('PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('SUBMITTED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE agreement_status AS ENUM ('DRAFT', 'PENDING_DRIVER', 'PENDING_PARTNER', 'ACTIVE', 'SUSPENDED', 'COMPLETED', 'TERMINATED', 'DISPUTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ------------------------------------------------------------------------------
-- 2. CORE MARKETPLACE TABLES
-- ------------------------------------------------------------------------------

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NULL,
    role user_role NOT NULL DEFAULT 'DRIVER',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

-- Ensure password column exists if table was created previously
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NULL;

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT NULL,
    location_county VARCHAR(100) DEFAULT 'Nairobi',
    location_subcounty VARCHAR(100) NULL,
    bio TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    driving_experience_years INT DEFAULT 0,
    preferred_operating_areas TEXT[] DEFAULT '{}',
    preferred_platforms TEXT[] DEFAULT '{}',
    preferred_vehicle_types vehicle_type[] DEFAULT '{}',
    preferred_arrangement_types arrangement_type[] DEFAULT '{}',
    max_daily_target_kes NUMERIC(10,2) NULL,
    available_from TIMESTAMPTZ DEFAULT NOW(),
    is_available BOOLEAN DEFAULT TRUE,
    rating_avg NUMERIC(3,2) DEFAULT 5.0,
    rating_count INT DEFAULT 0,
    completed_engagements_count INT DEFAULT 0,
    identity_verified BOOLEAN DEFAULT FALSE,
    license_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partners Table
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    partner_type VARCHAR(50) DEFAULT 'INDIVIDUAL',
    company_name VARCHAR(255) NULL,
    rating_avg NUMERIC(3,2) DEFAULT 5.0,
    rating_count INT DEFAULT 0,
    total_vehicles_count INT DEFAULT 0,
    active_agreements_count INT DEFAULT 0,
    identity_verified BOOLEAN DEFAULT FALSE,
    business_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type vehicle_type NOT NULL DEFAULT 'SEDAN',
    transmission transmission_type NOT NULL DEFAULT 'AUTOMATIC',
    fuel_type fuel_type NOT NULL DEFAULT 'PETROL',
    seating_capacity INT DEFAULT 4,
    color VARCHAR(50) NOT NULL,
    mileage_km INT NULL,
    primary_county VARCHAR(100) DEFAULT 'Nairobi',
    primary_subcounty VARCHAR(100) NULL,
    supported_platforms TEXT[] DEFAULT '{"Uber", "Bolt"}',
    photos TEXT[] DEFAULT '{}',
    verification_status verification_status DEFAULT 'UNVERIFIED',
    availability_status VARCHAR(50) DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

-- Vehicle Listings Table
CREATE TABLE IF NOT EXISTS vehicle_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    county VARCHAR(100) DEFAULT 'Nairobi',
    subcounty VARCHAR(100) NULL,
    arrangement_type arrangement_type NOT NULL DEFAULT 'DAILY_TARGET',
    target_amount_kes NUMERIC(10,2) NOT NULL,
    deposit_amount_kes NUMERIC(10,2) DEFAULT 0,
    payment_frequency payment_frequency DEFAULT 'DAILY',
    fuel_responsibility responsibility_type DEFAULT 'DRIVER',
    maintenance_responsibility responsibility_type DEFAULT 'PARTNER',
    insurance_responsibility responsibility_type DEFAULT 'PARTNER',
    preferred_platforms TEXT[] DEFAULT '{}',
    driver_min_experience_years INT DEFAULT 1,
    driver_requirements_summary TEXT NULL,
    available_from TIMESTAMPTZ DEFAULT NOW(),
    status listing_status DEFAULT 'PUBLISHED',
    view_count INT DEFAULT 0,
    applications_count INT DEFAULT 0,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES vehicle_listings(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    status application_status DEFAULT 'SUBMITTED',
    cover_note TEXT NULL,
    match_score_pct INT DEFAULT 0,
    status_reason TEXT NULL,
    last_status_changed_by UUID REFERENCES users(id),
    last_status_changed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agreements Table
CREATE TABLE IF NOT EXISTS agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_number VARCHAR(100) UNIQUE NOT NULL,
    application_id UUID REFERENCES applications(id),
    listing_id UUID REFERENCES vehicle_listings(id),
    driver_id UUID REFERENCES drivers(id),
    partner_id UUID REFERENCES partners(id),
    vehicle_id UUID REFERENCES vehicles(id),
    arrangement_type arrangement_type NOT NULL,
    target_amount_kes NUMERIC(10,2) NOT NULL,
    deposit_amount_kes NUMERIC(10,2) NOT NULL,
    payment_frequency payment_frequency NOT NULL,
    fuel_terms TEXT NOT NULL,
    maintenance_terms TEXT NOT NULL,
    insurance_terms TEXT NOT NULL,
    operating_area VARCHAR(255) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NULL,
    terms_and_conditions TEXT NOT NULL,
    status agreement_status DEFAULT 'PENDING_DRIVER',
    partner_signed_at TIMESTAMPTZ NULL,
    driver_signed_at TIMESTAMPTZ NULL,
    termination_reason TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification Documents Table
CREATE TABLE IF NOT EXISTS verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_number VARCHAR(100) NULL,
    file_path TEXT NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    status verification_status DEFAULT 'UNDER_REVIEW',
    rejection_reason TEXT NULL,
    verified_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. REAL-TIME CHAT & NOTIFICATIONS TABLES
-- ------------------------------------------------------------------------------

-- Conversations Table
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

-- Messages Table
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

-- Notifications Table (user_id is TEXT for user UUIDs and system broadcast 'ALL')
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

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) CONFIGURATION
-- ------------------------------------------------------------------------------
-- Disable RLS across all tables to allow the client to read and write without JWT blocks
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS drivers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicle_listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agreements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS verification_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 5. SUPABASE REALTIME PUBLICATION
-- ------------------------------------------------------------------------------
-- Enable Supabase Realtime publication so websockets push live data instantly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'users',
    'profiles',
    'drivers',
    'partners',
    'vehicles',
    'vehicle_listings',
    'applications',
    'agreements',
    'conversations',
    'messages',
    'notifications'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = tbl
    ) THEN
      EXECUTE format(
        'ALTER PUBLICATION %I ADD TABLE %I.%I',
        'supabase_realtime',
        'public',
        tbl
      );
    END IF;
  END LOOP;
END $$;
-- ------------------------------------------------------------------------------
-- 6. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_listings_county_status ON vehicle_listings(county, status);
CREATE INDEX IF NOT EXISTS idx_applications_driver ON applications(driver_id);
CREATE INDEX IF NOT EXISTS idx_applications_partner ON applications(partner_id);
CREATE INDEX IF NOT EXISTS idx_agreements_status ON agreements(status);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
