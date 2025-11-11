import type { APIRoute } from "astro";
import { supabase } from "@/lib/supabase";

export const GET: APIRoute = async ({ redirect }) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: "/api/auth/callback"
        }
    });

    if (authError) return new Response(authError.message, { status: 500 });

    return redirect(authData.url);
};
