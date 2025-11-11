import { getSearchProducts } from "@/services/api";

export async function GET({ params: { q }, request }: { params: { q?: string }; request: Request }) {
    let queryQ = q;

    if (!queryQ) {
        const url = new URL(request.url);
        queryQ = queryQ || url.searchParams.get("q") || undefined;
    }

    const results = await getSearchProducts(queryQ);

    return new Response(JSON.stringify(results), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}
