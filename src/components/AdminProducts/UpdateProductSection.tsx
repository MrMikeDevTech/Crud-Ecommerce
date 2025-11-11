import { toast } from "react-toastify";
import { updateProduct, deleteProduct } from "@/services/supabase";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { useProductDropzone } from "@/hooks/useProductDropzone";
import Loader from "@/components/Loader";
import ModalConfirmDeleteProduct from "@/components/AdminProducts/ModalConfirmDeleteProduct";
import React, { useEffect, useState, useRef } from "react";
import type { Product } from "@/types";

export default function UpdateProductSection({ product }: { product: Product }) {
    const [file, setFile] = useState<File | null>(null);

    const originalImage = product.image || null;

    const [previewUrl, setPreviewUrl] = useState<string | null>(originalImage);
    const [score, setScore] = useState<number>(product.score || 0);
    const [hoverScore, setHoverScore] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [productIsDeleted, setProductIsDeleted] = useState<boolean>(false);

    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

    useModalScrollLock(showDeleteModal);

    const formRef = useRef<HTMLFormElement>(null);

    const { getRootProps, getInputProps, isDragActive } = useProductDropzone(setFile);

    useEffect(() => {
        if (!file) return;

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleRemoveImage = () => {
        setFile(null);
        setPreviewUrl(null);
    };

    const handleRestoreOriginal = () => {
        setFile(null);
        setPreviewUrl(originalImage);
    };

    const handleDeleteProduct = async () => {
        if (loading) return;

        setLoading(true);

        try {
            setProductIsDeleted(true);
            const { error } = await deleteProduct(product.id);

            if (error) {
                throw new Error("No se pudo eliminar el producto.");
            }

            toast.success("El producto ha sido eliminado correctamente. Redirigiendo...", {
                autoClose: 3000
            });

            setTimeout(() => {
                window.location.href = "/admin/dashboard/products";
            }, 1000);
        } catch (error) {
            toast.error((error as unknown as Error).message, {
                autoClose: 3000
            });
            setProductIsDeleted(false);
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (loading) return;

        setLoading(true);

        try {
            const formData = new FormData(event.currentTarget);

            const productToUpdate = {
                name: String(formData.get("name")),
                description: String(formData.get("description")),
                price: Number(formData.get("price")),
                stock: Number(formData.get("stock")),
                score: Number(formData.get("score")),
                image: String(formData.get("image"))
            };

            if (productToUpdate.score < 1) {
                throw new Error("No puedes poner un producto con 0 estrellas.");
            } else if (productToUpdate.score > 5) {
                throw new Error("La calificación máxima es de 5 estrellas.");
            } else if (!file && !productToUpdate.image) {
                throw new Error("No has proporcionado una imagen para el producto");
            }

            if (file) {
                const cloudinaryImageFormData = new FormData();
                cloudinaryImageFormData.append("file", file);
                cloudinaryImageFormData.append("id", product.id);

                const res = await fetch("/api/cloudinary/uploadProduct", {
                    method: "POST",
                    body: cloudinaryImageFormData
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Falla al subir la imagen.");
                }

                const imageUrl = data.url;

                if (!imageUrl) {
                    throw new Error("No se pudo obtener la URL de la imagen.");
                }

                productToUpdate.image = imageUrl;
            }

            const { error } = await updateProduct(product.id, productToUpdate);

            if (error) {
                throw new Error("No se pudo actualizar el producto.");
            }

            const pageTitle = document.querySelector("#page-title");
            if (pageTitle) pageTitle.textContent = `Editar Producto: ${productToUpdate.name}`;

            toast.success("Se ha actualizado el producto correctamente.", {
                autoClose: 3000
            });
        } catch (error) {
            toast.error((error as unknown as Error).message, {
                autoClose: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const isDragActiveClass = isDragActive
        ? "bg-indigo-500/10 border-indigo-500"
        : "bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700";

    return (
        <>
            <form onSubmit={handleSubmit} ref={formRef} className="flex flex-col gap-6 w-full">
                <section className="flex flex-col md:flex-row gap-8 w-full">
                    <aside className="w-full md:w-80 relative flex-shrink-0">
                        <div
                            {...getRootProps()}
                            className={`
                                absolute inset-0 
                                border-2 border-dashed rounded-xl p-6 min-h-[260px]
                                flex items-center justify-center text-center cursor-pointer
                                transition-all duration-300
                                ${isDragActiveClass}
                                ${previewUrl ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"}
                            `}
                        >
                            <input {...getInputProps()} />
                            <p className="text-gray-500 dark:text-gray-400">
                                Arrastra o haz clic para subir una nueva imagen para el producto
                            </p>
                        </div>

                        <div
                            className={`
                                absolute inset-0 flex flex-col items-center justify-center gap-4 p-4
                                transition-all duration-300
                                ${previewUrl ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
                            `}
                        >
                            {previewUrl && (
                                <>
                                    <div className="w-full aspect-[3/5] rounded-xl overflow-hidden shadow-lg border border-gray-300 dark:border-gray-700">
                                        <img src={previewUrl} className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex flex-col gap-2 w-full">
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-md"
                                        >
                                            Quitar imagen
                                        </button>

                                        {previewUrl !== originalImage && (
                                            <button
                                                type="button"
                                                onClick={handleRestoreOriginal}
                                                className="w-full py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-semibold shadow-md"
                                            >
                                                Restaurar imagen original
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="opacity-0 pointer-events-none min-h-[260px]"></div>
                    </aside>

                    <div className="flex-1 grid grid-cols-1 gap-3">
                        <input type="hidden" name="score" value={score} />

                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">Nombre del producto</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                defaultValue={product.name}
                                required
                                className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">Imagen (URL opcional)</label>
                            <input
                                id="image"
                                name="image"
                                type="url"
                                defaultValue={product.image || ""}
                                className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
                            <p className="text-xs text-gray-400">Si subes archivo, este reemplazará la URL.</p>
                        </div>

                        <div className="flex flex-col">
                            <label className="font-semibold">Descripción</label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                defaultValue={product.description}
                                required
                                className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="font-semibold">Precio (MXN)</label>
                            <input
                                id="price"
                                name="price"
                                type="number"
                                defaultValue={product.price}
                                min={0}
                                required
                                className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="font-semibold">Stock disponible</label>
                            <input
                                id="stock"
                                name="stock"
                                type="number"
                                defaultValue={product.stock}
                                min={0}
                                max={2500}
                                required
                                className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-600 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">Calificación</label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const active = star <= (hoverScore || score);
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoverScore(star)}
                                            onMouseLeave={() => setHoverScore(0)}
                                            onClick={() => setScore(star)}
                                            className={`text-3xl transition ${
                                                active ? "text-yellow-500" : "text-gray-400"
                                            }`}
                                        >
                                            ★
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="flex flex-col md:flex-row gap-4 mt-6">
                    <button
                        type="submit"
                        disabled={loading || productIsDeleted}
                        className={`flex items-center justify-center w-full font-semibold py-3 rounded-lg shadow-lg transition-all ${
                            loading || productIsDeleted
                                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                    >
                        {loading && <Loader />}
                        <span>{loading ? "Actualizando..." : "Guardar cambios"}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        disabled={loading || productIsDeleted}
                        className={`flex items-center justify-center w-full font-semibold py-3 rounded-lg shadow-lg transition-all ${
                            loading || productIsDeleted
                                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                    >
                        <span>Eliminar producto</span>
                    </button>
                </footer>
            </form>

            {showDeleteModal && (
                <ModalConfirmDeleteProduct
                    onConfirm={handleDeleteProduct}
                    onCancel={() => setShowDeleteModal(false)}
                    productName={product.name}
                    loading={loading}
                />
            )}
        </>
    );
}
