"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    // Ask the server who is logged in (it reads the httpOnly cookie).
    useEffect(() => {
        let cancelled = false;
        try {
            localStorage.removeItem("campuskart-user"); // old demo login
        } catch {
            // ignore
        }
        api("/auth/me")
            .then((data) => {
                if (!cancelled) setUser(data.user);
            })
            .catch(() => {
                if (!cancelled) setUser(null);
            })
            .finally(() => {
                if (!cancelled) setReady(true);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const signIn = useCallback((nextUser) => {
        setUser(nextUser);
    }, []);

    const signOut = useCallback(async () => {
        setUser(null);
        try {
            await api("/auth/logout", { method: "POST" });
        } catch {
            // the cookie will simply expire on its own
        }
    }, []);

    const value = useMemo(
        () => ({ user, ready, signIn, signOut }),
        [user, ready, signIn, signOut]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}