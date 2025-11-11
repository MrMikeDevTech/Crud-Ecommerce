import React, { useEffect, useState, useRef } from "react";
import { useProductDropzone } from "@/hooks/useProductDropzone";
import Loader from "@/components/Loader";
import { toast } from "react-toastify";
import { addProduct, updateProduct } from "@/services/supabase";

export default function ProductSubmitForm() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [score, setScore] = useState<number>(0);
    const [hoverScore, setHoverScore] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const formRef = useRef<HTMLFormElement>(null);

    const { getRootProps, getInputProps, isDragActive } = useProductDropzone(setFile);

    useEffect(() => {
        if (!file) return setPreviewUrl(null);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
            setPreviewUrl(null);
        };
    }, [file]);

    const handleRemoveImage = () => setFile(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (loading) return;

        setLoading(true);

        try {
            const formData = new FormData(event.currentTarget);

            const productToUpload = {
                name: String(formData.get("name")),
                description: String(formData.get("description")),
                price: Number(formData.get("price")),
                stock: Number(formData.get("stock")),
                score: Number(formData.get("score")),
                image: String(formData.get("image"))
            };

            if (productToUpload.score < 1) {
                throw new Error("No puedes poner un producto con 0 estrellas.");
            } else if (productToUpload.score > 5) {
                throw new Error("La calificación máxima es de 5 estrellas.");
            } else if (!file && !productToUpload.image) {
                throw new Error("No has proporcionado una imagen para el producto");
            }

            const { product, error } = await addProduct({
                name: productToUpload.name,
                description: productToUpload.description,
                price: productToUpload.price,
                stock: productToUpload.stock,
                score: productToUpload.score,
                image: null
            });

            if (error) {
                throw error;
            }

            if (!product) {
                throw new Error("No se ha podido crear el producto.");
            }

            if (!file && productToUpload.image) {
                const { error: updateError } = await updateProduct(product.id, {
                    image: productToUpload.image
                });
                if (updateError) {
                    throw updateError;
                }
            } else if (file) {
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

                const { error, updated } = await updateProduct(product.id, {
                    image: imageUrl
                });

                if (error) {
                    throw new Error(error);
                }

                if (!updated) {
                    throw new Error("No se pudo actualizar la URL de la imagen del producto.");
                }
            }

            formRef.current?.reset();
            setFile(null);
            setScore(0);
            setHoverScore(0);

            toast.success("Se ha creado el producto correctamente.", {
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
                            ${file ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"}
                        `}
                    >
                        <input {...getInputProps()} />
                        <p className="text-gray-500 dark:text-gray-400">
                            Arrastra o haz clic para subir una imagen del producto
                        </p>
                    </div>

                    <div
                        className={`
                            absolute inset-0 flex flex-col items-center justify-center gap-4 p-4
                            transition-all duration-300
                            ${file ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
                            overflow-hidden
                        `}
                    >
                        {file && (
                            <>
                                <div className="w-full rounded-xl overflow-hidden shadow-lg border border-gray-300 dark:border-gray-700">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full max-h-[220px] md:max-h-[320px] object-contain"
                                        />
                                    ) : null}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-md"
                                >
                                    Quitar imagen
                                </button>
                            </>
                        )}
                    </div>

                    <div className="opacity-0 pointer-events-none min-h-[260px]"></div>
                </aside>

                <div className="flex-1 grid grid-cols-1 gap-3">
                    <input type="hidden" name="score" value={score} />

                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="font-semibold">
                            Nombre del producto
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Nombre del producto"
                            required
                            className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-600 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="image" className="font-semibold">
                            Imagen (URL opcional)
                        </label>
                        <input
                            id="image"
                            name="image"
                            type="url"
                            placeholder="https://..."
                            className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-600 outline-none"
                        />
                        <p className="text-xs text-gray-400">Si subes un archivo, se usará ese en lugar de la URL.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="font-semibold">
                            Descripción
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            placeholder="Descripción del producto"
                            rows={4}
                            className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-600 outline-none"
                        ></textarea>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="price" className="font-semibold">
                            Precio (MXN)
                        </label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            placeholder="Precio del producto"
                            min={0}
                            required
                            className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-600 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="stock" className="font-semibold">
                            Stock disponible
                        </label>
                        <input
                            id="stock"
                            name="stock"
                            type="number"
                            placeholder="Cantidad en stock"
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
                                        aria-label={`Calificar con ${star} estrellas`}
                                    >
                                        ★
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <button
                type="submit"
                disabled={loading}
                className={`flex flex-row gap-4 items-center justify-center w-full font-semibold py-3 rounded-lg shadow-lg transition-all ${
                    loading
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
            >
                {loading && <Loader />}
                <span>{loading ? "Subiendo producto..." : "Crear producto"}</span>
            </button>
        </form>
    );
}
