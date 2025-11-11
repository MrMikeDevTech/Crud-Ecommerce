// src/types/auth.d.ts
import { Cart } from "./products";

export type UserSession = {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    avatar_last_modified: Date | null;
    cart: Cart[];
};

export type UserMetaData = {
    avatar_url?: string;
    custom_claims?: {
        hd: string;
    };
    email: string;
    email_verified: boolean;
    full_name?: string;
    iss: string;
    name: string;
    phone_verified: boolean;
    picture: string;
    provider_id: string;
    sub: string;
};
