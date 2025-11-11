interface Props {
    searchQuery: string;
    /* eslint-disable no-unused-vars */
    setSearchQuery: (v: string) => void;
}

export default function TestimonialSeach({ searchQuery, setSearchQuery }: Props) {
    return (
        <header className="flex flex-col justify-center items-center py-6 px-8 mx-5 mt-5 mb-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <label htmlFor="search" className="mb-2 text-lg font-bold text-gray-700 dark:text-gray-300 text-center">
                Introduce el nombre o email del testimonial que deseas buscar:
            </label>

            <input
                id="search"
                type="text"
                className="w-full sm:w-96 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-600
                           bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-150"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tu testimonio..."
            />
        </header>
    );
}
