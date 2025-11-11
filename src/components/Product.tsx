export default function Product({
    id,
    name,
    description,
    price,
    image,
    noViewTransition = false
}: {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    noViewTransition?: boolean;
}) {
    return (
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col transition-colors duration-300">
            {image && (
                <img
                    src={image}
                    alt={name}
                    className="w-full h-40 object-contain mb-4 rounded-md transition-transform duration-300 group-hover:scale-105"
                    style={!noViewTransition ? { viewTransitionName: `product-id-${id}` } : undefined}
                />
            )}
            <h2
                className="text-lg font-bold mb-2 text-gray-900 truncate dark:text-gray-100"
                style={!noViewTransition ? { viewTransitionName: `product-name-${id}` } : undefined}
            >
                {name}
            </h2>
            <p
                className="text-gray-700 dark:text-gray-300 mb-4"
                style={!noViewTransition ? { viewTransitionName: `product-description-${id}` } : undefined}
            >
                {description}
            </p>
            <div className="mt-auto flex items-center justify-between">
                <span
                    className="text-xl font-semibold text-blue-600 dark:text-blue-400"
                    style={!noViewTransition ? { viewTransitionName: `product-price-${id}` } : undefined}
                >
                    ${price}
                </span>
                <a
                    href={`/product/${id}`}
                    className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                    Ver más
                </a>
            </div>
        </article>
    );
}
