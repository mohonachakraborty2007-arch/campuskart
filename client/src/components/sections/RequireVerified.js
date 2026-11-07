"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export default function RequireVerified({ children }) {
    const { user, ready } = useAuth();
    const pathname = usePathname();

    if (!ready) {
        return (
            <p className="py-16 text-center text-muted" aria-live="polite">
                Loading...
            </p>
        );
    }

    if (!user) {
        return (
            <EmptyState
                title="Log in to continue"
                action={
                    <Button href={`/login?next=${encodeURIComponent(pathname)}`}>
                        Log in
                    </Button>
                }
            >
                You need a CampusKart account to do this.
            </EmptyState>
        );
    }

    if (!user.emailVerified) {
        return (
            <EmptyState
                title="Verify your college email first"
                action={
                    <Button
                        href={`/verify-email?email=${encodeURIComponent(user.email)}`}
                    >
                        Verify email
                    </Button>
                }
            >
                Only verified students can post items.
            </EmptyState>
        );
    }

    return children;
}