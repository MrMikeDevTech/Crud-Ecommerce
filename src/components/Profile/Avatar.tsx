"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
const defaultPhoto = "/images/default-photo.jpg";

const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-52 h-52",
    xxl: "w-64 h-64"
};

export default function Avatar({
    size = "md",
    className = ""
}: {
    size?: "sm" | "md" | "lg" | "xl" | "xxl";
    className?: string;
}) {
    const { getSession } = useSession();
    const [isClient, setIsClient] = useState(false);

    const profile = getSession();
    const { $avatar_url, $full_name } = profile ?? {};

    const sizeClass = sizeClasses[size] || sizeClasses.md;

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div
                className={`aspect-square flex items-center justify-center bg-gray-300 rounded-full dark:bg-gray-700 animate-pulse m-2 ${sizeClass} ${className}`}
            >
                <svg
                    className="w-3/4 h-3/4 text-gray-200 dark:text-gray-600"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                </svg>
            </div>
        );
    }

    return (
        <img
            src={$avatar_url || defaultPhoto}
            alt={`Avatar de ${$full_name || "usuario"}`}
            className={`aspect-square rounded-full object-cover ${sizeClass} ${className}`}
            draggable="false"
            loading="lazy"
            onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = defaultPhoto;
            }}
        />
    );
}
