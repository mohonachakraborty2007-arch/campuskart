const tones = {
    neutral: "border-border text-muted",
    success: "border-success/40 text-success",
    accent: "border-accent/40 text-accent",
    warning: "border-warning/40 text-warning",
};

export default function Badge({ tone = "neutral", children, className = "" }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border bg-surface px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`}
        >
            {children}
        </span>
    );
}