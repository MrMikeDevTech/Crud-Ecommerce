import React, { useId, useState } from "react";

function luhnCheck(cardNumber: string) {
    const digits = cardNumber.replace(/\D/g, "");
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits.charAt(i), 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
}

function maskCard(number: string) {
    const digits = number.replace(/\D/g, "");
    const last4 = digits.slice(-4);
    const masked = last4.padStart(digits.length, "•");
    // agrupar en bloques de 4 para visual
    return masked.replace(/(.{4})/g, "$1 ").trim();
}

function fakeTokenize(t: { number: string; exp: string; cvv: string }) {
    return `tok_demo_${btoa(`${t.number}|${t.exp}|${t.cvv}`).slice(0, 16)}`;
}

function saveMockReceipt(receipt: any) {
    try {
        const key = "mock_payments";
        const prev = JSON.parse(localStorage.getItem(key) || "[]");
        prev.unshift(receipt);
        localStorage.setItem(key, JSON.stringify(prev.slice(0, 50)));
    } catch {
        // ignore
    }
}

export default function MockCheckout({
    amount = 49.99,
    currency = "USD",
    description = "Compra demo"
}: {
    amount?: number;
    currency?: string;
    description?: string;
}) {
    const id = useId();
    const [name, setName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [exp, setExp] = useState("");
    const [cvv, setCvv] = useState("");
    const [method, setMethod] = useState<"card" | "paypal">("card");
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<any | null>(null);

    const resetForm = () => {
        setName("");
        setCardNumber("");
        setExp("");
        setCvv("");
        setError(null);
    };

    const validate = () => {
        setError(null);
        if (!name.trim()) return "Ingrese el nombre del titular";
        if (method === "card") {
            const digits = cardNumber.replace(/\D/g, "");
            if (digits.length < 12) return "Número de tarjeta inválido (demasiado corto)";
            if (!luhnCheck(digits)) return "Número de tarjeta inválido (Luhn fail)";
            if (!/^\d{2}\/\d{2}$/.test(exp)) return "Fecha en formato MM/AA";
            const [m, y] = exp.split("/").map((s) => parseInt(s, 10));
            if (!(m >= 1 && m <= 12)) return "Mes inválido";
            const now = new Date();
            const fullYear = 2000 + y;
            const expiry = new Date(fullYear, m - 1, 1);
            if (expiry < new Date(now.getFullYear(), now.getMonth(), 1)) return "Tarjeta expirada";
            if (!/^\d{3,4}$/.test(cvv)) return "CVV inválido";
        }
        return null;
    };

    const handlePay = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (processing) return;
        const v = validate();
        if (v) {
            setError(v);
            return;
        }
        setError(null);
        setProcessing(true);

        // simulamos latencia / tokenización
        await new Promise((r) => setTimeout(r, 700 + Math.random() * 900));

        let token = null;
        let maskedNumber = "";
        if (method === "card") {
            token = fakeTokenize({ number: cardNumber, exp, cvv });
            maskedNumber = maskCard(cardNumber);
        } else {
            token = `pp_demo_${Math.random().toString(36).slice(2, 9)}`;
        }

        // simulamos procesamiento (puede "fallar" aleatoriamente para demo)
        const fail = Math.random() < 0.08; // 8% fallo aleatorio
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 1000));

        if (fail) {
            setProcessing(false);
            setError("El pago ha sido rechazado (simulado). Intente otra vez.");
            return;
        }

        const receipt = {
            id: `rcpt_${Date.now().toString(36)}`,
            amount,
            currency,
            description,
            method,
            token,
            name,
            last4: cardNumber.replace(/\D/g, "").slice(-4),
            masked: maskedNumber || null,
            date: new Date().toISOString()
        };

        saveMockReceipt(receipt);

        setProcessing(false);
        setSuccess(receipt);
        // reset después de guardar el receipt (ya guardó masked)
        resetForm();
    };

    if (success) {
        return (
            <div className="max-w-xl mx-auto bg-white dark:bg-neutral-900 p-6 rounded-xl shadow">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Pago completado (demo)</h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">¡Pago simulado con éxito!</p>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                        <dt className="text-gray-500 dark:text-gray-400">Recibo</dt>
                        <dd className="font-mono">{success.id}</dd>
                    </div>
                    <div>
                        <dt className="text-gray-500 dark:text-gray-400">Fecha</dt>
                        <dd>{new Date(success.date).toLocaleString()}</dd>
                    </div>
                    <div>
                        <dt className="text-gray-500 dark:text-gray-400">Importe</dt>
                        <dd>
                            {success.currency} {success.amount.toFixed(2)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-gray-500 dark:text-gray-400">Método</dt>
                        <dd className="capitalize">{success.method}</dd>
                    </div>
                    {success.method === "card" && (
                        <>
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Titular</dt>
                                <dd className="text-gray-800 dark:text-gray-200">{success.name}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Tarjeta</dt>
                                <dd className="text-gray-800 dark:text-gray-200">
                                    {" "}
                                    {success.masked ?? `•••• •••• •••• ${success.last4}`}
                                </dd>
                            </div>
                        </>
                    )}
                </dl>

                <div className="mt-6 flex gap-3">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md"
                        onClick={() => {
                            setSuccess(null);
                        }}
                    >
                        Hacer otro pago (demo)
                    </button>
                    <a
                        className="px-4 py-2 border rounded-md text-gray-700 dark:text-gray-200"
                        href="#"
                        onClick={(ev) => {
                            ev.preventDefault();
                            // ejemplo: ir a página de "ordenes"
                        }}
                    >
                        Ver recibos
                    </a>
                </div>
            </div>
        );
    }

    return (
        <form className="max-w-xl mx-auto bg-white dark:bg-neutral-900 p-6 rounded-xl shadow" onSubmit={handlePay}>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Checkout demo</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Demo visual — no se procesan pagos reales.</p>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Método</label>
                <div className="flex gap-3">
                    <label
                        className={`px-3 py-2 border rounded cursor-pointer ${
                            method === "card" ? "border-blue-500" : "border-neutral-300 dark:border-neutral-700"
                        }`}
                    >
                        <input
                            type="radio"
                            name={`method-${id}`}
                            className="hidden"
                            checked={method === "card"}
                            onChange={() => setMethod("card")}
                        />
                        <span className="text-gray-800 dark:text-gray-200">Tarjeta</span>
                    </label>
                    <label
                        className={`px-3 py-2 border rounded cursor-pointer ${
                            method === "paypal" ? "border-blue-500" : "border-neutral-300 dark:border-neutral-700"
                        }`}
                    >
                        <input
                            type="radio"
                            name={`method-${id}`}
                            className="hidden"
                            checked={method === "paypal"}
                            onChange={() => setMethod("paypal")}
                        />
                        <span className="text-gray-800 dark:text-gray-200">PayPal (demo)</span>
                    </label>
                </div>
            </div>

            {method === "card" ? (
                <>
                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">Titular</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border rounded mb-3 bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-100 border-neutral-300 dark:border-neutral-700"
                        placeholder="Nombre en la tarjeta"
                    />

                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                        Número de tarjeta
                    </label>
                    <input
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 border rounded mb-3 tracking-widest bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-100 border-neutral-300 dark:border-neutral-700"
                        placeholder="1234 1234 1234 1234"
                    />

                    <div className="flex gap-3 mb-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                                Exp (MM/AA)
                            </label>
                            <input
                                value={exp}
                                onChange={(e) => setExp(e.target.value)}
                                className="w-full px-3 py-2 border rounded bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-100 border-neutral-300 dark:border-neutral-700"
                                placeholder="08/26"
                            />
                        </div>
                        <div style={{ width: 110 }}>
                            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">CVV</label>
                            <input
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                                inputMode="numeric"
                                className="w-full px-3 py-2 border rounded bg-white dark:bg-neutral-800 text-gray-800 dark:text-gray-100 border-neutral-300 dark:border-neutral-700"
                                placeholder="123"
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className="mb-4 text-gray-800 dark:text-gray-200">
                    <p className="text-sm">Al pulsar continuar se abrirá una ventana falsa de PayPal (simulada).</p>
                </div>
            )}

            {error && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>}

            <div className="flex items-center justify-between mt-4">
                <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {currency} {amount.toFixed(2)}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-60"
                    >
                        {processing ? "Procesando..." : "Pagar ahora"}
                    </button>
                </div>
            </div>

            <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                <em>Demo: nunca ingreses números de tarjeta reales aquí. Solo para demostración.</em>
            </div>
        </form>
    );
}
