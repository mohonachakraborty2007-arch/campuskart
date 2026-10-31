"use client";

import { useId } from "react";

export default function Toggle({ label, hint, checked, onChange }) {
    const id = useId();

    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <label htmlFor={id} className="font-medium">
                    {label}
                </label>
                {hint && <p className="text-sm text-muted">{hint}</p>}
            </div>
            <button
                id={id}
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative h-7 w-12 shrink-0 rounded-full border transition before:absolute before:-inset-2 before:content-[''] ${checked ? "border-primary bg-primary" : "border-border bg-surface-2"
                    }`}
            >
                <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full transition-all ${checked ? "left-6 bg-background" : "left-0.5 bg-muted"
                        }`}
                />
            </button>
        </div>
    );
}