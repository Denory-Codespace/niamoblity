-- ==============================================================================
-- nia mobility - Supabase RLS Fix Script
-- Developed by Denory Codespace
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- OPTION A: Disable RLS for rapid development & testing
-- (Allows full read/write via the Supabase client without JWT auth restrictions)

ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS drivers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicle_listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agreements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS verification_documents DISABLE ROW LEVEL SECURITY;

-- If you prefer keeping RLS enabled, uncomment the policies below instead:
/*
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on users" ON users;
CREATE POLICY "Allow anon all on users" ON users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on profiles" ON profiles;
CREATE POLICY "Allow anon all on profiles" ON profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on drivers" ON drivers;
CREATE POLICY "Allow anon all on drivers" ON drivers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on partners" ON partners;
CREATE POLICY "Allow anon all on partners" ON partners FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on vehicles" ON vehicles;
CREATE POLICY "Allow anon all on vehicles" ON vehicles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on vehicle_listings" ON vehicle_listings;
CREATE POLICY "Allow anon all on vehicle_listings" ON vehicle_listings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on applications" ON applications;
CREATE POLICY "Allow anon all on applications" ON applications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on agreements" ON agreements;
CREATE POLICY "Allow anon all on agreements" ON agreements FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on verification_documents" ON verification_documents;
CREATE POLICY "Allow anon all on verification_documents" ON verification_documents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
*/
