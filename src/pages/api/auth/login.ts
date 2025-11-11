import type { APIRoute } from "astro";
import { supabase } from "@/lib/supabase";
import { URL_PAGE, LOCAL_URL_PAGE } from "@/consts";
import { DEV } from "@/lib/env";

export const GET: APIRoute = async ({ redirect }) => {
    const url = new URL(DEV ? LOCAL_URL_PAGE : URL_PAGE);

    const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${url.origin}/api/auth/callback`
        }
    });

    if (authError) return new Response(authError.message, { status: 500 });

    return redirect(authData.url);
};
