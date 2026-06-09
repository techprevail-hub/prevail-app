import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,     // keeps session alive across tab closes
    autoRefreshToken: true,   // silently renews token before it expires
    detectSessionInUrl: true, // handles OAuth (Google/LinkedIn) redirects
  },
});