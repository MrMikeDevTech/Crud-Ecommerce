import { useEffect, useState } from "react";
import Testimonials from "@/components/Testimonials/TestimonialsCarroucel";
import {
    addTestimonial,
    deleteTestimonial,
    updateTestimonial,
    getTestimonialByAuthorId,
    getAllTestimonials
} from "@/services/supabase";
import { useSession } from "@/hooks/useSession";
import {
    ModalCreateTestimonial,
    ModalEditTestimonial,
    ModalDeleteTestimonial
} from "@/components/Testimonials/TestmonialModal";
import { toast } from "react-toastify";
import type { RawTestimonial } from "@/types/supabase";
import type { TestimonialWithAuthor } from "@/types/testimonials";

export default function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState<TestimonialWithAuthor[] | null>([]);
    const [userHasTestimonial, setUserHasTestimonial] = useState<boolean>(false);
    const [userTestimonial, setUserTestimonial] = useState<RawTestimonial | null>(null);
    const [modalState, setModalState] = useState({ create: false, edit: false, delete: false });
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const { getSession } = useSession();

    useEffect(() => {
        const profile = getSession();
        setUserId(profile?.$id || null);
    }, [getSession]);

    useEffect(() => {
        if (!userId) return;
        (async () => {
            const { testimonial, error } = await getTestimonialByAuthorId(userId);
            if (error) return;
            setUserHasTestimonial(!!testimonial);
            setUserTestimonial(testimonial ?? null);
        })();
    }, [userId]);

    useEffect(() => {
        (async () => {
            const { testimonials, error } = await getAllTestimonials();
            if (!error && testimonials) {
                setTestimonials(testimonials);
            }
        })();
    }, []);

    const refreshTestimonials = async () => {
        const { testimonials, error } = await getAllTestimonials();
        if (!error && testimonials) {
            setTestimonials(testimonials);
        }
    };

    const handleModal = (type: "create" | "edit" | "delete", state: boolean) => {
        setModalState({
            create: type === "create" && state,
            edit: type === "edit" && state,
            delete: type === "delete" && state
        });
    };

    const handleCreate = async (text: string, stars: 1 | 2 | 3 | 4 | 5) => {
        setLoading(true);

        try {
            const { testimonial: TExist } = await getTestimonialByAuthorId(userId!);

            if (TExist) {
                throw new Error("Ya tienes tu opinión publicada.");
            }

            const { testimonial, error } = await addTestimonial({
                quote: text,
                stars,
                author_id: userId!
            });

            if (error || !testimonial) {
                throw new Error("Error al crear el testimonio.");
            }

            await refreshTestimonials();

            setUserHasTestimonial(true);
            setUserTestimonial(testimonial);
            handleModal("create", false);
            toast.success("Gracias por tu opinión.");
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (text: string) => {
        if (!userHasTestimonial) return;
        setLoading(true);

        try {
            const { testimonial: existingTestimonial } = await getTestimonialByAuthorId(userId!);

            if (!existingTestimonial) {
                throw new Error("No se encontró tu opinión.");
            }

            const { updated, error } = await updateTestimonial(existingTestimonial.id, { quote: text });

            if (error || !updated) {
                throw new Error("Error al actualizar tu opinión.");
            }
            await refreshTestimonials();
            setUserTestimonial(updated);
            handleModal("edit", false);
            toast.success("Tu opinión se actualizó con éxito.");
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!userHasTestimonial) return;
        setLoading(true);

        try {
            const { testimonial: existingTestimonial } = await getTestimonialByAuthorId(userId!);
            if (!existingTestimonial) {
                throw new Error("No se encontró tu opinión.");
            }
            const { success, error } = await deleteTestimonial(existingTestimonial.id);

            if (error || !success) {
                throw new Error("Error al eliminar tu opinión.");
            }

            await refreshTestimonials();

            setUserTestimonial(null);
            setUserHasTestimonial(false);
            handleModal("delete", false);
            toast.success("Tu opinión se eliminó con éxito.");
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex flex-col items-center gap-6 py-10 mb-10 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lo que dicen nuestros clientes:</h2>

            <Testimonials testimonials={testimonials} />

            {testimonials && testimonials.length === 0 && (
                <p className="text-gray-600 dark:text-gray-300">
                    Aún no hay opiniones, sé el primero en dejar la tuya.
                </p>
            )}

            <div className="mt-6 flex flex-row justify-center items-center gap-3">
                {!userHasTestimonial && (
                    <button
                        onClick={() => handleModal("create", true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
                    >
                        Agregar Testimonio
                    </button>
                )}

                {userHasTestimonial && (
                    <>
                        <button
                            onClick={() => handleModal("edit", true)}
                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold"
                        >
                            Editar Testimonio
                        </button>

                        <button
                            onClick={() => handleModal("delete", true)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
                        >
                            Eliminar Testimonio
                        </button>
                    </>
                )}
            </div>

            {modalState.create && (
                <ModalCreateTestimonial
                    onSubmit={handleCreate}
                    onCancel={() => handleModal("create", false)}
                    loading={loading}
                />
            )}

            {modalState.edit && (
                <ModalEditTestimonial
                    initialText={userTestimonial!.quote}
                    onSubmit={handleEdit}
                    onCancel={() => handleModal("edit", false)}
                    loading={loading}
                />
            )}

            {modalState.delete && (
                <ModalDeleteTestimonial
                    onConfirm={handleDelete}
                    onCancel={() => handleModal("delete", false)}
                    loading={loading}
                />
            )}
        </section>
    );
}
