import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_API_KEY } from "@/lib/env";
import { uploadAvatar } from "@/services/cloudinary";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const file = formData.get("file") as File | null;

    if (!file) {
        return new Response(JSON.stringify({ error: "No file provided" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    const cookies = request.headers.get("cookie") || "";
    const token = cookies
        .split("; ")
        .find((c) => c.startsWith("sb-access-token="))
        ?.split("=")[1];

    if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });

    const { error } = await supabase.auth.getSession();

    if (error) {
        return new Response(JSON.stringify({ error: "Invalid session" }), {
            status: 403,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const response = await uploadAvatar({ id, file });
        return new Response(JSON.stringify({ url: response.url }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        console.error("Upload failed:", err);
        return new Response(JSON.stringify({ error: "Upload failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
