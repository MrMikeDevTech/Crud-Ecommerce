import type { TestimonialWithAuthor } from "@/types/testimonials";

export function TestimonialTable({
    filteredTestimonials,
    onEdit,
    onDelete
}: {
    filteredTestimonials: TestimonialWithAuthor[] | null;
    /* eslint-disable no-unused-vars */
    onEdit: (t: TestimonialWithAuthor) => void;
    onDelete: (t: TestimonialWithAuthor) => void;
    /* eslint-enable no-unused-vars */
}) {
    const HEADERS = ["Usuario", "Mensaje", "Puntuación", "Fecha", "Acciones"];
    return (
        <table className="w-full py-6 px-8 mx-5 mt-5 mb-3 sm:w-auto border-collapse border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
            <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 [&>th]:p-4 [&>th]:text-gray-900 [&>th]:dark:text-gray-100 [&>th]:font-medium [&>th]:text-center">
                    {HEADERS.map((header) => (
                        <th key={header}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {filteredTestimonials && filteredTestimonials.length > 0 ? (
                    filteredTestimonials.map((testimonial, index) => (
                        <TableTestimonialRow
                            key={testimonial.id}
                            testimonial={testimonial}
                            index={index}
                            onEdit={() => onEdit(testimonial)}
                            onDelete={() => onDelete(testimonial)}
                        />
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="text-center py-6 text-gray-600 dark:text-gray-300">
                            No se encontraron testimonios.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}

function TableTestimonialRow({
    testimonial,
    index,
    onEdit,
    onDelete
}: {
    testimonial: TestimonialWithAuthor;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <tr
            className={`border-b border-gray-300 dark:border-gray-600 hover:brightness-90 transition [&>td]:p-4 ${
                index % 2 !== 0 ? "bg-white dark:bg-gray-800" : "bg-gray-200 dark:bg-gray-900"
            }`}
        >
            <td>
                <div className="flex items-center">
                    <img src={testimonial.author.avatar_url} className="w-10 h-10 rounded-full mr-3" />
                    <span className="text-gray-800 dark:text-gray-200">{testimonial.author.full_name}</span>
                </div>
            </td>
            <td className="text-gray-700 dark:text-gray-300">{testimonial.quote}</td>
            <td className="text-center text-lg font-bold text-white flex flex-row justify-center items-center gap-1">
                <span className="text-yellow-300">★</span>
                {testimonial.stars}
            </td>
            <td className="text-center text-gray-700 dark:text-gray-300">
                {new Date(testimonial.created_at).toLocaleDateString()}
            </td>
            <td className="flex gap-2 justify-center">
                <button
                    onClick={onEdit}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded"
                >
                    Editar
                </button>
                <button
                    onClick={onDelete}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                >
                    Eliminar
                </button>
            </td>
        </tr>
    );
}
