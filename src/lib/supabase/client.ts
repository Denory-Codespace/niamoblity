import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tikqsqrjyjdufggwykuy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Vbehhp-FYVPMRWwrsI5ZXA_22PkMFP8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
