import { useEffect } from "react";

export function useModalScrollLock(enabled: boolean) {
    useEffect(() => {
        if (!enabled) return;

        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [enabled]);
}
