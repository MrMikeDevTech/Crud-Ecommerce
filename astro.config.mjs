import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";

export default defineConfig({
    site: "https://ecommerce.mrmikedev.me",
    output: "server",
    adapter: vercel({}),
    integrations: [tailwind(), react()],
    session: {
        driver: "memory"
    },
    devToolbar: {
        enabled: false
    }
});
