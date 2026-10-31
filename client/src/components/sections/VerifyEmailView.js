"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/layout/AuthShell";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";

const COOLDOWN = 30;

function IconCircle({ children }) {
    return (
        <span className="mb-5 grid h-14 w-14 place-items-center rounded-full border border-border bg-surface-2">
            {children}
        </span>
    );
}

export default function VerifyEmailView() {
    const router = useRouter();
    const params = useSearchParams();
    const status = params.get("status");
    const email = params.get("email") ?? "";

    const [seconds, setSeconds] = useState(COOLDOWN);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        if (seconds <= 0) return;
        const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [seconds]);

    function resend() {
        setSent(true);
        setSeconds(COOLDOWN);
    }

    const devLinks = process.env.NODE_ENV !== "production" && (
        <p className="mt-6 text-center text-xs text-muted">
            Dev only:{" "}
            <Link
                href={`/verify-email?status=success`}
                className="underline-offset-4 hover:underline"
            >
                see verified
            </Link>{" "}
            ·{" "}
            <Link
                href={`/verify-email?status=expired&email=${encodeURIComponent(email)}`}
                className="underline-offset-4 hover:underline"
            >
                see expired
            </Link>
        </p>
    );

    // verified
    if (status === "success") {
        return (
            <AuthShell
                title="Email verified"
                subtitle="Your account is active. You can now post items and contact sellers."
            >
                <IconCircle>
                    <svg
                        viewBox="0 0 24 24"
                        className="h-7 w-7 fill-none stroke-success"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path className="check-draw" d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                </IconCircle>
                <Button href="/login" size="lg" className="w-full">
                    Log in
                </Button>
            </AuthShell>
        );
    }

    // expired or invalid link
    if (status === "expired") {
        return (
            <AuthShell
                title="Link expired"
                subtitle="Verification links only work for 24 hours."
            >
                <Alert tone="error" title="This link has expired or is invalid.">
                    Request a new one and we will email it right away.
                </Alert>
                <Button
                    size="lg"
                    className="mt-5 w-full"
                    onClick={() =>
                        router.replace(
                            email
                                ? `/verify-email?email=${encodeURIComponent(email)}`
                                : "/verify-email"
                        )
                    }
                >
                    Send a new link
                </Button>
                {devLinks}
            </AuthShell>
        );
    }

    // waiting for the student to click the link
    return (
        <AuthShell
            title="Check your inbox"
            subtitle={
                email
                    ? undefined
                    : "We sent a verification link to your college email."
            }
            footer={
                <>
                    Wrong email?{" "}
                    <Link
                        href="/register"
                        className="text-accent underline-offset-4 hover:underline"
                    >
                        Start again
                    </Link>
                </>
            }
        >
            <IconCircle>
                <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7 fill-none stroke-accent"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <rect x="3" y="5" width="18" height="14" rx="3" />
                    <path d="M3.5 7.5l8.5 6 8.5-6" />
                </svg>
            </IconCircle>

            {email && (
                <p className="text-muted">
                    We sent a verification link to{" "}
                    <strong className="break-all text-foreground">{email}</strong>.
                </p>
            )}
            <p className="mt-3 text-muted">
                Click the link in that email to activate your account. Check your spam
                folder if you cannot find it.
            </p>

            {sent && (
                <Alert tone="success" className="mt-5">
                    A new link is on its way.
                </Alert>
            )}

            <Button
                size="lg"
                variant="secondary"
                className="mt-5 w-full"
                disabled={seconds > 0}
                onClick={resend}
            >
                {seconds > 0 ? `Resend in ${seconds}s` : "Resend email"}
            </Button>
            {devLinks}
        </AuthShell>
    );
}