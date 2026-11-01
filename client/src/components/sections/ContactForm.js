"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";

const topics = [
    { value: "question", label: "A question" },
    { value: "bug", label: "A bug or something broken" },
    { value: "report", label: "Report a listing or user" },
    { value: "delete", label: "Delete my account" },
    { value: "feedback", label: "Feedback or an idea" },
];

export default function ContactForm() {
    const [values, setValues] = useState({
        name: "",
        email: "",
        topic: "question",
        message: "",
    });
    const [errors, setErrors] = useState({});
    const [sent, setSent] = useState(false);

    function set(key, value) {
        setValues((v) => ({ ...v, [key]: value }));
        setErrors((e) => {
            if (!e[key]) return e;
            const { [key]: _removed, ...rest } = e;
            return rest;
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const found = {};
        if (values.name.trim().length < 2) found.name = "Enter your name.";
        if (!/^\S+@\S+\.\S+$/.test(values.email.trim()))
            found.email = "Enter a valid email address.";
        if (values.message.trim().length < 10)
            found.message = "Write at least 10 characters.";
        setErrors(found);

        const firstKey = ["name", "email", "message"].find((k) => found[k]);
        if (firstKey) {
            form.elements.namedItem(firstKey)?.focus();
            return;
        }
        // Demo only: the real request to the API comes in the backend phase.
        setSent(true);
    }

    if (sent) {
        return (
            <div className="rounded-card border border-border bg-surface p-8 text-center">
                <h2 className="text-2xl font-bold">Message sent</h2>
                <p className="mx-auto mt-3 max-w-md text-muted">
                    Thanks for writing in. This is a demo, so nothing is delivered until
                    the backend is connected.
                </p>
                <Button
                    className="mt-6"
                    variant="secondary"
                    onClick={() => {
                        setValues({ name: "", email: "", topic: "question", message: "" });
                        setSent(false);
                    }}
                >
                    Send another
                </Button>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4 rounded-card border border-border bg-surface p-6"
        >
            <Input
                label="Your name"
                name="name"
                autoComplete="name"
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                error={errors.name}
            />
            <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                error={errors.email}
            />
            <Select
                label="Topic"
                name="topic"
                options={topics}
                value={values.topic}
                onChange={(e) => set("topic", e.target.value)}
            />
            <Textarea
                label="Message"
                name="message"
                value={values.message}
                onChange={(e) => set("message", e.target.value)}
                error={errors.message}
            />
            <Button type="submit" size="lg">
                Send message
            </Button>
        </form>
    );
}