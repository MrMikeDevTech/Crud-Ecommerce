export default function Loader() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 animate-spin text-white"
            width="50"
            height="50"
            viewBox="0 0 50 50"
        >
            <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="31.415, 31.415"
                transform="rotate(0 25 25)"
            >
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 25 25"
                    to="360 25 25"
                    dur="1s"
                    repeatCount="indefinite"
                />
            </circle>
        </svg>
    );
}
