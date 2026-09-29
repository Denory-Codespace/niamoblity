-- ==============================================================================
-- nia mobility - Production PostgreSQL / Supabase Schema DDL
-- Developed by Denory Codespace
-- Target: Kenyan Mobility Ecosystem
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE user_role AS ENUM ('DRIVER', 'PARTNER', 'ADMIN', 'SUPPORT');
CREATE TYPE verification_status AS ENUM ('UNVERIFIED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');
CREATE TYPE arrangement_type AS ENUM ('DAILY_TARGET', 'WEEKLY_TARGET', 'MONTHLY_TARGET', 'REVENUE_SHARE', 'OTHER');
CREATE TYPE payment_frequency AS ENUM ('DAILY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY');
CREATE TYPE responsibility_type AS ENUM ('DRIVER', 'PARTNER', 'SHARED', 'SHARED_50_50');
CREATE TYPE vehicle_type AS ENUM ('SEDAN', 'HATCHBACK', 'SUV', 'VAN', 'MOTORCYCLE', 'BOX_TRUCK');
CREATE TYPE transmission_type AS ENUM ('AUTOMATIC', 'MANUAL');
CREATE TYPE fuel_type AS ENUM ('PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC');
CREATE TYPE listing_status AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED', 'EXPIRED');
CREATE TYPE application_status AS ENUM ('SUBMITTED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED');
CREATE TYPE agreement_status AS ENUM ('DRAFT', 'PENDING_DRIVER', 'PENDING_PARTNER', 'ACTIVE', 'SUSPENDED', 'COMPLETED', 'TERMINATED', 'DISPUTED');

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'DRIVER',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

-- 2. Profiles Table
CREATE TABLE profiles (
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

-- 3. Drivers Table
CREATE TABLE drivers (
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

-- 4. Partners Table
CREATE TABLE partners (
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

-- 5. Vehicles Table
CREATE TABLE vehicles (
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

-- 6. Vehicle Listings Table
CREATE TABLE vehicle_listings (
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

-- 7. Applications Table
CREATE TABLE applications (
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

-- 8. Agreements Table
CREATE TABLE agreements (
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

-- 9. Verification Documents Vault
CREATE TABLE verification_documents (
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

-- Performance Indexes
CREATE INDEX idx_listings_county_status ON vehicle_listings(county, status);
CREATE INDEX idx_applications_driver ON applications(driver_id);
CREATE INDEX idx_applications_partner ON applications(partner_id);
CREATE INDEX idx_agreements_status ON agreements(status);
