"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const KEY = "campuskart-saved";
const SavedContext = createContext(null);

export function SavedProvider({ children }) {
    const [ids, setIds] = useState([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) setIds(JSON.parse(raw));
        } catch {
            // storage can be blocked; the app still works without it
        }
        setReady(true);
    }, []);

    const toggle = useCallback((id) => {
        setIds((current) => {
            const next = current.includes(id)
                ? current.filter((x) => x !== id)
                : [...current, id];
            try {
                localStorage.setItem(KEY, JSON.stringify(next));
            } catch {
                // ignore
            }
            return next;
        });
    }, []);

    const value = useMemo(
        () => ({ ids, ready, isSaved: (id) => ids.includes(id), toggle }),
        [ids, ready, toggle]
    );

    return (
        <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
    );
}

export function useSaved() {
    const context = useContext(SavedContext);
    if (!context) {
        throw new Error("useSaved must be used inside SavedProvider");
    }
    return context;
}