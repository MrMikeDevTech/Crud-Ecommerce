import { levenshtein, normalize } from "@/utils/search";
import { getAllProducts } from "@/services/supabase";
import type { Product, ScoredProduct } from "@/types";

const getProducts = async (): Promise<Product[]> => {
    try {
        const allProducts = await getAllProducts();
        if (allProducts.error === null) {
            return (
                allProducts.products.map((product) => ({
                    created_at: product.created_at || Date.now().toString(),
                    description: product.description || "",
                    id: product.id || "",
                    image: product.image || "",
                    name: product.name || "",
                    price: product.price || 0,
                    score: product.score || 0,
                    stock: product.stock || 0
                })) ?? []
            );
        }
    } catch (error) {
        console.error("Error fetching products:", error);
    }

    return [];
};

const getProduct = async (id: string): Promise<Product | null> => {
    try {
        const allProducts = await getAllProducts();
        if (allProducts.error === null) {
            const found = allProducts.products.find((p) => p.id === id);
            if (found) {
                return {
                    created_at: found.created_at || Date.now().toString(),
                    description: found.description || "",
                    id: found.id || "",
                    image: found.image || "",
                    name: found.name || "",
                    price: found.price || 0,
                    score: found.score || 0,
                    stock: found.stock || 0
                };
            }
        }
    } catch (error) {
        console.error("Error fetching product:", error);
    }
    return null;
};

const getThreeBestProducts = async (): Promise<Product[]> => {
    const products = await getProducts();
    const sorted = products.sort((a, b) => (b.score || 0) - (a.score || 0));
    return sorted.slice(0, 3);
};

const getLatestProducts = async (count?: number): Promise<Product[]> => {
    const products = await getProducts();
    const sorted = products.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
    });
    return sorted.slice(0, count || 20);
};

const getFeedProducts = async (latestCount: number = 20) => {
    const threeBest = await getThreeBestProducts();
    const latest = (await getLatestProducts(latestCount + threeBest.length))
        .filter((product) => !threeBest.some((best) => best.id === product.id))
        .slice(0, latestCount);

    return {
        threeBest,
        latest
    };
};

const getSearchProducts = async (queryQ?: string): Promise<Product[]> => {
    if (!queryQ) return [];

    const terms = normalize(queryQ).split(/\s+/).filter(Boolean);

    const p = await getProducts();

    const mapping = (product: Product): ScoredProduct => {
        const rawName = product.name || "";
        const name = normalize(rawName);
        let score = 0;
        terms.forEach((term) => {
            if (name.includes(term)) score += 2;
            else if (levenshtein(term, name) <= 2) score += 1;
        });
        return { product, score };
    };

    const scoredResults: Product[] = (p as Product[])
        .map(mapping)
        .filter((r: ScoredProduct) => r.score > 0)
        .sort((a: ScoredProduct, b: ScoredProduct) => b.score - a.score)
        .map((r: ScoredProduct) => r.product);

    return scoredResults;
};

const getRandomProducts = async (count: number): Promise<Product[]> => {
    const products = await getProducts();
    const shuffled = products.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count || 4);
};

export {
    getProducts,
    getProduct,
    getSearchProducts,
    getThreeBestProducts,
    getLatestProducts,
    getRandomProducts,
    getFeedProducts
};
