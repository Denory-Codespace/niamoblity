-- ==============================================================================
-- nia mobility - Complete Supabase Seed Script (Kenyan Mobility Ecosystem)
-- Developed by Denory Codespace
-- Target: Real-world Nairobi Driver & Vehicle Marketplace Dataset
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Open your Supabase Project Dashboard
-- 2. Go to: SQL Editor -> New Query
-- 3. Paste this script and click "Run"
-- ==============================================================================

-- 0. Ensure password column exists on users table
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NULL;

-- 1. SEED USERS (Password for all demo users is: password123)
INSERT INTO users (id, email, phone, password, role, is_active, is_verified, created_at, updated_at)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'admin@niamobility.co.ke', '+254711000111', 'password123', 'ADMIN', true, true, NOW(), NOW()),
    ('b0000000-0000-0000-0000-000000000001', 'kamau.fleet@gmail.com', '+254722334455', 'password123', 'PARTNER', true, true, NOW(), NOW()),
    ('b0000000-0000-0000-0000-000000000002', 'apex.mobility@gmail.com', '+254733445566', 'password123', 'PARTNER', true, true, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000001', 'samuel.mwangi@gmail.com', '+254712345678', 'password123', 'DRIVER', true, true, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000002', 'beatrice.nduta@gmail.com', '+254723456789', 'password123', 'DRIVER', true, true, NOW(), NOW()),
    ('c0000000-0000-0000-0000-000000000003', 'brian.otieno@gmail.com', '+254734567890', 'password123', 'DRIVER', true, true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
    phone = EXCLUDED.phone,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    is_verified = EXCLUDED.is_verified;

-- 2. SEED PROFILES
INSERT INTO profiles (id, user_id, full_name, avatar_url, location_county, location_subcounty, bio, created_at, updated_at)
VALUES
    ('90000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Dennis Mutua', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250', 'Nairobi', 'CBD / Starehe', 'nia mobility Platform Operations Lead', NOW(), NOW()),
    ('90000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Peter Kamau', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250', 'Nairobi', 'Westlands', 'Fleet investor with 4 verified Toyota & Mazda vehicles operating across Nairobi.', NOW(), NOW()),
    ('90000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'David Omondi', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250', 'Nairobi', 'Kilimani', 'Managing Director at Apex Fleet Kenya. Professional PSV & ride-hailing fleet management.', NOW(), NOW()),
    ('90000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Samuel Mwangi', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250', 'Nairobi', 'Westlands', 'Experienced driver with 4+ years on Uber and Bolt. Clean record, 4.9 rating, punctual with daily targets.', NOW(), NOW()),
    ('90000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Beatrice Nduta', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250', 'Nairobi', 'Roysambu', 'Professional female driver, 3 years on ride-hailing platforms. Great with customer care and vehicle upkeep.', NOW(), NOW()),
    ('90000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 'Brian Otieno', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250', 'Nairobi', 'Langata', 'Full-time commercial driver, defensive driving certified. Looking for long-term daily target partnership.', NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    location_county = EXCLUDED.location_county,
    location_subcounty = EXCLUDED.location_subcounty,
    bio = EXCLUDED.bio;

-- 3. SEED PARTNERS
INSERT INTO partners (id, user_id, partner_type, company_name, rating_avg, rating_count, total_vehicles_count, active_agreements_count, identity_verified, business_verified, created_at, updated_at)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'INDIVIDUAL', 'Kamau Fleet Nairobi', 4.90, 18, 4, 3, true, true, NOW(), NOW()),
    ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'COMPANY', 'Apex Fleet Kenya', 5.00, 32, 6, 5, true, true, NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET
    partner_type = EXCLUDED.partner_type,
    company_name = EXCLUDED.company_name,
    rating_avg = EXCLUDED.rating_avg,
    total_vehicles_count = EXCLUDED.total_vehicles_count;

-- 4. SEED DRIVERS
INSERT INTO drivers (id, user_id, driving_experience_years, preferred_operating_areas, preferred_platforms, preferred_vehicle_types, preferred_arrangement_types, max_daily_target_kes, is_available, rating_avg, rating_count, completed_engagements_count, identity_verified, license_verified, created_at, updated_at)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 4, '{"Westlands", "CBD / Starehe", "Kilimani"}', '{"Uber", "Bolt", "Little"}', '{"SEDAN", "HATCHBACK"}', '{"DAILY_TARGET"}', 3000.00, true, 4.90, 42, 3, true, true, NOW(), NOW()),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 3, '{"Roysambu", "Kasarani", "Thika Road"}', '{"Uber", "Bolt"}', '{"SEDAN", "HATCHBACK"}', '{"DAILY_TARGET"}', 2800.00, true, 4.80, 29, 2, true, true, NOW(), NOW()),
    ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 5, '{"Langata", "Ngong Road", "Karen"}', '{"Uber", "Bolt"}', '{"SEDAN", "SUV"}', '{"DAILY_TARGET"}', 3500.00, true, 5.00, 61, 5, true, true, NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET
    driving_experience_years = EXCLUDED.driving_experience_years,
    preferred_operating_areas = EXCLUDED.preferred_operating_areas,
    preferred_platforms = EXCLUDED.preferred_platforms,
    is_available = EXCLUDED.is_available,
    rating_avg = EXCLUDED.rating_avg;

-- 5. SEED VEHICLES
INSERT INTO vehicles (id, partner_id, make, model, year, registration_number, vehicle_type, transmission, fuel_type, seating_capacity, color, mileage_km, primary_county, primary_subcounty, supported_platforms, photos, verification_status, availability_status, created_at, updated_at)
VALUES
    ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Toyota', 'Fielder', 2018, 'KDD 482B', 'SEDAN', 'AUTOMATIC', 'PETROL', 5, 'Silver Metallic', 82000, 'Nairobi', 'Westlands', '{"Uber", "Bolt", "Little"}', '{"https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800"}', 'VERIFIED', 'AVAILABLE', NOW(), NOW()),
    ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'Mazda', 'Demio SkyActiv', 2019, 'KDJ 931T', 'HATCHBACK', 'AUTOMATIC', 'PETROL', 5, 'Pearl White', 64000, 'Nairobi', 'Kilimani', '{"Uber", "Bolt"}', '{"https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800"}', 'VERIFIED', 'AVAILABLE', NOW(), NOW()),
    ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000002', 'Nissan', 'Note e-Power', 2020, 'KDA 112L', 'HATCHBACK', 'AUTOMATIC', 'HYBRID', 5, 'Gun Metallic Grey', 49000, 'Nairobi', 'Roysambu', '{"Uber", "Bolt", "Yango"}', '{"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"}', 'VERIFIED', 'AVAILABLE', NOW(), NOW()),
    ('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', 'Suzuki', 'Alto 800', 2021, 'KDH 554M', 'HATCHBACK', 'MANUAL', 'PETROL', 4, 'Ruby Red', 31000, 'Nairobi', 'CBD / Starehe', '{"Bolt", "Uber ChapChap"}', '{"https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800"}', 'VERIFIED', 'AVAILABLE', NOW(), NOW())
ON CONFLICT (registration_number) DO UPDATE SET
    make = EXCLUDED.make,
    model = EXCLUDED.model,
    year = EXCLUDED.year,
    availability_status = EXCLUDED.availability_status;

-- 6. SEED VEHICLE LISTINGS
INSERT INTO vehicle_listings (id, vehicle_id, partner_id, title, description, county, subcounty, arrangement_type, target_amount_kes, deposit_amount_kes, payment_frequency, fuel_responsibility, maintenance_responsibility, insurance_responsibility, preferred_platforms, driver_min_experience_years, driver_requirements_summary, status, view_count, applications_count, published_at, created_at, updated_at)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', '2018 Toyota Fielder 1.5L - Uber / Bolt Ready', 'Clean, well-maintained 2018 Toyota Fielder with comprehensive insurance and speed governor. Partner covers routine servicing (oil, filters, brake pads). Driver handles fuel and daily remit by 10 PM. Vehicle parked in Westlands overnight or secure parking.', 'Nairobi', 'Westlands', 'DAILY_TARGET', 2500.00, 5000.00, 'DAILY', 'DRIVER', 'PARTNER', 'PARTNER', '{"Uber", "Bolt", "Little"}', 2, 'Valid DL, NTSA PSV badge, clean driving record, 2+ years on Uber/Bolt with 4.8+ rating.', 'PUBLISHED', 148, 3, NOW(), NOW(), NOW()),
    ('10000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', '2019 Mazda Demio SkyActiv - Low Fuel Consumption', 'Extremely fuel-efficient Mazda Demio SkyActiv (Pearl White). Ideal for ride-hailing in Kilimani, Westlands, and CBD. Comprehensive PSV insurance and car tracker installed. Immediate handover to a serious, verified driver.', 'Nairobi', 'Kilimani', 'DAILY_TARGET', 2200.00, 4500.00, 'DAILY', 'DRIVER', 'PARTNER', 'PARTNER', '{"Uber", "Bolt"}', 2, 'At least 2 years commercial driving experience in Nairobi. Proof of active Uber/Bolt driver profile.', 'PUBLISHED', 94, 2, NOW(), NOW(), NOW()),
    ('10000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', '2020 Nissan Note e-Power Hybrid - Super Economical', '2020 Nissan Note e-Power hybrid engine. Delivers exceptional 22-26 km/l, keeping driver fuel costs down while easily hitting targets. Managed by Apex Fleet with dedicated mechanic support. Weekly car wash allowance included.', 'Nairobi', 'Roysambu', 'DAILY_TARGET', 2800.00, 6000.00, 'DAILY', 'DRIVER', 'PARTNER', 'PARTNER', '{"Uber", "Bolt", "Yango"}', 3, 'Must reside near Roysambu / Kasarani / Thika Rd. 3+ years experience, verified National ID & KRA PIN.', 'PUBLISHED', 212, 4, NOW(), NOW(), NOW()),
    ('10000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', '2021 Suzuki Alto 800 - Bolt Ride / ChapChap Pocket-Rocket', '2021 Suzuki Alto 800 cc. Lowest target in Nairobi! Lowest fuel consumption possible. Perfect for city errands and ride-hailing app hustlers who want high net margins at the end of each day.', 'Nairobi', 'CBD / Starehe', 'DAILY_TARGET', 1800.00, 3500.00, 'DAILY', 'DRIVER', 'PARTNER', 'PARTNER', '{"Bolt", "Uber ChapChap"}', 1, 'Valid PSV license, smartphone with 4G data, readiness for daily M-PESA remits.', 'PUBLISHED', 76, 1, NOW(), NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    target_amount_kes = EXCLUDED.target_amount_kes,
    deposit_amount_kes = EXCLUDED.deposit_amount_kes,
    status = EXCLUDED.status;

-- 7. SEED APPLICATIONS
INSERT INTO applications (id, listing_id, driver_id, partner_id, status, cover_note, match_score_pct, created_at, updated_at)
VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'ACCEPTED', 'Hi Peter, I live in Westlands, have 4 years full-time Uber experience with 4.9 rating. I will take good care of the Fielder and remit daily before 9 PM.', 96, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'SHORTLISTED', 'Hello David, Beatrice here. I operate along Thika Road / Roysambu and have great customer ratings. Very interested in the Note e-Power.', 92, NOW() - INTERVAL '2 days', NOW()),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'SUBMITTED', 'Interested in the Mazda Demio for Kilimani and Langata shifts. Available immediately.', 88, NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (id) DO NOTHING;

-- 8. SEED CONVERSATIONS & MESSAGES
INSERT INTO conversations (id, driver_id, partner_id, driver_name, partner_name, listing_id, listing_title, last_message, last_message_at, unread_count, created_at)
VALUES
    ('conv-seed-01', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Samuel Mwangi', 'Peter Kamau (Kamau Fleet)', '10000000-0000-0000-0000-000000000001', '2018 Toyota Fielder 1.5L', 'Sounds great Samuel! Let us meet tomorrow at 10 AM in Westlands for key handover.', NOW(), 0, NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO UPDATE SET
    last_message = EXCLUDED.last_message,
    last_message_at = EXCLUDED.last_message_at;

INSERT INTO messages (id, conversation_id, sender_id, sender_name, sender_role, content, is_read, created_at)
VALUES
    ('msg-seed-01', 'conv-seed-01', 'c0000000-0000-0000-0000-000000000001', 'Samuel Mwangi', 'DRIVER', 'Hello Mr. Kamau, I saw your Toyota Fielder listing. All my documents and Uber app profile are verified.', true, NOW() - INTERVAL '2 days'),
    ('msg-seed-02', 'conv-seed-01', 'b0000000-0000-0000-0000-000000000001', 'Peter Kamau', 'PARTNER', 'Welcome Samuel. Your 4.9 rating looks solid. The car is serviced with fresh synthetic oil.', true, NOW() - INTERVAL '1 day'),
    ('msg-seed-03', 'conv-seed-01', 'c0000000-0000-0000-0000-000000000001', 'Samuel Mwangi', 'DRIVER', 'Thank you! I am ready with the refundable deposit.', true, NOW() - INTERVAL '4 hours'),
    ('msg-seed-04', 'conv-seed-01', 'b0000000-0000-0000-0000-000000000001', 'Peter Kamau', 'PARTNER', 'Sounds great Samuel! Let us meet tomorrow at 10 AM in Westlands for key handover.', true, NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- 9. SEED NOTIFICATIONS
INSERT INTO notifications (id, user_id, title, message, type, is_read, link_url, created_at)
VALUES
    ('notif-seed-01', 'b0000000-0000-0000-0000-000000000001', '🚘 New Driver Application!', 'Samuel Mwangi (4.9★, 4 yrs exp) applied for your 2018 Toyota Fielder.', 'APPLICATION', false, '/partner/applications', NOW() - INTERVAL '2 days'),
    ('notif-seed-02', 'c0000000-0000-0000-0000-000000000001', '🎉 Application Accepted!', 'Peter Kamau has accepted your application for the 2018 Toyota Fielder. Please review the operating agreement.', 'APPLICATION', false, '/driver/agreements', NOW() - INTERVAL '1 day'),
    ('notif-seed-03', 'b0000000-0000-0000-0000-000000000002', '🌟 New Vehicle Verified', 'Your 2020 Nissan Note e-Power has been verified and is live on the marketplace.', 'SYSTEM', false, '/partner/vehicles', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;
