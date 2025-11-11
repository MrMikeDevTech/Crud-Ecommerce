import { checkAvatarUpdateCooldown } from "@/helpers/checkAvatarUpdateCooldown";
import {
    updateLastAvatarUpdate as updateLastAvatarUpdateDb,
    updateProfileAvatar,
    getLastAvatarUpdate
} from "@/services/supabase";
import { useAvatarDropzone } from "@/hooks/useAvatarDropzone";
import { useEffect, useState } from "react";
import { useModalKeyboardClose } from "@/hooks/useModalKeyboardClose";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { useSession } from "@/hooks/useSession";
import Check from "@/components/Icons/Check";
import CircleX from "@/components/Icons/CircleX";
import Loading from "@/components/Icons/Loading";
import { toast } from "react-toastify";

type ModalChangeAvatarProps = {
    show: boolean;
    onClose: () => void;
    initialFile: File | null;
};

export default function ModalChangeAvatar({ show, onClose, initialFile }: ModalChangeAvatarProps) {
    const [file, setFile] = useState<ModalChangeAvatarProps["initialFile"]>(initialFile);
    const [loading, setLoading] = useState(false);
    const { getRootProps, getInputProps, isDragActive } = useAvatarDropzone(setFile);
    const { getSession, updateAvatarUrl, updateAvatarLastModified } = useSession();
    const { $id, $avatar_last_modified } = getSession();

    useModalKeyboardClose(show, onClose);

    useModalScrollLock(show);

    useEffect(() => {
        if (show) setFile(initialFile);
    }, [show, initialFile]);

    const handleSave = async () => {
        if (loading || !file) return;

        const toastId = toast.loading("Actualizando avatar...");
        setLoading(true);

        const { lastAvatarUpdate } = await getLastAvatarUpdate($id!);

        let avatarUpdateDate = null;
        if (lastAvatarUpdate) {
            avatarUpdateDate = new Date(lastAvatarUpdate);
        } else if ($avatar_last_modified) {
            avatarUpdateDate = new Date($avatar_last_modified);
        }

        const { canUpdate, remaining } = checkAvatarUpdateCooldown(avatarUpdateDate, 8);

        try {
            if (!canUpdate) {
                throw new Error(
                    `Debes esperar ${remaining!.hours}h ${remaining!.minutes}m para volver a cambiar tu avatar.`
                );
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("id", $id!);

            const res = await fetch("/api/cloudinary/uploadAvatar", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Falla al subir la imagen.");
            }

            const imageUrl = data.url;

            if (!imageUrl) {
                throw new Error("No se pudo obtener la URL de la imagen.");
            }

            const { error, updatedUrlPhoto } = await updateProfileAvatar({
                id: $id!,
                url_photo: imageUrl
            });

            if (error) {
                throw new Error(error);
            }

            if (!updatedUrlPhoto) {
                throw new Error("No se pudo actualizar la URL de la imagen.");
            }

            updateAvatarUrl(updatedUrlPhoto);

            const { error: err, updatedDate } = await updateLastAvatarUpdateDb({
                id: $id!
            });

            if (err) {
                throw new Error(err);
            }

            if (!updatedDate) {
                throw new Error("No se pudo actualizar la fecha de la imagen.");
            }

            updateAvatarLastModified(updatedDate);

            toast.success("Avatar actualizado exitosamente.");
        } catch (e) {
            if (e instanceof Error) toast.error(e.message);
            else toast.error("Error al actualizar el avatar.");
        } finally {
            onClose();
            setLoading(false);
            toast.dismiss(toastId);
        }
    };

    const handleRemove = () => {
        setFile(null);
    };

    if (!show) return null;

    return (
        <section
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="flex flex-col gap-4 bg-white dark:bg-[#1e293b] text-dark dark:text-light rounded-lg shadow-lg p-8 relative animate-modal-in max-w-[90vw] w-[400px] min-h-[300px] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="absolute top-4 right-4 text-gray-500 hover:text-white text-2xl" onClick={onClose}>
                    <CircleX />
                </button>

                <h2 className="text-2xl font-bold mb-4 dark:text-white text-[#1e293b]  text-center">Cambiar avatar</h2>

                <div className="flex flex-col flex-1 gap-4">
                    {!file || isDragActive ? (
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed p-6 rounded-md text-center cursor-pointer transition min-h-28 h-full flex flex-1 items-center justify-center 
                            ${isDragActive ? "bg-gray-500/10" : "hover:bg-gray-300/10"}`}
                        >
                            <input {...getInputProps()} />
                            <p className="text-gray-500/90 max-w-[25ch] text-xl">
                                {isDragActive
                                    ? "Suelta tu imagen aquí"
                                    : "Arrastra una imagen o haz clic para seleccionarla"}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-8">
                            <div {...getRootProps()} className="cursor-pointer">
                                <input {...getInputProps()} />
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="Preview"
                                    width={150}
                                    height={150}
                                    className="rounded-full border aspect-square object-cover"
                                />
                            </div>

                            <div className="flex gap-2 w-full">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className={`flex-1 py-2 rounded text-white font-bold ${
                                        loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"
                                    }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loading />
                                            <span>Guardando...</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Check />
                                            <span>Guardar</span>
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={handleRemove}
                                    disabled={loading}
                                    className="flex-1 py-2 rounded bg-red-500 hover:bg-red-700 text-white font-bold"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <CircleX />
                                        <span>Eliminar</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
