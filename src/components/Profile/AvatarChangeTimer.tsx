"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { checkAvatarUpdateCooldown } from "@/helpers/checkAvatarUpdateCooldown";
import Warn from "@/components/Icons/Warn";
import Check from "@/components/Icons/Check";

export default function AvatarChangeTimer({ className = "" }: { className?: string }) {
    const [isClient, setIsClient] = useState(false);
    const { getSession } = useSession();
    const profile = getSession();
    const { $avatar_last_modified } = profile ?? {};

    const [canChange, setCanChange] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    useEffect(() => {
        if (!$avatar_last_modified) return;

        const updateTimer = () => {
            const { canUpdate, remaining } = checkAvatarUpdateCooldown(new Date($avatar_last_modified), 8);

            setCanChange(canUpdate);
            if (remaining) {
                const { hours, minutes } = remaining;
                setTimeLeft(`${hours}h ${minutes}m`);
            } else {
                setTimeLeft(null);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000 * 30);

        return () => clearInterval(interval);
    }, [$avatar_last_modified]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const showCheck = !$avatar_last_modified || canChange;
    const textColor = showCheck ? "text-green-400" : "text-gray-400 dark:text-gray-500";
    const iconColor = showCheck ? "text-green-400" : "text-yellow-300";
    const message = showCheck ? "Puedes cambiar tu avatar." : `Puedes cambiar tu avatar en ${timeLeft}.`;

    return (
        isClient && (
            <small className={`mt-2 text-xs flex items-center justify-center gap-1 ${textColor} ${className}`}>
                <span className={iconColor}>{showCheck ? <Check /> : <Warn />}</span>
                <span>{message}</span>
            </small>
        )
    );
}
