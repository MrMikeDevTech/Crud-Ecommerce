import { useEffect, useState, useRef } from "react";

export function useNearScreen<T extends HTMLElement>({ rootMargin = "200px" }: { rootMargin?: string } = {}) {
    const ref = useRef<T | null>(null);
    const [isNearScreen, setIsNearScreen] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsNearScreen(true);
                else setIsNearScreen(false);
            },
            { rootMargin }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [rootMargin]);

    return { isNearScreen, ref };
}
