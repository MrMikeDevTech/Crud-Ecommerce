import { useMemo, useState, useEffect } from "react";
import type { FilterProps, Product } from "@/types";

export default function FilterBar({
    onChangeFilters,
    products,
    filters
}: {
    /* eslint-disable-next-line no-unused-vars */
    onChangeFilters: (newFilters: Partial<FilterProps>) => void;
    products: Product[];
    filters: FilterProps;
}) {
    const [tempPriceRange, setTempPriceRange] = useState<{
        min?: number;
        max?: number;
    }>({
        min: filters.priceRange?.min,
        max: filters.priceRange?.max
    });
    useEffect(() => {
        setTempPriceRange({
            min: filters.priceRange?.min,
            max: filters.priceRange?.max
        });
    }, [filters.priceRange]);
    useEffect(() => {
        const handler = setTimeout(() => {
            const hasMin = tempPriceRange.min !== undefined && tempPriceRange.min !== null;
            const hasMax = tempPriceRange.max !== undefined && tempPriceRange.max !== null;

            if (!hasMin && !hasMax) {
                onChangeFilters({ priceRange: undefined });
                return;
            }

            onChangeFilters({
                priceRange: {
                    min: hasMin ? Number(tempPriceRange.min) : 0,
                    max: hasMax ? Number(tempPriceRange.max) : Infinity
                }
            });
        }, 500);

        return () => clearTimeout(handler);
    }, [tempPriceRange, onChangeFilters]);

    const ratingCounts = useMemo(() => {
        const counts: Record<string, number> = { all: products.length };
        [1, 2, 3, 4, 5].forEach((r) => (counts[r] = products.filter((p) => Math.floor(p.score || 0) === r).length));
        return counts;
    }, [products]);

    const stockCounts = useMemo(
        () => ({
            50: products.filter((p) => p.stock > 50).length,
            20: products.filter((p) => p.stock > 20 && p.stock <= 50).length,
            10: products.filter((p) => p.stock > 10 && p.stock <= 20).length,
            1: products.filter((p) => p.stock > 0 && p.stock <= 10).length,
            0: products.filter((p) => p.stock === 0).length
        }),
        [products]
    );

    const handleRatingClick = (rating: FilterProps["rating"]) => onChangeFilters({ rating });
    const handleStockClick = (minStock: number) => onChangeFilters({ minStock });

    return (
        <aside className="hidden lg:flex flex-col w-72 h-fit bg-white dark:bg-gray-900 text-gray-800 dark:text-white p-6 rounded-xl shadow-xl sticky top-24 border border-gray-100 dark:border-gray-700">
            <h2 className="font-extrabold text-2xl text-indigo-600 dark:text-indigo-400 mb-6 border-b pb-3 border-gray-200 dark:border-gray-700">
                Filtros
            </h2>
            <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">Calificación</h3>
                <ul className="space-y-1 text-sm">
                    {["all", 5, 4, 3, 2, 1].map((r) => (
                        <li
                            key={r}
                            onClick={() => handleRatingClick(r as FilterProps["rating"])}
                            className={`cursor-pointer transition-colors ${
                                filters.rating === r.toString()
                                    ? "text-indigo-500 font-semibold"
                                    : "text-gray-600 dark:text-gray-400 hover:text-indigo-400"
                            }`}
                        >
                            ⭐ {r === "all" ? "Todas las calificaciones" : `${r} estrellas`} ({ratingCounts[r] ?? 0})
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">Precio</h3>
                <div className="flex items-center justify-between gap-3">
                    <input
                        type="number"
                        name="minPrice"
                        placeholder="Mínimo"
                        value={tempPriceRange.min ?? ""}
                        onChange={(e) =>
                            setTempPriceRange((prev) => ({
                                ...prev,
                                min: e.target.value === "" ? undefined : Number(e.target.value)
                            }))
                        }
                        className="w-full p-2 border rounded-md text-sm dark:bg-gray-800"
                    />
                    <span>-</span>
                    <input
                        type="number"
                        name="maxPrice"
                        placeholder="Máximo"
                        value={tempPriceRange.max ?? ""}
                        onChange={(e) =>
                            setTempPriceRange((prev) => ({
                                ...prev,
                                max: e.target.value === "" ? undefined : Number(e.target.value)
                            }))
                        }
                        className="w-full p-2 border rounded-md text-sm dark:bg-gray-800"
                    />
                </div>
            </div>

            <div>
                <h3 className="font-bold text-lg mb-2">Stock</h3>
                <ul className="space-y-1 text-sm">
                    {[
                        { label: "Más de 50 unidades", value: 50 },
                        { label: "Entre 20 y 50 unidades", value: 20 },
                        { label: "Entre 10 y 20 unidades", value: 10 },
                        { label: "Menos de 10 unidades", value: 1 },
                        { label: "Sin stock", value: 0 }
                    ].map(({ label, value }) => (
                        <li
                            key={value}
                            onClick={() => handleStockClick(value)}
                            className={`cursor-pointer transition-colors ${
                                filters.minStock === value
                                    ? "text-indigo-500 font-semibold"
                                    : "text-gray-600 dark:text-gray-400 hover:text-indigo-400"
                            }`}
                        >
                            📦 {label} ({stockCounts[value as keyof typeof stockCounts] ?? 0})
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
