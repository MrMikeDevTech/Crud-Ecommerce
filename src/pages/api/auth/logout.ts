import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ cookies, redirect }) => {
    console.log("Logging out user...");
    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });
    return redirect("/login");
};
