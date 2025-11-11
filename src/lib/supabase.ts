import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_API_KEY } from "@/lib/env";

export const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY, {
    auth: {
        flowType: "pkce",
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: true
    }
});
