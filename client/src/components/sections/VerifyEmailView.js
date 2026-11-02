"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthShell from "@/components/layout/AuthShell";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { api } from "@/lib/api";

const COOLDOWN = 60;

function IconCircle({ children }) {
    return (
        <span className="mb-5 grid h-14 w-14 place-items-center rounded-full border border-border bg-surface-2">
            {children}
        </span>
    );
}

export default function VerifyEmailView() {
    const params = useSearchParams();
    const token = params.get("token");
    const emailParam = params.get("email") ?? "";
    const fresh = params.get("fresh") === "1";

    const [phase, setPhase] = useState(token ? "verifying" : "waiting");
    const [email, setEmail] = useState(emailParam);
    const [seconds, setSeconds] = useState(fresh ? COOLDOWN : 0);
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const ranRef = useRef(false);

    // Arrived from the email link: confirm the token with the server (once).
    useEffect(() => {
        if (!token || ranRef.current) return;
        ranRef.current = true;
        api("/auth/verify-email", { method: "POST", body: { token } })
            .then(() => setPhase("success"))
            .catch((err) => {
                setError(err.code === "INVALID_TOKEN" ? "" : err.message);
                setPhase("expired");
            });
    }, [token]);

    useEffect(() => {
        if (seconds <= 0) return;
        const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [seconds]);

    async function resend(e) {
        e?.preventDefault();
        const address = email.trim();
        if (!/^\S+@\S+\.\S+$/.test(address)) {
            setError("Enter the email you signed up with.");
            return;
        }
        setSending(true);
        setError("");
        try {
            await api("/auth/resend-verification", {
                method: "POST",
                body: { email: address },
            });
            setSent(true);
            setSeconds(COOLDOWN);
            setPhase("waiting");
        } catch (err) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    }

    const emailField = !emailParam && (
        <div className="mt-5 text-left">
            <Input
                label="Your college email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
        </div>
    );

    if (phase === "verifying") {
        return (
            <AuthShell title="Verifying your email" subtitle="One moment...">
                <p className="text-muted" aria-live="polite">
                    Checking your link.
                </p>
            </AuthShell>
        );
    }

    if (phase === "success") {
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

    if (phase === "expired") {
        return (
            <AuthShell
                title="Link expired"
                subtitle="Verification links only work for 24 hours."
            >
                <Alert tone="error" title={error || "This link has expired or is invalid."}>
                    Request a new one and we will email it right away.
                </Alert>
                {emailField}
                <Button
                    size="lg"
                    className="mt-5 w-full"
                    loading={sending}
                    onClick={resend}
                >
                    Send a new link
                </Button>
            </AuthShell>
        );
    }

    // waiting for the student to click the link in their inbox
    return (
        <AuthShell
            title="Check your inbox"
            subtitle={
                emailParam
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

            {emailParam && (
                <p className="text-muted">
                    We sent a verification link to{" "}
                    <strong className="break-all text-foreground">{emailParam}</strong>.
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
            {error && (
                <Alert tone="error" className="mt-5">
                    {error}
                </Alert>
            )}

            {emailField}

            <Button
                size="lg"
                variant="secondary"
                className="mt-5 w-full"
                disabled={seconds > 0 || sending}
                loading={sending}
                onClick={resend}
            >
                {seconds > 0 ? `Resend in ${seconds}s` : "Resend email"}
            </Button>
        </AuthShell>
    );
}