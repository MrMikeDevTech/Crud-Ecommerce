import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { getProducts } from "@/services/api";
import ProductSearchHeader from "@/components/AdminProducts/ProductSearchHeader";
import ProductGrid from "@/components/AdminProducts/ProductGrid";

export default function ProductSection() {
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const loadQueryFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q") || "";
        setSearchQuery(q);
    };

    const updateUrlParam = (query: string) => {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const p = await getProducts();
            const sorted = p.sort((a, b) => a.name.localeCompare(b.name));
            setProducts(sorted);
            setFilteredProducts(sorted);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        loadQueryFromURL();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredProducts(products);
            updateUrlParam("");
            return;
        }

        const filtered = products.filter(
            (p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setFilteredProducts(filtered);
        updateUrlParam(searchQuery);
    }, [searchQuery, products]);

    return (
        <>
            <a
                className="py-2 px-8 mx-5 mt-5 mb-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
                href="/admin/dashboard"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    ></path>
                </svg>
                Volver a la página anterior
            </a>
            <ProductSearchHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <ProductGrid filteredProducts={filteredProducts} loading={loading} />
        </>
    );
}
