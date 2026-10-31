import { useId } from "react";

export default function Textarea({
    label,
    hideLabel = false,
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

    return (
        <div className={className}>
            <label
                htmlFor={fieldId}
                className={
                    hideLabel ? "sr-only" : "mb-1.5 block text-sm font-medium"
                }
            >
                {label}
            </label>
            <textarea
                id={fieldId}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={message ? messageId : undefined}
                className={`min-h-28 w-full rounded-input border bg-surface px-4 py-3 text-foreground placeholder:text-muted transition focus:border-primary ${error ? "border-danger" : "border-border"
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