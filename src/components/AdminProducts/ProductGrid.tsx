import type { Product } from "@/types";

const LOAD_ANIMATION_DELAY = 100;

interface Props {
    filteredProducts: Product[];
    loading: boolean;
}

export default function ProductGrid({ filteredProducts, loading }: Props) {
    return (
        <main className="flex flex-col flex-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl py-6 px-8 mx-5 my-6 shadow-xl border border-gray-100 dark:border-gray-700">
            <ul className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 w-full">
                <li
                    className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl shadow-lg flex flex-col items-center justify-center
                               border border-gray-100 dark:border-gray-700 cursor-pointer 
                               opacity-0 translate-y-5 animate-fadeIn"
                    style={{ animationDelay: "0ms" }}
                >
                    <a href="/admin/dashboard/products/create" className="group flex flex-col items-center w-full">
                        <div
                            className="w-full h-40 mb-4 rounded-md 
                                       flex items-center justify-center 
                                       bg-indigo-100 dark:bg-indigo-950
                                       border-2 border-dashed border-indigo-400 dark:border-indigo-500
                                       group-hover:brightness-90 transition"
                        >
                            <span className="text-6xl text-indigo-500 dark:text-indigo-400">+</span>
                        </div>

                        <h3 className="font-extrabold text-lg mb-1 text-center text-gray-900 dark:text-gray-100">
                            Crear nuevo producto
                        </h3>

                        <p className="text-gray-500 dark:text-gray-400 text-xs text-center mb-3">
                            Agrega un nuevo producto a tu catálogo
                        </p>
                    </a>
                </li>

                {loading &&
                    Array.from({ length: 9 }).map((_, index) => {
                        return (
                            <li
                                key={index}
                                className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl shadow-lg 
                                           flex flex-col items-center border border-gray-100 dark:border-gray-700"
                            >
                                <div className="w-full h-40 mb-4 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
                                <div className="w-full h-6 mb-2 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                                <div className="w-full h-4 mb-3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                                <div className="w-1/2 h-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                            </li>
                        );
                    })}

                {!loading &&
                    filteredProducts.length > 0 &&
                    filteredProducts.map((product, index) => {
                        const delay = (index + 1) * LOAD_ANIMATION_DELAY;

                        return (
                            <li
                                key={product.id}
                                className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl shadow-lg 
                                           hover:shadow-2xl transition-all transform hover:-translate-y-1
                                           flex flex-col items-center border border-gray-100 dark:border-gray-700
                                           opacity-0 translate-y-5 animate-fadeIn"
                                style={{ animationDelay: `${delay}ms` }}
                            >
                                <a
                                    href={`/admin/dashboard/products/${product.id}`}
                                    className="group flex flex-col items-center w-full"
                                >
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-40 object-contain mb-4 rounded-md transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <h3 className="font-extrabold text-lg mb-1 text-center truncate w-full text-gray-900 dark:text-gray-100">
                                        {product.name}
                                    </h3>
                                </a>

                                <a
                                    href={`/admin/dashboard/products/${product.id}`}
                                    className="w-full text-center bg-indigo-500 text-white font-semibold py-2 px-4
                                               rounded-full hover:bg-indigo-600 transition-colors shadow-md
                                               hover:shadow-lg focus:outline-none focus:ring-4 
                                               focus:ring-indigo-300 dark:focus:ring-indigo-700"
                                >
                                    Ver Producto
                                </a>
                            </li>
                        );
                    })}

                {!loading && filteredProducts.length === 0 && (
                    <p className="text-center col-span-full text-gray-500 dark:text-gray-400">
                        No se encontraron productos que coincidan con la búsqueda.
                    </p>
                )}
            </ul>
        </main>
    );
}
