import { useId } from "react";

export default function Select({
    label,
    hideLabel = false,
    options = [],
    error,
    className = "",
    id,
    ...props
}) {
    const autoId = useId();
    const selectId = id || autoId;

    return (
        <div className={className}>
            <label
                htmlFor={selectId}
                className={
                    hideLabel ? "sr-only" : "mb-1.5 block text-sm font-medium"
                }
            >
                {label}
            </label>
            <div className="relative">
                <select
                    id={selectId}
                    aria-invalid={error ? "true" : undefined}
                    className={`min-h-11 w-full appearance-none rounded-input border bg-surface pl-4 pr-10 text-foreground transition focus:border-primary ${error ? "border-danger" : "border-border"
                        }`}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <svg
                    viewBox="0 0 24 24"
                    className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 fill-none stroke-muted"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>
            {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
        </div>
    );
}