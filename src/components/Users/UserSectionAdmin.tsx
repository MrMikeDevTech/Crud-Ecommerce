import { useEffect, useState } from "react";
import UserSearch from "@/components/Users/UserSearch";
import Loader from "@/components/Loader";
import type { RawSession } from "@/types/supabase";
import { getAllSessions, deleteCooldownAvatar } from "@/services/supabase";
import { toast } from "react-toastify";
import UserTable from "./UserTable";

export default function UserSectionAdmin() {
    const [userQuery, setUserQuery] = useState<string>("");
    const [users, setUsers] = useState<RawSession[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<RawSession[]>([]);
    const [selectedUser, setSelectedUser] = useState<RawSession | null>(null);
    const [modalDeleteCooldown, setModalDeleteCooldown] = useState<boolean>(false);
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

    const handleDeleteCooldown = async () => {
        try {
            if (!selectedUser) return;

            const { success, error } = await deleteCooldownAvatar(selectedUser.id);

            if (!success || error) throw new Error(error || "Error al eliminar cooldown de avatar");

            toast.success("Cooldown de avatar eliminado correctamente");
            setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, avatar_last_modified: null } : u)));
            setFilteredUsers((prev) =>
                prev.map((u) => (u.id === selectedUser.id ? { ...u, avatar_last_modified: null } : u))
            );
            setModalDeleteCooldown(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error desconocido");
        }
    };

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
                    onDeleteCooldown={(user) => {
                        setSelectedUser(user);
                        setModalDeleteCooldown(true);
                    }}
                    onDelete={(user) => {
                        setSelectedUser(user);
                        setModalDelete(true);
                    }}
                />
            )}

            {modalDeleteCooldown && selectedUser && (
                <ModalDeleteCooldown
                    user={selectedUser}
                    onClose={() => setModalDeleteCooldown(false)}
                    onConfirm={handleDeleteCooldown}
                />
            )}

            {modalDelete && selectedUser && (
                <ModalDeleteUser user={selectedUser} onClose={() => setModalDelete(false)} onConfirm={handleDelete} />
            )}
        </>
    );
}

function ModalDeleteCooldown({
    user,
    onClose,
    onConfirm
}: {
    user: RawSession;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}) {
    const [countdown, setCountdown] = useState(5);
    const [canConfirm, setCanConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanConfirm(true);
        }
    }, [countdown]);

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm();
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-xl text-center">
                <h2 className="text-yellow-500 text-xl font-bold mb-4">Eliminar Cooldown de Avatar</h2>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    Estás a punto de permitir que <b>{user.full_name}</b> cambie nuevamente su avatar.
                    <br />
                    <strong className="text-yellow-500">Esto no afecta su cuenta ni privilegios.</strong>
                </p>

                <button
                    onClick={handleConfirm}
                    disabled={!canConfirm || loading}
                    className={`flex flex-row gap-3 justify-center items-center w-full py-3 rounded-lg font-semibold shadow-md transition-all text-white ${
                        !canConfirm || loading
                            ? "bg-yellow-400 cursor-not-allowed"
                            : "bg-yellow-600 hover:bg-yellow-700"
                    }`}
                >
                    {loading && <Loader />}
                    {loading ? "Eliminando..." : canConfirm ? "Eliminar Cooldown" : `Esperar ${countdown}s`}
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
