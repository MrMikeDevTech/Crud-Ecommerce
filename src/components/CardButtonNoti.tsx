import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";

export default function CartButtonNoti() {
    const [count, setCount] = useState<number>(0);

    const { getSession } = useSession();
    const profile = getSession();
    const { $cart } = profile ?? {};

    useEffect(() => {
        const items = $cart?.[0]?.[0]?.items ?? [];
        setCount(items.length);
    }, [$cart]);

    if (count === null) return null;

    return (
        count > 0 && (
            <span
                draggable={false}
                className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full z-10"
            >
                {count}
            </span>
        )
    );
}
