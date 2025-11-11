import { useEffect, useState } from "react";

export default function CartButtonNoti() {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        const randomCount = Math.floor(Math.random() * 15);
        setCount(randomCount === 0 ? null : randomCount);
    }, []);

    if (count === null) return null;

    return (
        <span
            draggable={false}
            className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full z-10"
        >
            {count}
        </span>
    );
}
