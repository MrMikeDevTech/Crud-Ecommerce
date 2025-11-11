"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/hooks/useSession";

export default function SessionEmail({ className = "" }: { className?: string }) {
    const [isClient, setIsClient] = useState(false);
    const { getSession } = useSession();

    const profile = getSession();
    const { $email } = profile ?? {};

    useEffect(() => setIsClient(true), []);

    return isClient ? <span className={className}>{$email || "Email no disponible"}</span> : null;
}
