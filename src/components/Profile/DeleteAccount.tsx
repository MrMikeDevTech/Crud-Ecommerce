import { useState, useEffect } from "react";
import Loader from "@/components/Loader";
import { useSession } from "@/hooks/useSession";
import { toast } from "react-toastify";

export default function DeleteAccount() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isClient, setIsClient] = useState(false);
    const { getSession } = useSession();

    const profile = getSession();
    const { $id } = profile ?? {};

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleDeleteAccount = async () => {
        if (!$id) return;

        await fetch("/api/auth/delete-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: $id })
        });

        toast.success("Cuenta eliminada correctamente, redirigiendo...");

        setTimeout(() => {
            window.location.href = "/api/auth/logout";
        }, 2000);
    };

    if (!isClient) return null;

    return (
        <>
            <footer className="flex flex-col mt-8 items-center bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-red-300/20 dark:border-red-500/20 text-center">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">Eliminar cuenta</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Si eliminas tu cuenta, toda tu información se perderá permanentemente.
                </p>
                <span className="block text-sm italic text-red-600 dark:text-red-400 font-medium mb-2">
                    Esta acción es irreversible.
                </span>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
                >
                    Eliminar cuenta
                </button>
            </footer>

            {isModalOpen && (
                <ModalDeleteAccount onClose={() => setIsModalOpen(false)} onConfirm={handleDeleteAccount} />
            )}
        </>
    );
}

function ModalDeleteAccount({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => Promise<void> }) {
    const [countdown, setCountdown] = useState(15);
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

    const handleDelete = async () => {
        setLoading(true);
        await onConfirm();
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-xl text-center">
                <h2 className="text-red-500 text-xl font-bold mb-4">Eliminar Cuenta</h2>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    ¿Seguro que deseas eliminar tu cuenta? <br />
                    <strong className="text-red-500">Esta acción es irreversible.</strong>
                </p>

                <button
                    onClick={handleDelete}
                    disabled={!canDelete || loading}
                    className={`flex flex-row gap-3 justify-center items-center w-full py-3 rounded-lg font-semibold shadow-md transition-all text-white 
                    ${!canDelete || loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                >
                    {loading && <Loader />}
                    {loading ? "Eliminando..." : canDelete ? "Eliminar cuenta" : `Esperar ${countdown}s`}
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
