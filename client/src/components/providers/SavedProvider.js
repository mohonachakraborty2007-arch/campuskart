"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";

const SavedContext = createContext(null);

export function SavedProvider({ children }) {
    const { user, ready: authReady } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const userId = user?.id ?? null;

    // ids are tagged with the user they belong to, so a logout/login never mixes them
    const [state, setState] = useState({ userKey: null, ids: [] });
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authReady || !userId) return;
        let cancelled = false;
        api("/wishlist")
            .then((data) => {
                if (!cancelled) setState({ userKey: userId, ids: data.ids });
            })
            .catch(() => {
                if (!cancelled) setState({ userKey: userId, ids: [] });
            });
        return () => {
            cancelled = true;
        };
    }, [authReady, userId]);

    useEffect(() => {
        if (!error) return;
        const timer = setTimeout(() => setError(""), 4000);
        return () => clearTimeout(timer);
    }, [error]);

    const ids = userId && state.userKey === userId ? state.ids : [];
    const ready = authReady && (!userId || state.userKey === userId);

    const toggle = useCallback(
        async (id) => {
            if (!userId) {
                router.push(`/login?next=${encodeURIComponent(pathname)}`);
                return;
            }
            const wasSaved = ids.includes(id);

            // 1) update the heart straight away
            setState((s) => ({
                ...s,
                ids: wasSaved ? s.ids.filter((x) => x !== id) : [...s.ids, id],
            }));

            // 2) tell the server; 3) undo the change if it fails
            try {
                await api(`/wishlist/${id}`, { method: wasSaved ? "DELETE" : "POST" });
            } catch (err) {
                setState((s) => ({
                    ...s,
                    ids: wasSaved
                        ? [...s.ids.filter((x) => x !== id), id]
                        : s.ids.filter((x) => x !== id),
                }));
                setError(err.message || "Could not update your saved items.");
            }
        },
        [userId, ids, router, pathname]
    );

    const value = useMemo(
        () => ({ ids, ready, isSaved: (id) => ids.includes(id), toggle }),
        [ids, ready, toggle]
    );

    return (
        <SavedContext.Provider value={value}>
            {children}
            {error && (
                <div
                    role="alert"
                    className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-md rounded-card border border-border bg-surface px-5 py-3 text-sm shadow-lg md:bottom-6"
                >
                    {error}
                </div>
            )}
        </SavedContext.Provider>
    );
}

export function useSaved() {
    const context = useContext(SavedContext);
    if (!context) {
        throw new Error("useSaved must be used inside SavedProvider");
    }
    return context;
}