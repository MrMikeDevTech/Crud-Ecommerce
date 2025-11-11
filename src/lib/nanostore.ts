import { atom } from "nanostores";
import type { UserSession } from "@/types/auth";

export const sessionId = atom<UserSession["id"] | null>(null);
export const sessionFullName = atom<UserSession["full_name"] | null>(null);
export const sessionEmail = atom<UserSession["email"] | null>(null);
export const sessionAvatarUrl = atom<UserSession["avatar_url"] | null>(null);
export const sessionAvatarLastModified = atom<UserSession["avatar_last_modified"] | null>(null);
export const sessionCart = atom<UserSession["cart"][] | null>(null);

export const setSession = (session: UserSession) => {
    sessionId.set(session.id);
    sessionFullName.set(session.full_name);
    sessionEmail.set(session.email);
    sessionAvatarUrl.set(session.avatar_url);
    sessionAvatarLastModified.set(session.avatar_last_modified);
    sessionCart.set([session.cart]);
};
