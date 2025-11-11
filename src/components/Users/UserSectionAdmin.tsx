import { useEffect, useState } from "react";
import UserSearch from "@/components/Users/UserSearch";
import Loader from "@/components/Loader";
import type { RawSession } from "@/types/supabase";
import { getAllSessions } from "@/services/supabase";
import { toast } from "react-toastify";

export default function UserSectionAdmin() {
    const [userQuery, setUserQuery] = useState<string>("");
    const [users, setUsers] = useState<RawSession[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<RawSession[]>([]);
    const [selectedUser, setSelectedUser] = useState<RawSession | null>(null);
    const [modalDelete, setModalDelete] = useState<boolean>(false);
    const [loadingList, setLoadingList] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            const { sessions, error } = await getAllSessions();
            if (error) return toast.error("Error cargando usuarios");
            setUsers(sessions);
            setFilteredUsers(sessions);
            setLoadingList(false);
        })();
    }, []);

    useEffect(() => {
        const q = userQuery.toLowerCase();
        setFilteredUsers(
            users.filter((u) => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
        );
    }, [userQuery, users]);

    const handleDelete = async () => {
        try {
            if (!selectedUser) return;

            const { id: userId } = selectedUser;

            const res = await fetch("/api/auth/delete-account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });

            if (!res.ok) throw new Error("Error al eliminar usuario");

            toast.success("Usuario eliminado correctamente");

            // Quitar de la lista sin recargar
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            setFilteredUsers((prev) => prev.filter((u) => u.id !== userId));

            setModalDelete(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error desconocido");
        }
    };

    return (
        <>
            <UserSearch searchQuery={userQuery} setSearchQuery={setUserQuery} />

            {loadingList ? (
                <div className="flex justify-center py-10">
                    <Loader />
                </div>
            ) : (
                <UserTable
                    filteredUsers={filteredUsers}
                    onDelete={(user) => {
                        setSelectedUser(user);
                        setModalDelete(true);
                    }}
                />
            )}

            {modalDelete && selectedUser && (
                <ModalDeleteUser user={selectedUser} onClose={() => setModalDelete(false)} onConfirm={handleDelete} />
            )}
        </>
    );
}

function UserTable({
    filteredUsers,
    onDelete
}: {
    filteredUsers: RawSession[] | null;
    /* eslint-disable-next-line no-unused-vars */
    onDelete: (user: RawSession) => void;
}) {
    const HEADERS = ["Usuario", "Email", "Creado", "Acciones"];

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
                {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                        <UserRow key={user.id} user={user} index={index} onDelete={() => onDelete(user)} />
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="text-center py-6 text-gray-600 dark:text-gray-300">
                            No se encontraron usuarios.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}

function UserRow({ user, index, onDelete }: { user: RawSession; index: number; onDelete: () => void }) {
    return (
        <tr
            className={`border-b border-gray-300 dark:border-gray-600 hover:brightness-90 transition [&>td]:p-4 ${
                index % 2 !== 0 ? "bg-white dark:bg-gray-800" : "bg-gray-200 dark:bg-gray-900"
            }`}
        >
            <td>
                <div className="flex items-center">
                    <img
                        src={user.avatar_url || "/images/default-avatar.png"}
                        className="w-10 h-10 rounded-full mr-3"
                    />
                    <span className="text-gray-800 dark:text-gray-200">{user.full_name}</span>
                </div>
            </td>
            <td className="text-gray-700 dark:text-gray-300">{user.email}</td>
            <td className="text-center text-gray-700 dark:text-gray-300">
                {new Date(user.created_at).toLocaleDateString()}
            </td>
            <td className="flex gap-2 justify-center">
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

function ModalDeleteUser({
    user,
    onClose,
    onConfirm
}: {
    user: RawSession;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}) {
    const [countdown, setCountdown] = useState(10);
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
                <h2 className="text-red-500 text-xl font-bold mb-4">Eliminar Usuario</h2>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    ¿Seguro que deseas eliminar a <b>{user.full_name}</b>?<br />
                    <strong className="text-red-500">Esta acción es irreversible.</strong>
                </p>

                <button
                    onClick={handleConfirm}
                    disabled={!canDelete || loading}
                    className={`flex flex-row gap-3 justify-center items-center w-full py-3 rounded-lg font-semibold shadow-md transition-all text-white ${
                        !canDelete || loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                    }`}
                >
                    {loading && <Loader />}
                    {loading ? "Eliminando..." : canDelete ? "Eliminar Usuario" : `Esperar ${countdown}s`}
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
