import type React from "react";
import type { FilterProps, Product } from "@/types";

export default function ResultBar({
    query,
    products,
    onChangeFilters
}: {
    /* eslint-disable-next-line no-unused-vars */
    onChangeFilters: (newFilters: Partial<FilterProps>) => void;
    query: string;
    products: Product[];
}) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChangeFilters({ sortBy: e.target.value as FilterProps["sortBy"] });
    };

    return (
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 px-8 mx-5 mt-5 mb-3 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="mb-3 sm:mb-0">
                <h2 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    "{query || "Resultados de Búsqueda"}"
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Se encontraron <span className="font-semibold">{products.length}</span> resultados.
                </span>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300"> Ordenar por </span>
                <div className="relative">
                    <select
                        id="sort"
                        name="sort"
                        className="appearance-none p-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 shadow-inner focus:ring-indigo-500 focus:border-indigo-500 transition cursor-pointer"
                        onChange={handleChange}
                    >
                        <option value="relevance">Relevancia</option>
                        <option value="price-asc">Precio: Bajo a Alto</option>
                        <option value="price-desc">Precio: Alto a Bajo</option>
                        <option value="newest">Nuevos Llegados</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </header>
    );
}
