import { useStore } from "@nanostores/react";
import {
    sessionId,
    sessionFullName,
    sessionEmail,
    sessionAvatarUrl,
    sessionAvatarLastModified,
    sessionCart,
    setSession
} from "@/lib/nanostore";

import type { UserSession } from "@/types/auth";

export const useSession = () => {
    const $id = useStore(sessionId);
    const $full_name = useStore(sessionFullName);
    const $email = useStore(sessionEmail);
    const $avatar_url = useStore(sessionAvatarUrl);
    const $avatar_last_modified = useStore(sessionAvatarLastModified);
    const $cart = useStore(sessionCart);

    const getSession = () => ({
        $id,
        $full_name,
        $email,
        $avatar_url,
        $avatar_last_modified,
        $cart
    });

    const initializeSession = (session: UserSession) => {
        setSession(session);
    };

    const updateFullName = (newFullName: string | null) => {
        sessionFullName.set(newFullName);
    };

    const updateEmail = (newEmail: string | null) => {
        sessionEmail.set(newEmail);
    };

    const updateAvatarUrl = (newAvatarUrl: string | null) => {
        sessionAvatarUrl.set(newAvatarUrl);
    };

    const updateAvatarLastModified = (newLastModified: Date | null) => {
        sessionAvatarLastModified.set(newLastModified);
    };

    const updateCart = (newCart: UserSession["cart"] | null) => {
        sessionCart.set(newCart);
    };

    return {
        $id,
        $full_name,
        $email,
        $avatar_url,
        $avatar_last_modified,
        $cart,
        getSession,
        initializeSession,
        updateFullName,
        updateEmail,
        updateAvatarUrl,
        updateAvatarLastModified,
        updateCart
    };
};
