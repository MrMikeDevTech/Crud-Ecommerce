export default function Loading({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`animate-spin ${className}`}
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
        >
            <path d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 1 0-6 6v4a10 10 0 0 1 0-20z" />
        </svg>
    );
}
