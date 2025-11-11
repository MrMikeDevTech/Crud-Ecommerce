import { useEffect, useRef, useState } from "react";
import type { Product } from "@/types";

export default function SearchBar() {
    const [autocompleteState, setAutocompleteState] = useState<{
        collections: any[];
        isOpen: boolean;
    }>({
        collections: [],
        isOpen: false
    });

    const [initialQuery] = useState(() => {
        return new URLSearchParams(window.location.search).get("q") ?? "";
    });

    const formRef = useRef(null);
    const inputRef = useRef(null);
    const panelRef = useRef(null);
    // eslint-disable-next-line no-undef
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const [autocomplete, setAutocomplete] = useState<any>(null);

    useEffect(() => {
        (async () => {
            const Algolia = await import("@algolia/autocomplete-core");
            const instance = Algolia.createAutocomplete({
                initialState: {
                    query: initialQuery
                },
                placeholder: "Buscar tu producto...",
                onStateChange: ({ state }) => setAutocompleteState(state),
                getSources: () => [
                    {
                        sourceId: "offers-backend-api",
                        getItems: async ({ query }: { query: string }) => {
                            if (debounceTimeout.current) {
                                clearTimeout(debounceTimeout.current);
                            }
                            return new Promise((resolve) => {
                                debounceTimeout.current = setTimeout(async () => {
                                    if (query) {
                                        const response = await fetch(`/api/products/search?q=${query}`);
                                        const data: Product[] = await response.json();
                                        resolve(data);
                                    } else {
                                        resolve([]);
                                    }
                                }, 300);
                            }) as Promise<Product[]>;
                        }
                    }
                ]
            });
            setAutocomplete(instance);
        })();
    }, []);

    const formProps =
        autocomplete?.getFormProps({
            inputElement: inputRef.current
        }) ?? {};
    const inputProps =
        autocomplete?.getInputProps({
            inputElement: inputRef.current
        }) ?? {};

    return (
        <form
            className="flex-grow flex justify-center gap-4 relative"
            ref={formRef}
            {...(formProps as any)}
            onSubmit={(e) => {
                e.preventDefault();
                if (inputProps.value) {
                    window.location.href = `/search?q=${inputProps.value}`;
                }
            }}
        >
            <input
                type="text"
                className="w-96 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-150"
                value={inputProps.value ?? ""}
                placeholder="Buscar tu producto..."
                onChange={inputProps.onChange ?? (() => {})}
                {...(inputProps as any)}
            />
            <button
                type="submit"
                className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-400 dark:hover:bg-indigo-500 transition-colors duration-150"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path stroke="none" d="M0 0h24v24H0z"></path>
                    <path d="M3 10a7 7 0 1 0 14 0 7 7 0 1 0-14 0M21 21l-6-6"></path>
                </svg>
            </button>

            {autocompleteState.isOpen && (
                <div
                    className="absolute mt-16 -top-5 -left-14 right-0 mx-auto w-96 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden rounded-lg shadow-lg z-10 transition-colors duration-150"
                    ref={panelRef}
                    {...(autocomplete.getPanelProps() as any)}
                >
                    {autocompleteState.collections.map((collection, index) => {
                        const { items } = collection;
                        return (
                            <section key={`section-${index}`}>
                                {items.length > 0 && (
                                    <ul {...autocomplete.getListProps()}>
                                        {items.slice(0, 7).map((item: Product) => (
                                            <AutocompleteItem key={item.id} {...item} />
                                        ))}
                                        {items.length > 7 && (
                                            <li
                                                className="px-4 py-2 text-center text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                                                onClick={() => (window.location.href = `/search?q=${inputProps.value}`)}
                                            >
                                                Ver todos
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </section>
                        );
                    })}
                </div>
            )}
        </form>
    );
}

function AutocompleteItem({ id, name, description, image, price }: Product) {
    return (
        <li className="border-b last:border-b-0 border-gray-100 dark:border-gray-700">
            <a
                href={`/product/${id}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
            >
                <img
                    src={image}
                    alt={name}
                    className="w-12 h-12 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                    style={{
                        viewTransitionName: `product-id-${id}`
                    }}
                />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                        <h3
                            className="text-sm font-medium text-gray-900 dark:text-white truncate"
                            style={{
                                viewTransitionName: `product-name-${id}`
                            }}
                        >
                            {name}
                        </h3>
                        <span
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 ml-2"
                            style={{
                                viewTransitionName: `product-price-${id}`
                            }}
                        >
                            ${price.toFixed(2)}
                        </span>
                    </div>
                    <p
                        className="text-xs text-gray-500 dark:text-gray-400 truncate"
                        style={{
                            viewTransitionName: `product-description-${id}`
                        }}
                    >
                        {description}
                    </p>
                </div>
            </a>
        </li>
    );
}
