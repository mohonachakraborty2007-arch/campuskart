"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Toggle from "@/components/ui/Toggle";
import { api } from "@/lib/api";

export default function SettingsView() {
    const { user, ready } = useAuth();
    const userId = user?.id ?? null;

    const [loaded, setLoaded] = useState({ key: null, error: "" });
    const [form, setForm] = useState({
        name: "",
        department: "",
        whatsapp: "",
        showWhatsapp: false,
    });
    const [email, setEmail] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [fields, setFields] = useState({});

    useEffect(() => {
        if (!ready || !userId) return;
        let cancelled = false;
        api("/users/me/settings")
            .then((data) => {
                if (cancelled) return;
                const s = data.settings;
                setEmail(s.email);
                setForm({
                    name: s.name,
                    department: s.department,
                    whatsapp: s.whatsapp,
                    showWhatsapp: s.showWhatsapp,
                });
                setLoaded({ key: userId, error: "" });
            })
            .catch((err) => {
                if (!cancelled) setLoaded({ key: userId, error: err.message });
            });
        return () => {
            cancelled = true;
        };
    }, [ready, userId]);

    function change(name, value) {
        setForm((f) => ({ ...f, [name]: value }));
        setSaved(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError("");
        setFields({});
        setSaved(false);
        try {
            await api("/users/me/settings", { method: "PATCH", body: form });
            setSaved(true);
        } catch (err) {
            setError(err.message);
            setFields(err.fields || {});
        } finally {
            setSaving(false);
        }
    }

    const loading = !ready || (userId && loaded.key !== userId);

    if (loading) {
        return (
            <p className="py-12 text-center text-muted" aria-live="polite">
                Loading settings...
            </p>
        );
    }

    if (!userId) {
        return (
            <EmptyState
                title="Log in to open settings"
                action={<Button href="/login?next=/settings">Log in</Button>}
            >
                Your profile and contact preferences live here.
            </EmptyState>
        );
    }

    if (loaded.error) {
        return <EmptyState title="Could not load settings">{loaded.error}</EmptyState>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold md:text-4xl">Settings</h1>
            <p className="mt-2 text-muted">Your profile and how buyers can reach you.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                <section className="space-y-4">
                    <h2 className="text-xl font-bold">Profile</h2>
                    <Input label="Email" name="email" value={email} disabled readOnly />
                    <Input
                        label="Name"
                        name="name"
                        required
                        maxLength={60}
                        value={form.name}
                        onChange={(e) => change("name", e.target.value)}
                    />
                    <Input
                        label="Department"
                        name="department"
                        maxLength={60}
                        value={form.department}
                        onChange={(e) => change("department", e.target.value)}
                    />
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-bold">Contact preference</h2>
                    <p className="text-muted">
                        By default buyers can only message you inside CampusKart. If you
                        turn this on, your WhatsApp number is shown to a buyer only after
                        they send you a message. It is never shown on your profile or
                        listings.
                    </p>
                    <Input
                        label="WhatsApp number"
                        name="whatsapp"
                        type="tel"
                        inputMode="tel"
                        placeholder="+919830012345"
                        value={form.whatsapp}
                        onChange={(e) => change("whatsapp", e.target.value)}
                    />
                    {fields.whatsapp && (
                        <p role="alert" className="text-sm text-error">
                            {fields.whatsapp}
                        </p>
                    )}
                    <Toggle
                        label="Show my WhatsApp to buyers who message me"
                        checked={form.showWhatsapp}
                        onChange={(on) => change("showWhatsapp", on)}
                    />
                </section>

                {error && (
                    <Alert tone="error" title="Settings not saved.">
                        {error}
                    </Alert>
                )}
                {saved && <Alert tone="success" title="Settings saved." />}

                <Button type="submit" loading={saving}>
                    Save settings
                </Button>
            </form>
        </div>
    );
}