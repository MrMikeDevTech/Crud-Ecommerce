import { useEffect, useState, useRef } from "react";

const images = [
    "/banners/apple-banner.webp",
    "/banners/crocs-banner.webp",
    "/banners/headsets-banner.webp",
    "/banners/perfume-banner.webp",
    "/banners/samsung-banner.webp"
];

export default function CarroucelGallery() {
    const [current, setCurrent] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startAutoPlay = () => {
        stopAutoPlay();
        intervalRef.current = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 8000);
    };

    const stopAutoPlay = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    useEffect(() => {
        startAutoPlay();
        return stopAutoPlay;
    }, []);

    const handleIndicatorClick = (index: number) => {
        setCurrent(index);
        startAutoPlay();
    };

    return (
        <div className="relative mx-auto w-[650px] md:w-3/4 h-[400px] md:h-[600px] overflow-hidden rounded-2xl shadow-lg">
            {images.map((src, index) => (
                <img
                    key={index}
                    src={src}
                    alt={`Banner publicitario ${index + 1}`}
                    draggable={false}
                    className={`absolute top-0 left-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
                        index === current ? "opacity-100" : "opacity-0"
                    }`}
                />
            ))}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => handleIndicatorClick(i)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            i === current ? "bg-white" : "bg-gray-400 opacity-70"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
