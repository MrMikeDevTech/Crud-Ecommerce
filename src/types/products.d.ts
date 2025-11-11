export type SortBy = "none" | "price-asc" | "price-desc" | "name" | "created_at";

export type FilterOptions = {
    minPrice?: number;
    maxPrice?: number;
    sortBy?: SortBy;
};

export type Product = {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    stock: number;
    score?: number;
    created_at?: string;
};

export type Cart = {
    items: Product[];
    total: number;
};
