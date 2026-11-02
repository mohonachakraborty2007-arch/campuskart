"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginForm() {
    const router = useRouter();
    const { signIn } = useAuth();
    const params = useSearchParams();
    const next = params.get("next");
    const destination = next && next.startsWith("/") ? next : "/listings";

    const [values, setValues] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(false);

    function set(key, value) {
        setValues((v) => ({ ...v, [key]: value }));
        setErrors((e) => {
            if (!e[key]) return e;
            const { [key]: _removed, ...rest } = e;
            return rest;
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        setNotice(null);

        const found = {};
        if (!/^\S+@\S+\.\S+$/.test(values.email.trim()))
            found.email = "Enter your email address.";
        if (!values.password) found.password = "Enter your password.";
        setErrors(found);

        const firstKey = ["email", "password"].find((k) => found[k]);
        if (firstKey) {
            form.elements.namedItem(firstKey)?.focus();
            return;
        }

        setLoading(true);
        try {
            const data = await api("/auth/login", {
                method: "POST",
                body: { email: values.email.trim(), password: values.password },
            });
            signIn(data.user);
            router.push(destination);
        } catch (err) {
            if (err.code === "EMAIL_NOT_VERIFIED") {
                setNotice({ tone: "info", code: "unverified" });
            } else if (err.code === "RATE_LIMITED") {
                setNotice({
                    tone: "error",
                    title: "Too many attempts",
                    body: "Please wait 15 minutes before trying again.",
                });
            } else if (err.code === "INVALID_CREDENTIALS") {
                // Same message whether the email exists or not, on purpose.
                setNotice({
                    tone: "error",
                    title: "Incorrect email or password.",
                    body: "Check your details and try again.",
                });
            } else {
                setNotice({
                    tone: "error",
                    title: "Could not log in.",
                    body: err.message,
                });
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {notice?.code === "unverified" ? (
                <Alert tone="info" title="Verify your email first.">
                    We sent a link to your inbox.{" "}
                    <Link
                        href={`/verify-email?email=${encodeURIComponent(values.email.trim())}`}
                        className="text-accent underline-offset-4 hover:underline"
                    >
                        Open the verification page
                    </Link>
                </Alert>
            ) : (
                notice && (
                    <Alert tone={notice.tone} title={notice.title}>
                        {notice.body}
                    </Alert>
                )
            )}

            <Input
                label="College email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                error={errors.email}
            />

            <PasswordInput
                label="Password"
                name="password"
                autoComplete="current-password"
                value={values.password}
                onChange={(e) => set("password", e.target.value)}
                error={errors.password}
            />

            <Button type="submit" size="lg" loading={loading} className="w-full">
                Log in
            </Button>
        </form>
    );
}