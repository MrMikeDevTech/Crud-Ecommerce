import { initializeUserSession } from "@/services/supabase";
import { setSession } from "@/lib/nanostore";
import { useEffect } from "react";
import type { Session as S } from "@supabase/supabase-js";

export default function Session({ currentSession }: { currentSession: S | null }) {
    useEffect(() => {
        (async () => {
            if (!currentSession) return;
            const profile = await initializeUserSession({ currentSession });
            if (!profile) return;
            setSession(profile);
        })();
    }, []);

    return null;
}
