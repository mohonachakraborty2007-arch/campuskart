import Link from "next/link";

const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-button " +
    "transition-[transform,box-shadow,background-color,border-color] duration-200 " +
    "select-none disabled:cursor-not-allowed disabled:opacity-50 " +
    "active:scale-[0.98]";

const variants = {
    primary:
        "bg-primary text-background hover:shadow-[0_0_0_1px_rgb(124_92_255/0.5),0_8px_30px_rgb(124_92_255/0.25)]",
    secondary:
        "border border-border bg-transparent text-foreground hover:border-primary hover:bg-surface",
    ghost: "bg-transparent text-muted hover:bg-surface hover:text-foreground",
    danger:
        "bg-danger text-background hover:shadow-[0_8px_30px_rgb(248_113_113/0.25)]",
};

const sizes = {
    sm: "min-h-9 px-3 text-sm",
    md: "min-h-11 px-5 text-base",
    lg: "min-h-12 px-7 text-base",
};

function Spinner() {
    return (
        <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
    );
}

export default function Button({
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    href,
    className = "",
    children,
    ...props
}) {
    const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

    if (href) {
        return (
            <Link href={href} className={classes} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button
            className={classes}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...props}
        >
            {loading && <Spinner />}
            {children}
        </button>
    );
}