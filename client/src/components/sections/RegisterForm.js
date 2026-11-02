"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { api } from "@/lib/api";
import { COLLEGE_DOMAINS, isCollegeEmail } from "@/lib/config";

function strength(p) {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Za-z]/.test(p) && /\d/.test(p)) s++;
    if (p.length >= 12 || /[^A-Za-z0-9]/.test(p)) s++;
    return s;
}

const labels = ["", "Weak", "Okay", "Strong"];
const barColors = ["", "bg-danger", "bg-warning", "bg-success"];

function validate(v) {
    const e = {};
    if (v.name.trim().length < 2) e.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) {
        e.email = "Enter a valid email address.";
    } else if (!isCollegeEmail(v.email)) {
        e.email = `Use your college email (ends with @${COLLEGE_DOMAINS[0]}).`;
    }
    if (v.password.length < 8) {
        e.password = "Use at least 8 characters.";
    } else if (!/[A-Za-z]/.test(v.password) || !/\d/.test(v.password)) {
        e.password = "Include at least one letter and one number.";
    }
    return e;
}

export default function RegisterForm() {
    const router = useRouter();
    const [values, setValues] = useState({ name: "", email: "", password: "" });
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

        const found = validate(values);
        setErrors(found);

        const firstKey = ["name", "email", "password"].find((k) => found[k]);
        if (firstKey) {
            form.elements.namedItem(firstKey)?.focus();
            return;
        }

        setLoading(true);
        try {
            await api("/auth/register", {
                method: "POST",
                body: {
                    name: values.name.trim(),
                    email: values.email.trim(),
                    password: values.password,
                },
            });
            router.push(
                `/verify-email?email=${encodeURIComponent(values.email.trim())}&fresh=1`
            );
        } catch (err) {
            if (err.code === "EMAIL_TAKEN") {
                setErrors({
                    email: "An account with this email already exists. Try logging in.",
                });
                form.elements.namedItem("email")?.focus();
            } else if (err.code === "VALIDATION_ERROR" && err.fields) {
                setErrors(err.fields);
            } else if (err.code === "RATE_LIMITED") {
                setNotice({
                    title: "Too many attempts",
                    body: "Please wait 15 minutes before trying again.",
                });
            } else {
                setNotice({ title: "Could not create your account.", body: err.message });
            }
        } finally {
            setLoading(false);
        }
    }

    const score = strength(values.password);
    const hasErrors = Object.keys(errors).length > 0;

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {notice && (
                <Alert tone="error" title={notice.title}>
                    {notice.body}
                </Alert>
            )}
            {hasErrors && (
                <Alert tone="error" title="Please fix the highlighted fields." />
            )}

            <Input
                label="Full name"
                name="name"
                autoComplete="name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                error={errors.name}
            />

            <Input
                label="College email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={`you@${COLLEGE_DOMAINS[0]}`}
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                error={errors.email}
                hint="Only students can sign up. We will send a verification link."
            />

            <div>
                <PasswordInput
                    label="Password"
                    name="password"
                    autoComplete="new-password"
                    value={values.password}
                    onChange={(e) => set("password", e.target.value)}
                    error={errors.password}
                    hint="At least 8 characters, with a letter and a number."
                />
                {values.password && (
                    <div className="mt-2 flex items-center gap-3" aria-live="polite">
                        <div className="flex flex-1 gap-1.5" aria-hidden="true">
                            {[1, 2, 3].map((n) => (
                                <span
                                    key={n}
                                    className={`h-1.5 flex-1 rounded-full ${n <= score ? barColors[score] : "bg-surface-2"
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-muted">{labels[score]}</span>
                    </div>
                )}
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full">
                Create account
            </Button>
        </form>
    );
}