import { useDropzone } from "react-dropzone";
import { useState } from "react";
import ModalChangeAvatar from "@/components/Profile/ModalChangeAvatar";
import Pencil from "@/components/Icons/Pencil";
import Plus from "@/components/Icons/Plus";
import { toast } from "react-toastify";

export default function ChangeAvatarInput() {
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { "image/*": [] },
        multiple: false,
        onDrop: (acceptedFiles, fileRejections) => {
            if (fileRejections.length > 0) {
                toast.error("El archivo no es una imagen válida.");
                return;
            }

            const file = acceptedFiles[0];
            if (!file) return;

            setSelectedFile(file);
            setShowModal(true);
        }
    });

    const openModal = () => {
        setSelectedFile(null);
        setShowModal(true);
    };

    return (
        <>
            <div
                {...getRootProps()}
                onClick={openModal}
                className={`absolute top-0 left-0 w-full h-full rounded-full transition-all duration-300 bg-cover bg-center cursor-pointer group 
                ${isDragActive ? "bg-red-600/70" : "hover:bg-gray-800/90"}`}
            >
                <input {...getInputProps()} />

                <div
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    text-white text-3xl opacity-0 transition-opacity duration-200
                    group-hover:opacity-100 ${isDragActive ? "opacity-100" : ""}`}
                >
                    {isDragActive ? <Plus className="scale-[200%]" /> : <Pencil className="scale-[200%]" />}
                </div>
            </div>

            <ModalChangeAvatar show={showModal} onClose={() => setShowModal(false)} initialFile={selectedFile} />
        </>
    );
}
