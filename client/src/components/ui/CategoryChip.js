import Link from "next/link";

const base =
    "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium " +
    "transition-colors duration-200 select-none";

const states = {
    idle: "border-border bg-surface text-muted hover:border-primary hover:text-foreground",
    active: "border-primary bg-primary text-background",
};

export default function CategoryChip({
    label,
    count,
    active = false,
    href,
    onClick,
    className = "",
}) {
    const classes = `${base} ${active ? states.active : states.idle} ${className}`;

    const content = (
        <>
            <span>{label}</span>
            {typeof count === "number" && (
                <span className={active ? "opacity-80" : "text-muted"}>{count}</span>
            )}
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                className={classes}
                aria-current={active ? "page" : undefined}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={classes}
            aria-pressed={active}
        >
            {content}
        </button>
    );
}