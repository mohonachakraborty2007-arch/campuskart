"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-[600px] flex-col items-center justify-center px-4 py-16 text-center md:px-6">
            <span
                aria-hidden="true"
                className="grid h-16 w-16 place-items-center rounded-full border border-border bg-surface-2"
            >
                <svg
                    viewBox="0 0 24 24"
                    className="h-8 w-8 fill-none stroke-danger"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 3l10 18H2L12 3z" />
                    <path d="M12 10v4M12 17.5v.01" />
                </svg>
            </span>

            <h1 className="mt-6 text-3xl font-bold md:text-4xl">
                Something went wrong
            </h1>
            <p className="mt-3 max-w-md text-muted">
                We hit an unexpected problem. Try again, and if it keeps happening,
                come back in a few minutes.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button size="lg" onClick={() => reset()}>
                    Try again
                </Button>
                <Button size="lg" variant="secondary" href="/">
                    Back to home
                </Button>
            </div>
        </div>
    );
}