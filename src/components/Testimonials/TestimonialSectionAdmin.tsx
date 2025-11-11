import { useEffect, useState } from "react";
import { getAllTestimonials, deleteTestimonial, updateTestimonial } from "@/services/supabase";
import TestimonialSearch from "@/components/Testimonials/TestimonialSearch";
import type { TestimonialWithAuthor } from "@/types/testimonials";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import { TestimonialTable } from "@/components/Testimonials/TestimonialTable";

export default function TestimonialSectionAdmin() {
    const [testimonialQuery, setTestimonialQuery] = useState("");
    const [testimonials, setTestimonials] = useState<TestimonialWithAuthor[] | null>([]);
    const [filteredTestimonials, setFilteredTestimonials] = useState<TestimonialWithAuthor[] | null>([]);

    const [selectedTestimonial, setSelectedTestimonial] = useState<TestimonialWithAuthor | null>(null);
    const [modalEdit, setModalEdit] = useState(false);
    const [modalDelete, setModalDelete] = useState(false);

    useEffect(() => {
        (async () => {
            const { testimonials, error } = await getAllTestimonials();
            if (error) return;
            setTestimonials(testimonials);
            setFilteredTestimonials(testimonials);
        })();
    }, []);

    useEffect(() => {
        if (!testimonials) return;
        const q = testimonialQuery.toLowerCase();

        const filtered = testimonials.filter((t) => {
            return (
                t.author.full_name.toLowerCase().includes(q) ||
                t.author.email.toLowerCase().includes(q) ||
                t.quote.toLowerCase().includes(q)
            );
        });

        setFilteredTestimonials(filtered);
    }, [testimonialQuery, testimonials]);

    const handleEdit = async (text: string, stars: number) => {
        if (!selectedTestimonial) return;
        const { updated, error } = await updateTestimonial(selectedTestimonial.id, { quote: text, stars });
        if (error) {
            toast.error("Error al actualizar testimonio");
            return;
        }
        if (updated) {
            setTestimonials(
                testimonials!.map((t) =>
                    t.id === updated.id ? { ...t, quote: updated.quote, stars: updated.stars } : t
                )
            );
        }
        setModalEdit(false);
        toast.success("Testimonio actualizado");
    };

    const handleDelete = async () => {
        if (!selectedTestimonial) return;
        const { success } = await deleteTestimonial(selectedTestimonial.id);
        if (!success) {
            toast.error("Error al eliminar testimonio");
            return;
        }
        setTestimonials(testimonials!.filter((t) => t.id !== selectedTestimonial.id));
        setModalDelete(false);
        toast.success("Testimonio eliminado");
    };

    return (
        <>
            <TestimonialSearch searchQuery={testimonialQuery} setSearchQuery={setTestimonialQuery} />
            <TestimonialTable
                filteredTestimonials={filteredTestimonials}
                onEdit={(t) => {
                    setSelectedTestimonial(t);
                    setModalEdit(true);
                }}
                onDelete={(t) => {
                    setSelectedTestimonial(t);
                    setModalDelete(true);
                }}
            />

            {modalEdit && selectedTestimonial && (
                <ModalEditTestimonial
                    testimonial={selectedTestimonial}
                    onClose={() => setModalEdit(false)}
                    onSubmit={handleEdit}
                />
            )}

            {modalDelete && selectedTestimonial && (
                <ModalDeleteTestimonial
                    testimonial={selectedTestimonial}
                    onClose={() => setModalDelete(false)}
                    onConfirm={handleDelete}
                />
            )}
        </>
    );
}

function ModalEditTestimonial({
    testimonial,
    onClose,
    onSubmit
}: {
    testimonial: TestimonialWithAuthor;
    onClose: () => void;
    /* eslint-disable-next-line no-unused-vars */
    onSubmit: (text: string, stars: number) => void;
}) {
    const [text, setText] = useState(testimonial.quote);
    const [stars, setStars] = useState(testimonial.stars);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 text-black dark:text-white">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-xl">
                <h2 className="text-xl font-bold mb-4">Editar Testimonio</h2>

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-900 border mb-3"
                    rows={4}
                />

                <div className="flex justify-center text-2xl gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button
                            key={n}
                            onClick={() => setStars(n)}
                            className={n <= stars ? "text-yellow-400" : "text-gray-400"}
                        >
                            ★
                        </button>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => onSubmit(text, stars)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
                    >
                        Guardar
                    </button>
                    <button onClick={onClose} className="flex-1 border dark:border-gray-600 py-2 rounded-lg">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}

function ModalDeleteTestimonial({
    testimonial,
    onClose,
    onConfirm
}: {
    testimonial: TestimonialWithAuthor;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}) {
    const [countdown, setCountdown] = useState(3);
    const [canDelete, setCanDelete] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanDelete(true);
        }
    }, [countdown]);

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm();
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-xl text-center">
                <h2 className="text-red-500 text-xl font-bold mb-4">Eliminar Testimonio</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    ¿Seguro que deseas eliminar el testimonio de <b>{testimonial.author.full_name}</b>? Esta acción es
                    irreversible.
                </p>

                <button
                    onClick={handleConfirm}
                    disabled={!canDelete || loading}
                    className={`flex flex-row gap-3 justify-center items-center w-full py-3 rounded-lg font-semibold shadow-md transition-all text-black dark:text-white ${
                        !canDelete || loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                    }`}
                >
                    {loading && <Loader />}
                    {loading ? "Eliminando..." : canDelete ? "Eliminar" : `Esperar ${countdown}s`}
                </button>

                <button
                    onClick={onClose}
                    disabled={loading}
                    className="w-full mt-3 py-3 rounded-lg font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}
