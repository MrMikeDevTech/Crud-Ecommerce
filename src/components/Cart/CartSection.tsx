import { useState, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { clearCart, updateCart } from "@/services/supabase";
import type { Cart } from "@/types";
import { toast } from "react-toastify";

export default function CartSection() {
    const [items, setItems] = useState<Cart["items"]>([]);
    const [userId, setUserId] = useState<string>("");
    const { getSession } = useSession();
    const profile = getSession();
    const { $id, $cart } = profile ?? {};

    useEffect(() => {
        const items = $cart?.[0]?.[0]?.items ?? [];
        console.log("Cart items loaded:", items);
        setItems(items);
    }, [$cart]);

    useEffect(() => {
        setUserId($id!);
    }, [$id]);

    const changeQuantity = (productId: string, delta: number) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.product.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
            )
        );
    };

    const saveCart = async () => {
        try {
            const { error } = await updateCart(userId, items);
            if (error) throw error;
            toast.success("Carrito guardado correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar el carrito");
        }
    };

    const handleClearCart = async () => {
        try {
            setItems([]);
            const { error } = await clearCart(userId);
            if (error) throw error;
            toast.success("Carrito limpiado correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al limpiar el carrito");
        }
    };

    const goToCheckout = () => {
        toast.success("Compra del carrito realizada con éxito, redirigiendo a la página principal...");
        setTimeout(() => {
            window.location.href = "/";
        }, 2000);
    };

    const total = items.reduce((total, item) => total + item.product.price * item.quantity, 0);

    if (!items.length) {
        return (
            <div className="max-w-3xl mx-auto py-20 text-center text-gray-500 dark:text-gray-400">
                <p className="text-lg">Tu carrito está vacío 🛒</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-10 space-y-6">
            <h2 className="text-2xl font-semibold mb-6 dark:text-white">Tu Carrito</h2>

            <div className="space-y-4">
                {items.map((item) => (
                    <div
                        key={`${item.product.id}-${Math.random()}`}
                        className="flex items-center gap-4 bg-white dark:bg-gray-800/60 rounded-xl p-4 border border-gray-200 dark:border-gray-700/50 shadow-sm backdrop-blur-sm"
                    >
                        <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                        />

                        <div className="flex-1">
                            <h3 className="font-medium dark:text-white">{item.product.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">${item.product.price}</p>

                            <div className="flex items-center gap-3 mt-3">
                                <button
                                    onClick={() => changeQuantity(item.product.id, -1)}
                                    className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                >
                                    -
                                </button>

                                <span className="text-gray-700 dark:text-gray-200">{item.quantity}</span>

                                <button
                                    onClick={() => changeQuantity(item.product.id, 1)}
                                    className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="text-lg font-semibold dark:text-gray-200">
                            ${(item.product.price * item.quantity).toLocaleString("en-US")}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between text-xl font-semibold pt-6 border-t border-gray-300 dark:border-gray-700">
                <span className="dark:text-gray-200">Total:</span>
                <span className="dark:text-gray-100">${total.toLocaleString("en-US")}</span>
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={saveCart}
                    className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
                >
                    Guardar cambios
                </button>

                <button
                    onClick={goToCheckout}
                    className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-lg font-semibold transition"
                >
                    Comprar carrito 🛒
                </button>

                <button
                    onClick={handleClearCart}
                    className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
                >
                    Limpiar carrito
                </button>
            </div>
        </div>
    );
}
