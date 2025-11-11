import { toast } from "react-toastify";
import type { Product } from "@/types";
import { addToCart } from "@/services/supabase";
import { useSession } from "@/hooks/useSession";
import { useEffect, useState } from "react";

export default function BuyButtons({ product }: { product: Product }) {
    const [userId, setUserId] = useState<string>("");
    const { getSession } = useSession();
    const profile = getSession();
    const { $id } = profile ?? {};

    useEffect(() => {
        setUserId($id!);
    }, [$id]);

    const handleAddToCart = async () => {
        const { error } = await addToCart(userId, product, 1);
        if (error) {
            toast.error("Error al agregar al carrito");
            console.error(error);
        } else {
            toast.success("Producto agregado al carrito");
        }
    };

    const handleBuyNow = () => {
        toast.success("Compra realizada con éxito, redirigiendo a la página principal...");
        setTimeout(() => {
            window.location.href = "/";
        }, 2000);
    };

    return (
        <>
            <button
                onClick={handleBuyNow}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-md"
            >
                Comprar ahora
            </button>
            <button
                onClick={handleAddToCart}
                className="w-full py-3 bg-indigo-100 hover:bg-indigo-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg transition-colors duration-200 border border-indigo-600 dark:border-indigo-500"
            >
                Agregar al carrito
            </button>
        </>
    );
}
