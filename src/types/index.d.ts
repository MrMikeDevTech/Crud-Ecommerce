// src/types/index.d.ts
export { Cart, Categories, FilterOptions, Product, ScoredProduct, SortBy } from "./products";
export { UserSession, RawAuth, UserMetaData } from "./auth";
export { Testimonial } from "./testimonials";

export interface FilterProps {
    sortBy?: "relevance" | "price-asc" | "price-desc" | "newest";
    priceRange?: { min: number; max: number };
    rating: 1 | 2 | 3 | 4 | 5 | "all";
    minStock?: number;
}
