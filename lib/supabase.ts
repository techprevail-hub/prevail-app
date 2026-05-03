// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Single shared instance — import this everywhere instead of calling createClient() directly
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default supabase;