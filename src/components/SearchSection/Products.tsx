import { useState, useEffect } from "react";
import type { Product } from "@/types";
import { useNearScreen } from "@/hooks/useNearScreen";

const LOAD_LIMIT = 12;
const CHUNK_SIZE = 12;

export default function Products({
    query,
    results,
    totalProducts,
    loading = false
}: {
    query: string;
    results: Product[];
    totalProducts: number;
    loading?: boolean;
}) {
    const [visibleCount, setVisibleCount] = useState(LOAD_LIMIT);
    const [isEnd, setIsEnd] = useState(false);
    const { isNearScreen, ref } = useNearScreen<HTMLDivElement>({ rootMargin: "300px" });

    useEffect(() => {
        if (isNearScreen && visibleCount < results.length) {
            const next = Math.min(visibleCount + CHUNK_SIZE, results.length);
            setVisibleCount(next);
            if (next >= results.length) setIsEnd(true);
        }
    }, [isNearScreen, visibleCount, results.length]);

    return (
        <main className="flex flex-col flex-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                Mostrando {results.length} resultado{totalProducts !== 1 ? "s" : ""} para "{query}"
            </h2>

            {loading && (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <svg
                        className="animate-spin h-10 w-10 text-indigo-400 mb-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Cargando productos...</p>
                </div>
            )}

            {!loading && totalProducts === 0 && (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <svg
                        className="w-16 h-16 text-indigo-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                        No se encontraron productos para "{query}"
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Intenta ajustar tus filtros de búsqueda.
                    </p>
                </div>
            )}

            {totalProducts > 0 && (
                <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {results.slice(0, visibleCount).map((product, index) => {
                        const isAnimated = index < LOAD_LIMIT;
                        return (
                            <li
                                key={product.id}
                                className={`product-card bg-gray-50 dark:bg-gray-900 p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 flex flex-col items-center border border-gray-100 dark:border-gray-700 ${
                                    isAnimated ? "opacity-0 translate-y-5 animate-fadeIn" : "opacity-100 translate-y-0"
                                }`}
                                style={isAnimated ? { animationDelay: `${index * 100}ms` } : {}}
                            >
                                <a href={`/product/${product.id}`} className="group flex flex-col items-center w-full">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-40 object-contain mb-4 rounded-md transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <h3 className="font-extrabold text-lg mb-1 text-center truncate w-full text-gray-900 dark:text-gray-100">
                                        {product.name}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs text-center mb-3 line-clamp-2 min-h-[2.5rem]">
                                        {product.description}
                                    </p>
                                    <span className="font-black text-2xl text-indigo-600 dark:text-indigo-400 mb-4">
                                        $
                                        {product.price.toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}{" "}
                                        MXN
                                    </span>
                                </a>
                                <a
                                    href={`/product/${product.id}`}
                                    className="w-full text-center bg-indigo-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-indigo-600 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-700"
                                >
                                    Comprar
                                </a>
                            </li>
                        );
                    })}
                </ul>
            )}

            {!isEnd && <div ref={ref} className="opacity-0"></div>}

            {isEnd && (
                <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        ✨ Has llegado al final de los resultados. ✨
                    </p>
                </div>
            )}
        </main>
    );
}
