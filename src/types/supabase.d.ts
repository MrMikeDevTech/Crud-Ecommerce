export type RawSession = {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    avatar_last_modified: Date | null;
    cart: string;
    created_at: string;
    updated_at: string;
};

export type RawCart = {
    id: string;
    created_at: string;
    updated_at: string;
    items?: RawCartItem[];
};

export type RawCartItem = {
    id: string;
    cart_id: string;
    product_id: string;
    quantity: number;
    added_at: string;
};

export type RawProduct = {
    id: string;
    name: string;
    price: number;
    image: string | null;
    description: string;
    stock: number;
    score: number | null;
    created_at: string;
    updated_at: string;
};

export type RawTestimonial = {
    id: string;
    quote: string;
    author_id: string;
    stars: number;
    created_at: string;
};

export type ProductAdmin = {
    id: string;
    email: string;
    created_at: string;
};
