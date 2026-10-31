const tones = {
    error: "border-danger/50 text-danger",
    success: "border-success/50 text-success",
    info: "border-border text-foreground",
};

export default function Alert({ tone = "info", title, children, className = "" }) {
    return (
        <div
            role={tone === "error" ? "alert" : "status"}
            className={`rounded-input border bg-surface px-4 py-3 text-sm ${tones[tone]} ${className}`}
        >
            {title && <p className="font-bold">{title}</p>}
            {children && (
                <p className={title ? "mt-1 text-muted" : ""}>{children}</p>
            )}
        </div>
    );
}