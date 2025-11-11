import { useState, useEffect } from "react";
import Loader from "@/components/Loader";
import { toast } from "react-toastify";

export function ModalCreateTestimonial({
    onSubmit,
    onCancel,
    loading
}: {
    /* eslint-disable-next-line no-unused-vars */
    onSubmit: (text: string, stars: 1 | 2 | 3 | 4 | 5) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
}) {
    const [text, setText] = useState("");
    const [stars, setStars] = useState<1 | 2 | 3 | 4 | 5>(0 as 1 | 2 | 3 | 4 | 5);
    const [hoverStars, setHoverStars] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (loading || submitting) return;
        setSubmitting(true);
        try {
            if (stars === (0 as 1 | 2 | 3 | 4 | 5)) {
                toast.error("Por favor, selecciona una calificación de estrellas.");
                return;
            }
            await onSubmit(text, stars);
        } finally {
            setSubmitting(false);
        }
    };

    const displayStars = hoverStars || stars;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl p-6 shadow-2xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Crear Testimonio</h2>

                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                    Tu experiencia
                </label>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-600 outline-none"
                    placeholder="Cuenta brevemente tu experiencia..."
                />

                <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                        Calificación
                    </label>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => {
                                const active = s <= displayStars;
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        onMouseEnter={() => setHoverStars(s)}
                                        onMouseLeave={() => setHoverStars(0)}
                                        onClick={() => setStars(s as 1 | 2 | 3 | 4 | 5)}
                                        aria-label={`${s} estrella${s > 1 ? "s" : ""}`}
                                        className={`text-3xl transition ${
                                            active ? "text-yellow-400" : "text-gray-400"
                                        }`}
                                    >
                                        ★
                                    </button>
                                );
                            })}
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            {displayStars} {displayStars === 1 ? "estrella" : "estrellas"}
                        </div>
                    </div>
                </div>

                <div className="flex mt-6 gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || submitting}
                        className={`flex flex-row gap-3 justify-center items-center flex-1 py-3 rounded-lg font-semibold shadow-md transition-all ${
                            loading || submitting
                                ? "bg-indigo-400 text-gray-100 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                    >
                        {(loading || submitting) && <Loader />}
                        <span className="ml-2">{loading || submitting ? "Guardando..." : "Guardar"}</span>
                    </button>

                    <button
                        onClick={onCancel}
                        disabled={loading || submitting}
                        className="flex-1 py-3 rounded-lg font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}

export function ModalEditTestimonial({
    initialText,
    onSubmit,
    onCancel,
    loading
}: {
    initialText: string;
    /* eslint-disable-next-line no-unused-vars */
    onSubmit: (text: string) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
}) {
    const [text, setText] = useState(initialText);
    const handleSubmit = () => onSubmit(text);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl p-6 shadow-2xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Editar Testimonio</h2>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-600 outline-none"
                />
                <div className="flex mt-4 gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`flex flex-row gap-3 justify-center items-center flex-1 py-3 rounded-lg font-semibold shadow-md transition-all ${
                            loading
                                ? "bg-indigo-400 text-gray-100 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                    >
                        {loading && <Loader />}
                        Guardar cambios
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-3 rounded-lg font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}

export function ModalDeleteTestimonial({
    onConfirm,
    onCancel,
    loading
}: {
    onConfirm: () => Promise<void>;
    onCancel: () => void;
    loading: boolean;
}) {
    const [countdown, setCountdown] = useState(3);
    const [canDelete, setCanDelete] = useState(false);
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
            return () => clearTimeout(timer);
        } else setCanDelete(true);
    }, [countdown]);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl p-6 shadow-2xl w-full max-w-sm">
                <h2 className="text-red-500 text-xl font-bold mb-4">Eliminar Testimonio</h2>
                <p className="mb-6 text-gray-700 dark:text-gray-300">Esta acción es irreversible.</p>
                <button
                    onClick={onConfirm}
                    disabled={!canDelete || loading}
                    className={`flex flex-row gap-3 justify-center items-center w-full py-3 rounded-lg font-semibold shadow-md transition-all ${
                        !canDelete || loading
                            ? "bg-red-400 text-gray-100 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                >
                    {loading && <Loader />}
                    {loading ? "Eliminando..." : canDelete ? "Eliminar" : `Esperar ${countdown}s`}
                </button>
                <button
                    onClick={onCancel}
                    disabled={loading}
                    className="w-full mt-3 py-3 rounded-lg font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}
