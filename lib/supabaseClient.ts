import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js'

export const supabase = createBrowserSupabaseClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    supabaseKey:  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
});