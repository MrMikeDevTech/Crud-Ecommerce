"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/hooks/useSession";

export default function SessionName({ className = "" }: { className?: string }) {
    const [isClient, setIsClient] = useState(false);
    const { getSession } = useSession();

    const profile = getSession();
    const { $full_name } = profile ?? {};

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient ? <span className={className}>{$full_name || "Nombre no disponible"}</span> : null;
}
