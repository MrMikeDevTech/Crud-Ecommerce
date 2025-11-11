import { defineMiddleware } from "astro:middleware";
import { getProduct } from "@/services/api";
import { isProductAdmin } from "@/services/supabase";
import micromatch from "micromatch";
import type { AstroCookies, APIContext } from "astro";
import { supabase } from "@/lib/supabase";

interface AuthSession {
    user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] | null;
    session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"] | null;
    needsCookieUpdate: boolean;
}

const handleSession = async (cookies: AstroCookies): Promise<AuthSession> => {
    const accessToken = cookies.get("sb-access-token");
    const refreshToken = cookies.get("sb-refresh-token");

    if (!accessToken || !refreshToken) {
        return { user: null, session: null, needsCookieUpdate: false };
    }

    const { data, error } = await supabase.auth.setSession({
        refresh_token: refreshToken.value,
        access_token: accessToken.value
    });

    if (error || !data?.user || !data?.session) {
        return { user: null, session: null, needsCookieUpdate: true };
    }

    const needsUpdate = data.session.access_token !== accessToken.value;

    return {
        user: data.user,
        session: data.session,
        needsCookieUpdate: needsUpdate
    };
};

const routes = {
    public: ["/api/**", "/product/**", "/api/auth/**"],
    redirect: ["/login(|/)", "/register(|/)"],
    admin: ["/admin/**"],
    product: ["/product/**"]
};

const AUTH_ROUTES = [...routes.redirect, ...routes.public];

const middlewareHandlers = {
    protected: (auth: AuthSession, redirect: APIContext["redirect"]) => {
        if (!auth.user) return redirect("/login");
    },

    redirect: (auth: AuthSession, redirect: APIContext["redirect"]) => {
        if (auth.user) return redirect("/");
    },

    admin: async (auth: AuthSession, redirect: APIContext["redirect"]) => {
        if (!auth.user) return redirect("/login");

        const email = auth.user.email ?? "";
        const isAdminUser = await isProductAdmin(email);

        if (!isAdminUser) return redirect("/");
    },

    product: async ({ redirect, url }: APIContext) => {
        const match = url.pathname.match(/^\/product\/([^/]+)/);
        if (!match) return;

        const productId = String(match[1]);
        if (!productId) return redirect("/");

        try {
            const product = await getProduct(productId);
            if (!product) return redirect("/");
        } catch {
            return redirect("/");
        }
    }
};

export const onRequest = defineMiddleware(async (ctx, next) => {
    const { url, cookies, redirect } = ctx;
    const pathname = url.pathname;

    const auth = await handleSession(cookies);
    (ctx.locals as { auth: AuthSession }).auth = auth;

    if (pathname === "/admin" || pathname === "/admin/") {
        if (!auth.user) return redirect("/");

        const email = auth.user.email ?? "";
        const isAdminUser = await isProductAdmin(email);

        if (!isAdminUser) return redirect("/");

        return redirect("/admin/dashboard");
    }

    let result: Response | undefined;

    if (micromatch.isMatch(pathname, routes.redirect)) {
        result = middlewareHandlers.redirect(auth, redirect);
        if (result) return result;
    }

    if (micromatch.isMatch(pathname, routes.admin)) {
        result = await middlewareHandlers.admin(auth, redirect);
        if (result) return result;
    }

    if (micromatch.isMatch(pathname, routes.product)) {
        result = await middlewareHandlers.product(ctx);
        if (result) return result;
    }

    const isPublicRoute = AUTH_ROUTES.some((pattern) => micromatch.isMatch(pathname, pattern));

    if (!isPublicRoute) {
        result = middlewareHandlers.protected(auth, redirect);
        if (result) return result;
    }

    const response = await next();

    if (auth.needsCookieUpdate && !auth.user) {
        cookies.delete("sb-access-token", { path: "/" });
        cookies.delete("sb-refresh-token", { path: "/" });
    }

    if (auth.needsCookieUpdate && auth.session) {
        cookies.set("sb-access-token", auth.session.access_token, {
            sameSite: "strict",
            path: "/",
            secure: true
        });
        cookies.set("sb-refresh-token", auth.session.refresh_token, {
            sameSite: "strict",
            path: "/",
            secure: true
        });
    }

    return response;
});
