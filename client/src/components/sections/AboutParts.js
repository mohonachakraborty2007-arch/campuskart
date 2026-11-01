const trades = [
    "Books",
    "Cycles",
    "Notes",
    "Electronics",
    "Hostel gear",
    "Clothing",
    "Calculators",
    "Lab coats",
];

export function Marquee() {
    const row = (key) => (
        <ul
            key={key}
            aria-hidden={key === "b" ? "true" : undefined}
            className="flex shrink-0 items-center gap-6 pr-6"
        >
            {trades.map((item) => (
                <li
                    key={item}
                    className="flex items-center gap-6 whitespace-nowrap font-heading text-2xl text-muted md:text-4xl"
                >
                    {item}
                    <span className="h-2.5 w-2.5 rounded-full bg-pop" />
                </li>
            ))}
        </ul>
    );

    return (
        <div
            aria-label="What students trade: books, cycles, notes, electronics, hostel gear and clothing"
            className="overflow-hidden border-y border-border py-6"
            style={{
                maskImage:
                    "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }}
        >
            <div className="marquee-track flex w-max">
                {row("a")}
                {row("b")}
            </div>
        </div>
    );
}

export function HandoffStrip() {
    const dot = "block h-6 w-6 rounded-full border border-border bg-surface-2";
    const label =
        "absolute left-1/2 top-9 -translate-x-1/2 text-xs text-muted";

    return (
        <div aria-hidden="true" className="relative mx-auto mt-14 h-24 max-w-xl">
            <div className="absolute inset-x-3 top-1/2 border-t border-dashed border-border" />

            <div className="absolute inset-x-3 top-1/2 h-0">
                <span className="tag-ride absolute -top-3.5 rounded-full bg-pop px-3 py-1 text-xs font-bold text-background">
                    Book
                </span>
            </div>

            <div className="absolute left-0 top-1/2 -translate-y-1/2">
                <span className={dot} />
                <span className={label}>Seller</span>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="block h-6 w-6 rounded-full bg-primary" />
                <span className={label}>Library</span>
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <span className={dot} />
                <span className={label}>Buyer</span>
            </div>
        </div>
    );
}

export function InfoCard({ label, title, children }) {
    return (
        <div className="h-full rounded-card border border-border bg-surface p-6 transition duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_12px_40px_-12px_rgba(124,92,255,0.45)]">
            <p className="text-sm font-medium text-accent">{label}</p>
            <h3 className="mt-3 text-xl font-bold">{title}</h3>
            <p className="mt-3 text-muted">{children}</p>
        </div>
    );
}