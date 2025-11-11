import React, { useEffect, useState } from "react";
import Loader from "@/components/Loader";

export default function ModalConfirmDeleteProduct({
    onConfirm,
    onCancel,
    loading
}: {
    onConfirm: () => void;
    onCancel: () => void;
    productName: string;
    loading: boolean;
}) {
    const [countdown, setCountdown] = useState(3);
    const [canDelete, setCanDelete] = useState(false);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown((c) => c - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setCanDelete(true);
        }
    }, [countdown]);

    const buttonText = loading ? "Eliminando..." : canDelete ? "Borrar Producto" : `Esperar ${countdown}s para borrar`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100 opacity-100">
                <h3 className="text-2xl font-bold text-red-500 mb-4 flex items-center gap-2">
                    ⚠️ Confirmar Eliminación ⚠️
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    ¿Estás a punto de eliminar permanentemente este producto?. Esta acción es irreversible.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        disabled={!canDelete || loading}
                        className={`flex items-center justify-center w-full font-semibold py-3 rounded-lg shadow-md transition-all ${
                            !canDelete || loading
                                ? "bg-red-400 text-gray-100 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                    >
                        {loading && <Loader />}
                        <span>{buttonText}</span>
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold border transition ${
                            loading
                                ? "border-gray-400 text-gray-500 cursor-not-allowed"
                                : "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                        }`}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
