import { useId } from "react";

export default function Input({
    label,
    hideLabel = false,
    error,
    hint,
    className = "",
    id,
    ...props
}) {
    const autoId = useId();
    const inputId = id || autoId;
    const messageId = `${inputId}-message`;
    const message = error || hint;

    return (
        <div className={className}>
            <label
                htmlFor={inputId}
                className={
                    hideLabel ? "sr-only" : "mb-1.5 block text-sm font-medium"
                }
            >
                {label}
            </label>
            <input
                id={inputId}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={message ? messageId : undefined}
                className={`min-h-11 w-full rounded-input border bg-surface px-4 text-foreground placeholder:text-muted transition focus:border-primary ${error ? "border-danger" : "border-border"
                    }`}
                {...props}
            />
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