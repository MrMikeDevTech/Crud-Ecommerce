import { supabase } from "@/lib/supabase";
import type { RawProduct, RawSession, RawTestimonial, ProductAdmin } from "@/types/supabase";
import type { Cart, UserSession, UserMetaData, Product } from "@/types";
import type { Session } from "@supabase/supabase-js";
import type { AuthorType, TestimonialWithAuthor } from "@/types/testimonials";

/**
 * Inicializa y retorna la sesión de usuario basada en la sesión actual de Supabase.
 *
 * - Si ya existe la sesión en la DB, retorna la información existente junto con su carrito.
 * - Si no existe, crea la sesión con valores por defecto y genera el full_name capitalizado.
 *
 * @param currentSession - La sesión actual de Supabase, o null si no está autenticado.
 * @returns Una promesa con `UserSession` o null si ocurre algún error.
 */
export async function initializeUserSession({
    currentSession
}: {
    currentSession: Session | null;
}): Promise<UserSession | null> {
    if (!currentSession) return null;

    const capitalizeName = (name: string) =>
        name
            .trim()
            .toLocaleLowerCase()
            .split(" ")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");

    const userMetadata = currentSession.user.user_metadata as UserMetaData;
    const userId = currentSession.user.id;
    const email = currentSession.user.email ?? null;

    const safeFullName = userMetadata?.full_name ? capitalizeName(userMetadata.full_name) : null;
    const safeAvatarUrl = userMetadata?.avatar_url ?? null;

    const { data: dbSession, error: fetchError } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (fetchError) {
        console.error("Error fetching session:", fetchError.message);
        return null;
    }

    if (dbSession) {
        const isCloudinaryAvatar = dbSession.avatar_url?.includes("res.cloudinary.com");
        const isSupabaseAvatar =
            safeAvatarUrl?.includes("supabase.co") || safeAvatarUrl?.includes("googleusercontent.com");

        const shouldUpdateAvatar =
            (!dbSession.avatar_url || !isCloudinaryAvatar) &&
            safeAvatarUrl &&
            isSupabaseAvatar &&
            dbSession.avatar_url !== safeAvatarUrl;

        if (shouldUpdateAvatar) {
            await supabase
                .from("sessions")
                .update({
                    avatar_url: safeAvatarUrl,
                    avatar_last_modified: new Date().toISOString()
                })
                .eq("id", userId);
            console.log("Updated avatar from Supabase metadata for user:", userId);
        }

        const userCart: Cart = { items: [], total: 0 };
        return {
            id: dbSession.id,
            full_name: dbSession.full_name,
            email: dbSession.email,
            avatar_url: dbSession.avatar_url,
            avatar_last_modified: dbSession.avatar_last_modified,
            cart: [userCart]
        };
    } else {
        const { data: newSession, error: insertError } = await supabase
            .from("sessions")
            .insert({
                id: userId,
                email,
                full_name: safeFullName ?? "",
                avatar_url: safeAvatarUrl,
                avatar_last_modified: null
            })
            .select("*")
            .single();

        if (insertError) {
            console.error("Error creating session:", insertError.message);
            return null;
        }

        const userCart: Cart = { items: [], total: 0 };

        return {
            id: newSession.id,
            full_name: newSession.full_name,
            email: newSession.email,
            avatar_url: newSession.avatar_url,
            avatar_last_modified: newSession.avatar_last_modified,
            cart: [userCart]
        };
    }
}

/**
 * Actualiza el campo `avatar_last_modified` de un perfil en la base de datos.
 *
 * @param params - Objeto con las siguientes propiedades:
 *   - `id`: ID del perfil que se desea actualizar.
 *   - `date` (opcional): Fecha a asignar al campo `last_avatar_update`. Si no se proporciona, se usará la fecha actual.
 * @returns Un objeto con:
 *   - `updatedDate`: La fecha actualizada si fue exitosa, o `null` si falló.
 *   - `error`: El mensaje de error si ocurrió alguno, o `null` si todo salió bien.
 */
export async function updateLastAvatarUpdate({ id, date }: { id: string; date?: Date }): Promise<{
    updatedDate: Date | null;
    error: string | null;
}> {
    const updateDate = date ?? new Date();
    const { error } = await supabase
        .from("sessions")
        .update({ avatar_last_modified: updateDate.toISOString() })
        .eq("id", id);

    if (error) {
        return {
            updatedDate: null,
            error: error.message
        };
    }

    return {
        updatedDate: updateDate,
        error: null
    };
}

/**
 * Obtiene la fecha de la última actualización del avatar (`last_avatar_update`) de un perfil.
 *
 * @param id - El identificador único del perfil.
 * @returns Un objeto con:
 *   - `lastAvatarUpdate`: La fecha de la última actualización o `null` si no existe o hay error.
 *   - `error`: Mensaje de error si ocurre alguno, o `null` si no hay errores.
 */
export async function getLastAvatarUpdate(id: string): Promise<{
    lastAvatarUpdate: Date | null;
    error: string | null;
}> {
    const { data, error } = await supabase.from("sessions").select("avatar_last_modified").eq("id", id).maybeSingle();

    if (error) {
        return { lastAvatarUpdate: null, error: error.message };
    }

    return {
        lastAvatarUpdate: data?.last_avatar_update ? new Date(data.last_avatar_update) : null,
        error: null
    };
}

export async function getAllSessions(): Promise<{
    sessions: RawSession[];
    error: string | null;
}> {
    const { data, error } = await supabase.from("sessions").select("*");
    return { sessions: data || [], error: error?.message || null };
}

export async function getSessionById(id: string): Promise<{
    session: RawSession | null;
    error: string | null;
}> {
    const { data, error } = (await supabase.from("sessions").select("*").eq("id", id).maybeSingle()) as {
        data: RawSession | null;
        error: any;
    };
    return { session: data, error: error?.message || null };
}

export async function updateSession(
    id: string,
    fields: Partial<RawSession>
): Promise<{
    updated: RawSession | null;
    error: string | null;
}> {
    const { data, error } = await supabase.from("sessions").update(fields).eq("id", id).select().single();
    return { updated: data, error: error?.message || null };
}

export async function deleteSession(id: string): Promise<{
    success: boolean;
    error: string | null;
}> {
    const { error } = await supabase.from("sessions").delete().eq("id", id);
    return { success: !error, error: error?.message || null };
}

/**
 * Actualiza la URL del avatar para un perfil de usuario en la tabla "profiles".
 *
 * @param params - Objeto que contiene las siguientes propiedades:
 * @param params.id - El identificador único del usuario cuyo perfil se va a actualizar.
 * @param params.url_photo - La nueva URL de la foto de avatar del usuario.
 * @returns Una promesa que resuelve a un objeto con:
 * - `updatedUrlPhoto`: La URL actualizada del avatar si la operación fue exitosa, de lo contrario `null`.
 * - `error`: Un mensaje de error si la actualización falló, de lo contrario `null`.
 *
 * @example
 * ```typescript
 * const resultado = await updateProfileAvatar({ id: "usuario123", url_photo: "https://ejemplo.com/avatar.png" });
 * if (resultado.error) {
 *   // Manejar el error
 * } else {
 *   // Usar resultado.updatedUrlPhoto
 * }
 * ```
 */
export async function updateProfileAvatar({ id, url_photo }: { id: string; url_photo: string }): Promise<{
    updatedUrlPhoto: string | null;
    error: string | null;
}> {
    const { error } = await supabase.from("sessions").update({ avatar_url: url_photo }).eq("id", id);

    if (error) {
        return {
            updatedUrlPhoto: null,
            error: error.message
        };
    }

    return {
        updatedUrlPhoto: url_photo,
        error: null
    };
}

export async function addProductAdmin(email: string): Promise<{ admin: ProductAdmin | null; error: string | null }> {
    const { data, error } = await supabase.from("product_admins").insert({ email }).select().single();
    return { admin: data, error: error?.message || null };
}

export async function getAllProductAdmins(): Promise<{ admins: ProductAdmin[]; error: string | null }> {
    const { data, error } = await supabase.from("product_admins").select("*");
    return { admins: data || [], error: error?.message || null };
}

export async function getProductAdminByEmail(
    email: string
): Promise<{ admin: ProductAdmin | null; error: string | null }> {
    const { data, error } = await supabase.from("product_admins").select("*").eq("email", email).maybeSingle();
    return { admin: data, error: error?.message || null };
}

export async function updateProductAdmin(
    id: string,
    email: string
): Promise<{ updated: ProductAdmin | null; error: string | null }> {
    const { data, error } = await supabase.from("product_admins").update({ email }).eq("id", id).select().single();
    return { updated: data, error: error?.message || null };
}

export async function deleteProductAdmin(id: string): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.from("product_admins").delete().eq("id", id);
    return { success: !error, error: error?.message || null };
}

export async function isProductAdmin(email: string): Promise<boolean> {
    const { data, error } = await supabase.from("product_admins").select("*").eq("email", email).maybeSingle();
    if (error) {
        console.error("Error checking product admin:", error.message);
        return false;
    }
    return Boolean(data);
}

export async function addTestimonial(
    params: Omit<RawTestimonial, "id" | "created_at" | "updated_at">
): Promise<{ testimonial: RawTestimonial | null; error: string | null }> {
    const { data, error } = await supabase.from("testimonials").insert(params).select().single();
    return { testimonial: data, error: error?.message || null };
}

export async function getAllTestimonials(): Promise<{
    testimonials: TestimonialWithAuthor[] | null;
    error: string | null;
}> {
    const { data, error } = await supabase
        .from("testimonials")
        .select("*, author:sessions(full_name, avatar_url, email)");
    const testimonials = (data || []).map((testimonial: { author: AuthorType }) => ({
        ...testimonial,
        author: {
            full_name: testimonial.author?.full_name || "",
            avatar_url: testimonial.author?.avatar_url || "",
            email: testimonial.author?.email || ""
        }
    }));
    return { testimonials, error: error?.message || null };
}

export async function getTestimonialByAuthorId(
    authorId: string
): Promise<{ testimonial: RawTestimonial | null; error: string | null }> {
    const { data, error } = await supabase.from("testimonials").select("*").eq("author_id", authorId).maybeSingle();
    return { testimonial: data, error: error?.message || null };
}

export async function updateTestimonial(
    id: string,
    fields: Partial<Pick<RawTestimonial, "quote" | "stars">>
): Promise<{ updated: RawTestimonial | null; error: string | null }> {
    const { data, error } = await supabase.from("testimonials").update(fields).eq("id", id).select().single();
    return { updated: data, error: error?.message || null };
}

export async function deleteTestimonial(id: string): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    return { success: !error, error: error?.message || null };
}

export async function addProduct(
    product: Omit<RawProduct, "id" | "created_at" | "updated_at">
): Promise<{ product: RawProduct | null; error: string | null }> {
    const { data, error } = await supabase.from("products").insert(product).select().single();
    return { product: data, error: error?.message || null };
}

export async function getAllProducts(): Promise<{ products: RawProduct[]; error: string | null }> {
    const { data, error } = await supabase.from("products").select("*");
    return { products: data || [], error: error?.message || null };
}

export async function getProductById(id: string): Promise<{ product: RawProduct | null; error: string | null }> {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
    return { product: data, error: error?.message || null };
}

export async function updateProduct(
    id: string,
    fields: Partial<RawProduct>
): Promise<{ updated: RawProduct | null; error: string | null }> {
    const { data, error } = await supabase.from("products").update(fields).eq("id", id).select().single();
    return { updated: data, error: error?.message || null };
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase.from("products").delete().eq("id", id);
    return { success: !error, error: error?.message || null };
}

export const getSecondCheapest = (products: Product[]) => {
    const prices = products.map((p) => p.price);
    const uniquePrices = Array.from(new Set(prices)).sort((a, b) => a - b);
    const secondCheapestPrice = uniquePrices[1] || uniquePrices[0];
    const count = products.filter((p) => p.price === secondCheapestPrice).length;
    return { price: secondCheapestPrice, count };
};

export const getProductsAroundAveragePrice = (products: Product[]) => {
    const total = products.reduce((sum, p) => sum + p.price, 0);
    const price = total / products.length;
    const lowerBound = price - 50;
    const upperBound = price + 50;
    const filteredProducts = products.filter((p) => p.price >= lowerBound && p.price <= upperBound);
    const count = filteredProducts.length;
    return { price, count };
};

export const getSecondMostExpensive = (products: Product[]) => {
    const prices = products.map((p) => p.price);
    const uniquePrices = Array.from(new Set(prices)).sort((a, b) => b - a);
    const secondMostExpensivePrice = uniquePrices[1] || uniquePrices[0];
    const count = products.filter((p) => p.price === secondMostExpensivePrice).length;
    return { price: secondMostExpensivePrice, count };
};
