import type { RawSession } from "@/types/supabase";

export default function UserTable({
    filteredUsers,
    onDeleteCooldown,
    onDelete
}: {
    filteredUsers: RawSession[] | null;
    /* eslint-disable no-unused-vars */
    onDeleteCooldown: (user: RawSession) => void;
    onDelete: (user: RawSession) => void;
    /* eslint-enable no-unused-vars */
}) {
    const HEADERS = ["Usuario", "Email", "Creado", "Acciones"];

    return (
        <table className="w-full py-6 px-8 mx-5 mt-5 mb-3 sm:w-auto border-collapse border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
            <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 [&>th]:p-4 [&>th]:text-gray-900 [&>th]:dark:text-gray-100 [&>th]:font-medium">
                    {HEADERS.map((header, index) => (
                        <th key={header} className={index < HEADERS.length - 2 ? "text-left" : "text-center"}>
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                        <UserRow
                            key={user.id}
                            user={user}
                            index={index}
                            hasCooldown={!!user.avatar_last_modified}
                            onDeleteCooldown={() => onDeleteCooldown(user)}
                            onDelete={() => onDelete(user)}
                        />
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

function UserRow({
    user,
    index,
    hasCooldown,
    onDeleteCooldown,
    onDelete
}: {
    user: RawSession;
    index: number;
    hasCooldown: boolean;
    onDeleteCooldown: () => void;
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
                {hasCooldown && (
                    <button
                        onClick={onDeleteCooldown}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded"
                    >
                        Eliminar Cooldown
                    </button>
                )}
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
