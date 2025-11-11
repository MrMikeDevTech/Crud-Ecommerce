import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/env";

export const POST: APIRoute = async ({ request }) => {
    try {
        const { userId } = await request.json();

        if (!userId) {
            console.error("Missing userId");
            return new Response(JSON.stringify({ ok: false, error: "Missing userId" }), { status: 400 });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const { error: authError } = await supabase.auth.admin.deleteUser(userId);

        if (authError) {
            return new Response(JSON.stringify({ ok: false, error: authError.message }), { status: 400 });
        }

        await supabase.from("sessions").delete().eq("id", userId);

        return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ ok: false, error: String(error) }), { status: 500 });
    }
};
