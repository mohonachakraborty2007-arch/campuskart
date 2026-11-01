"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toggle from "@/components/ui/Toggle";

const KEY = "campuskart-profile";

const departments = [
    { value: "", label: "Choose your department" },
    { value: "CSE", label: "Computer Science (CSE)" },
    { value: "CSE (AI-ML)", label: "CSE (AI-ML)" },
    { value: "ECE", label: "Electronics (ECE)" },
    { value: "EEE", label: "Electrical (EEE)" },
    { value: "Mechanical", label: "Mechanical" },
    { value: "Civil", label: "Civil" },
    { value: "Biotechnology", label: "Biotechnology" },
    { value: "Other", label: "Other" },
];

const years = [
    { value: "", label: "Choose your year" },
    { value: "1st year", label: "1st year" },
    { value: "2nd year", label: "2nd year" },
    { value: "3rd year", label: "3rd year" },
    { value: "4th year", label: "4th year" },
    { value: "Other", label: "Other" },
];

function validate(v) {
    const e = {};
    if (v.name.trim().length < 2) e.name = "Enter your full name.";
    if (v.showPhone) {
        const digits = v.phone.replace(/\D/g, "");
        if (digits.length < 10 || digits.length > 13)
            e.phone = "Enter a valid WhatsApp number, or switch sharing off.";
    }
    return e;
}

export default function SettingsView() {
    const router = useRouter();
    const { user, ready, signIn, signOut } = useAuth();
    const [values, setValues] = useState(null);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("idle"); // idle, saving, saved, error

    useEffect(() => {
        if (!ready || !user) return;
        let stored = {};
        try {
            stored = JSON.parse(localStorage.getItem(KEY) || "{}");
        } catch {
            // storage can be blocked; fall back to defaults
        }
        setValues({
            name: user.name,
            department: "",
            year: "",
            phone: "",
            showPhone: false,
            ...stored,
        });
    }, [ready, user]);

    if (!ready || (user && !values)) return null;

    if (!user) {
        return (
            <EmptyState
                title="Log in to open settings"
                action={<Button href="/login?next=/settings">Log in</Button>}
            >
                Your profile and contact preferences live here.
            </EmptyState>
        );
    }

    function set(key, value) {
        setValues((v) => ({ ...v, [key]: value }));
        setErrors((e) => {
            if (!e[key]) return e;
            const { [key]: _removed, ...rest } = e;
            return rest;
        });
        setStatus("idle");
    }

    function handleSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const found = validate(values);
        setErrors(found);

        const firstKey = ["name", "phone"].find((k) => found[k]);
        if (firstKey) {
            form.elements.namedItem(firstKey)?.focus();
            return;
        }

        setStatus("saving");
        setTimeout(() => {
            try {
                localStorage.setItem(KEY, JSON.stringify(values));
                signIn({ ...user, name: values.name.trim() });
                setStatus("saved");
            } catch {
                setStatus("error");
            }
        }, 700);
    }

    const card = "rounded-card border border-border bg-surface p-6";

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* profile */}
                <section className={card}>
                    <h2 className="text-xl font-bold">Profile</h2>
                    <div className="mt-5 flex items-center gap-4">
                        <span
                            aria-hidden="true"
                            className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary font-heading text-2xl font-bold text-background"
                        >
                            {values.name.trim()[0] ?? "?"}
                        </span>
                        <p className="text-sm text-muted">
                            Photo upload arrives with the backend. For now your initial is
                            used.
                        </p>
                    </div>

                    <div className="mt-6 space-y-4">
                        <Input
                            label="Full name"
                            name="name"
                            autoComplete="name"
                            value={values.name}
                            onChange={(e) => set("name", e.target.value)}
                            error={errors.name}
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Select
                                label="Department"
                                name="department"
                                options={departments}
                                value={values.department}
                                onChange={(e) => set("department", e.target.value)}
                            />
                            <Select
                                label="Year"
                                name="year"
                                options={years}
                                value={values.year}
                                onChange={(e) => set("year", e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* contact preference */}
                <section className={card}>
                    <h2 className="text-xl font-bold">Contact preference</h2>
                    <p className="mt-2 text-sm text-muted">
                        Buyers can always message you in the app. Sharing your number is
                        optional.
                    </p>

                    <div className="mt-5 space-y-4">
                        <Toggle
                            label="Show my WhatsApp number to buyers"
                            hint={
                                values.showPhone
                                    ? "On: buyers can see your number on your listings."
                                    : "Off: your number stays private."
                            }
                            checked={values.showPhone}
                            onChange={(on) => set("showPhone", on)}
                        />
                        {values.showPhone && (
                            <Input
                                label="WhatsApp number"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                placeholder="+91 90000 00000"
                                value={values.phone}
                                onChange={(e) => set("phone", e.target.value)}
                                error={errors.phone}
                            />
                        )}
                    </div>
                </section>

                <div className="flex flex-wrap items-center gap-4">
                    <Button type="submit" size="lg" loading={status === "saving"}>
                        Save changes
                    </Button>
                    {status === "saved" && (
                        <p role="status" className="text-sm text-success">
                            Saved
                        </p>
                    )}
                </div>
                {status === "error" && (
                    <Alert tone="error" title="Could not save your changes.">
                        Please try again.
                    </Alert>
                )}
            </form>

            {/* account */}
            <section className={card}>
                <h2 className="text-xl font-bold">Account</h2>
                <p className="mt-2 text-sm text-muted">
                    Signed in as <span className="text-foreground">{user.email}</span>
                </p>
                <Button
                    className="mt-5"
                    variant="secondary"
                    onClick={() => {
                        signOut();
                        router.push("/");
                    }}
                >
                    Log out
                </Button>
            </section>
        </div>
    );
}