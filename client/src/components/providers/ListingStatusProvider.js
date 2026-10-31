"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { soldListings } from "@/lib/sampleListings";

const KEY = "campuskart-listing-status";
const StatusContext = createContext(null);

// DEMO ONLY. Replaced by the database in the backend phase.
export function ListingStatusProvider({ children }) {
    const [overrides, setOverrides] = useState({});

    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) setOverrides(JSON.parse(raw));
        } catch {
            // storage can be blocked; the app still works
        }
    }, []);

    const setStatus = useCallback((id, status) => {
        setOverrides((current) => {
            const next = { ...current, [id]: status };
            try {
                localStorage.setItem(KEY, JSON.stringify(next));
            } catch {
                // ignore
            }
            return next;
        });
    }, []);

    const value = useMemo(
        () => ({
            setStatus,
            statusOf: (id) =>
                overrides[id] ??
                (soldListings.some((l) => l.id === id) ? "sold" : "active"),
        }),
        [overrides, setStatus]
    );

    return (
        <StatusContext.Provider value={value}>{children}</StatusContext.Provider>
    );
}

export function useListingStatus() {
    const context = useContext(StatusContext);
    if (!context) {
        throw new Error("useListingStatus must be used inside ListingStatusProvider");
    }
    return context;
}