"use client";

import { useId, useState } from "react";

export default function PasswordInput({
    label,
    error,
    hint,
    className = "",
    id,
    ...props
}) {
    const autoId = useId();
    const fieldId = id || autoId;
    const messageId = `${fieldId}-message`;
    const message = error || hint;
    const [show, setShow] = useState(false);

    return (
        <div className={className}>
            <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium">
                {label}
            </label>
            <div className="relative">
                <input
                    id={fieldId}
                    type={show ? "text" : "password"}
                    aria-invalid={error ? "true" : undefined}
                    aria-describedby={message ? messageId : undefined}
                    className={`min-h-11 w-full rounded-input border bg-surface pl-4 pr-12 text-foreground placeholder:text-muted transition focus:border-primary ${error ? "border-danger" : "border-border"
                        }`}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                    aria-pressed={show}
                    className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-muted transition hover:text-foreground"
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5 fill-none stroke-current"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                        <circle cx="12" cy="12" r="3" />
                        {show && <path d="M4 4l16 16" />}
                    </svg>
                </button>
            </div>
            {message && (
                <p
                    id={messageId}
                    className={`mt-1.5 text-sm ${error ? "text-danger" : "text-muted"}`}
                >
                    {message}
                </p>
            )}
        </div>
    );
}