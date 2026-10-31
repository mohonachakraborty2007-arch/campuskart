"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const KEY = "campuskart-user";
const AuthContext = createContext(null);

// DEMO ONLY. Replaced by the real session cookie in the backend phase.
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) setUser(JSON.parse(raw));
        } catch {
            // storage can be blocked; the app still works as logged out
        }
        setReady(true);
    }, []);

    const signIn = useCallback((nextUser) => {
        setUser(nextUser);
        try {
            localStorage.setItem(KEY, JSON.stringify(nextUser));
        } catch {
            // ignore
        }
    }, []);

    const signOut = useCallback(() => {
        setUser(null);
        try {
            localStorage.removeItem(KEY);
        } catch {
            // ignore
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