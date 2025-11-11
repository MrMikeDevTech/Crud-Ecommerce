import type { RawTestimonial } from "./supabase";

export type Testimonial = {
    id: string;
    quote: string;
    author_id: string;
    stars: number;
    created_at: string;
    updated_at: string;
};

export type AuthorType = { full_name: string; avatar_url: string; email: string };
export type TestimonialWithAuthor = RawTestimonial & {
    author: AuthorType;
};
