import { plugin as FlowbitePlugin, content as FlowbiteContent } from "flowbite-react/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./src/**/*.{astro,tsx}",
        FlowbiteContent()
    ],
    theme: {
        extend: {
            keyframes: {
                scroll: {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(calc(-250px * 7))" }
                }
            },
            animation: {
                scroll: "scroll 40s linear infinite"
            }
        }
    },
    plugins: [
        FlowbitePlugin()
    ]
};
