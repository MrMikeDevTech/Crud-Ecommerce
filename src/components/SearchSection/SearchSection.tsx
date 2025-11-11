import { useEffect, useState } from "react";
import ResultBar from "@/components/SearchSection/ResultBar";
import FilterBar from "@/components/SearchSection/FilterBar";
import Products from "@/components/SearchSection/Products";
import { getProducts } from "@/services/api";
import type { FilterProps, Product } from "@/types";

export default function SearchSection({ query = "" }: { query?: string }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [queryState, setQueryState] = useState(query);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<FilterProps>({
        sortBy: "relevance",
        rating: "all"
    });

    const handleChangeFilters = (newFilters: Partial<FilterProps>) => {
        setFilters((prev) => {
            const updated = { ...prev, ...newFilters };
            changeFilterUrlParams(updated);
            return updated;
        });
    };

    const initializeFiltersFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        const urlFilters: Partial<FilterProps> = {};

        const sortBy = params.get("sortBy");
        const rating = params.get("rating");
        const minStock = params.get("minStock");
        const priceMin = params.get("priceMin");
        const priceMax = params.get("priceMax");

        if (sortBy) urlFilters.sortBy = sortBy as FilterProps["sortBy"];
        if (rating) urlFilters.rating = rating as FilterProps["rating"];
        if (minStock) urlFilters.minStock = Number(minStock);
        if (priceMin || priceMax)
            urlFilters.priceRange = {
                min: priceMin ? Number(priceMin) : 0,
                max: priceMax ? Number(priceMax) : Infinity
            };

        setFilters((prev) => ({ ...prev, ...urlFilters }));
    };

    const changeFilterUrlParams = (newFilters: Partial<FilterProps>) => {
        const params = new URLSearchParams(window.location.search);

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value === undefined || value === null) {
                params.delete(key);

                if (key === "priceRange") {
                    params.delete("priceMin");
                    params.delete("priceMax");
                }
            } else if (key === "priceRange" && typeof value === "object" && "min" in value && "max" in value) {
                params.set("priceMin", String(value.min));
                params.set("priceMax", String(value.max));
                params.delete("priceRange");
            } else {
                params.set(key, String(value));
            }
        });

        window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const p = await getProducts();
            setProducts(p);
            setFilteredProducts(p);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const setupQueryFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q") || "";
        setQueryState(q);
    };

    useEffect(() => {
        fetchProducts();
        setupQueryFromURL();
        initializeFiltersFromURL();
    }, []);

    useEffect(() => {
        let updated = [...products];

        if (filters.priceRange)
            updated = updated.filter((p) => p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max);

        if (filters.rating !== "all")
            updated = updated.filter((p) => Math.floor(p.score || 0) === Number(filters.rating));

        if (filters.minStock !== undefined) updated = updated.filter((p) => p.stock >= filters.minStock!);

        if (filters.sortBy === "price-asc") updated.sort((a, b) => a.price - b.price);
        else if (filters.sortBy === "price-desc") updated.sort((a, b) => b.price - a.price);

        if (queryState)
            updated = updated.filter(
                (p) =>
                    p.name.toLowerCase().includes(queryState.toLowerCase()) ||
                    p.description.toLowerCase().includes(queryState.toLowerCase())
            );

        setFilteredProducts(updated);
    }, [filters, products, queryState]);

    return (
        <>
            <ResultBar query={queryState} products={products} onChangeFilters={handleChangeFilters} />

            <section className="flex flex-row flex-1 px-5 pb-5 gap-5">
                <FilterBar products={products} filters={filters} onChangeFilters={handleChangeFilters} />
                <Products
                    query={queryState}
                    results={filteredProducts}
                    totalProducts={products.length}
                    loading={loading}
                />
            </section>
        </>
    );
}
