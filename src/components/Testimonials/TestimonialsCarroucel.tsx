import { useState } from "react";
import type { TestimonialWithAuthor } from "@/types/testimonials";

export default function Testimonials({ testimonials }: { testimonials: TestimonialWithAuthor[] | null }) {
    const DURATION = 28;
    const [showAll, setShowAll] = useState(false);

    if (!testimonials || testimonials.length === 0) return null;

    if (testimonials.length >= 5) {
        return (
            <section className="my-2 w-[90%] pt-10 mx-auto">
                <div className="w-full overflow-hidden mb-10 [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]">
                    <div
                        className="relative"
                        style={{
                            animation: `infiniteScroll ${DURATION}s linear infinite`,
                            transformStyle: "preserve-3d",
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden"
                        }}
                    >
                        <div className="flex items-center">
                            <ul className="flex items-center">
                                {testimonials.map((testimonial, idx) => (
                                    <Testimonial key={`a-${testimonial.id}-${idx}`} testimonial={testimonial} />
                                ))}
                            </ul>

                            <ul className="flex items-center">
                                {testimonials.map((testimonial, idx) => (
                                    <Testimonial key={`b-${testimonial.id}-${idx}`} testimonial={testimonial} />
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const visible = showAll ? testimonials : testimonials.slice(0, 3);

    return (
        <section className="my-6 w-[90%] mx-auto flex flex-col gap-4">
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visible.map((testimonial) => (
                    <Testimonial key={testimonial.id} testimonial={testimonial} />
                ))}
            </ul>

            {testimonials.length > 3 && (
                <button
                    onClick={() => setShowAll((prev) => !prev)}
                    className="self-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                    {showAll ? "Ver menos" : "Ver más"}
                </button>
            )}
        </section>
    );
}

function Testimonial({ testimonial }: { testimonial: TestimonialWithAuthor }) {
    const { id, author_id, author, quote, stars } = testimonial as unknown as {
        author: { full_name: string; avatar_url: string | null };
        author_id: string;
        id: string;
        quote: string;
        stars: number;
        created_at: string;
    };
    const { full_name, avatar_url } = author;

    return (
        <li
            className="inline-flex w-full min-h-36 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl shadow items-start gap-4"
            title={quote}
            key={id}
            aria-label={`Testimonio de ${author_id}-${full_name}`}
        >
            <img
                className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-neutral-300 dark:ring-neutral-700"
                src={avatar_url || "/default-avatar.png"}
                alt={`${full_name} avatar`}
            />
            <div className="flex flex-col text-left">
                <div className="flex items-center justify-between gap-1 mt-1">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">{full_name}</h3>
                    <div className="flex flex-row items-center gap-1">
                        <svg width="16" height="16" fill="currentColor" className="text-yellow-400" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.959a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.958c.3.922-.755 1.688-1.54 1.118l-3.371-2.448a1 1 0 00-1.175 0l-3.371 2.448c-.784.57-1.838-.196-1.539-1.118l1.287-3.958a1 1 0 00-.364-1.118L2.174 9.386c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.959z" />
                        </svg>
                        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                            {Number.isInteger(stars) ? `${stars}.0` : stars}
                        </span>
                    </div>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-2 line-clamp-3">{quote}</p>
            </div>
        </li>
    );
}
