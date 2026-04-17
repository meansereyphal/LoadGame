import { SupabaseClient } from "@supabase/supabase-js";

const supabaseClient = new SupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY
);

export default supabaseClient;