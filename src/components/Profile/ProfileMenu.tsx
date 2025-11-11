import { useState, useRef, useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { isProductAdmin } from "@/services/supabase";
import Avatar from "@/components/Profile/Avatar";
import Home from "@/components/Icons/Home";

export default function ProfileMenu() {
    const [open, setOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const { getSession } = useSession();
    const { $full_name, $email, $avatar_url } = getSession();

    const menuRef = useRef<HTMLDivElement | null>(null);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if ($email) {
            const checkAdmin = async () => {
                try {
                    const result = await isProductAdmin($email);
                    setIsAdmin(result);
                } catch (error) {
                    console.error("Error checking admin status:", error);
                    setIsAdmin(false);
                }
            };
            checkAdmin();
        } else {
            setIsAdmin(false);
        }
    }, [$email]);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    if (!$full_name) return <SkeletonProfileMenu />;

    const initials = $full_name
        .split(" ")
        .map((n) => n[0])
        .join("");

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = window.setTimeout(() => {
            setOpen(false);
        }, 200);
    };

    const handleLogout = () => {
        window.location.href = "/api/auth/logout";
    };

    const opencls = open
        ? "opacity-100 translate-y-0 pointer-events-auto"
        : "opacity-0 -translate-y-2 pointer-events-none";

    return (
        <div className="relative ml-2" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} ref={menuRef}>
            <button
                className="flex items-center justify-center rounded-full bg-gray-400 dark:bg-gray-700 shadow-lg cursor-pointer select-none ring-2 ring-transparent hover:ring-indigo-500 transition-all duration-150"
                aria-haspopup="true"
                aria-expanded={open}
                type="button"
            >
                {$avatar_url ? (
                    <Avatar size="sm" />
                ) : (
                    <span
                        className="flex items-center justify-center w-12 h-12 text-white dark:text-gray-100 font-bold text-sm"
                        draggable={false}
                    >
                        {initials}
                    </span>
                )}
            </button>

            <div
                className={`absolute -right-3 mt-1.5 w-44 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 transition-all duration-200 ${opencls}`}
            >
                <div className="p-2">
                    <div className="block px-3 py-1 text-sm text-gray-900 dark:text-white truncate font-semibold border-b dark:border-gray-700 mb-1">
                        <span title={$full_name}>{$full_name}</span>
                    </div>

                    <ul className="py-1">
                        <li>
                            <a
                                href="/"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                            >
                                <Home />
                                Inicio
                            </a>
                        </li>

                        {isAdmin && (
                            <li>
                                <a
                                    href="/admin/dashboard"
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                                >
                                    <DashboardIcon />
                                    Panel Admin
                                </a>
                            </li>
                        )}

                        <li>
                            <a
                                href="/profile"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                            >
                                <ProfileIcon />
                                Mi Perfil
                            </a>
                        </li>

                        <li>
                            <button
                                className="flex items-center gap-2 w-full text-left px-3 py-2 mt-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"
                                onClick={handleLogout}
                            >
                                <LogoutIcon />
                                Cerrar sesión
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

function SkeletonProfileMenu() {
    return (
        <div className="ml-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse">
                <svg
                    className="w-6 h-6 text-gray-400 dark:text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4a4 4 0 100 8 4 4 0 000-8zm0 10c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"
                    />
                </svg>
            </div>
        </div>
    );
}

function ProfileIcon() {
    return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
        </svg>
    );
}

function DashboardIcon() {
    return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z" fill="currentColor" />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path
                d="M16 13v-2H7V8l-5 4 5 4v-3h9zm3-10H5c-1.1 0-2 .9-2 2v6h2V5h14v14H5v-6H3v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
                fill="currentColor"
            />
        </svg>
    );
}
