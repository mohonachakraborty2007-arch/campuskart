"use client";

import Link from "next/link";
import { useSaved } from "@/components/providers/SavedProvider";
import { categories } from "@/lib/sampleListings";

const conditionStyles = {
    "Like new": "text-success border-success/40",
    Good: "text-accent border-accent/40",
    Fair: "text-warning border-warning/40",
};

export default function ListingCard({
    listing,
    className = "",
    onSavedChange,
}) {
    const { isSaved, toggle } = useSaved();
    const saved = isSaved(listing.id);
    const categoryLabel =
        categories.find((c) => c.slug === listing.category)?.label ??
        listing.category;

    return (
        <article
            className={`group relative flex flex-col overflow-hidden rounded-card border border-border bg-surface transition duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_12px_40px_-12px_rgba(124,92,255,0.45)] ${className}`}
        >
            {/* image area, 4:3 */}
            <div className="relative aspect-[4/3] bg-surface-2">
                {listing.sold && (
                    <span className="absolute inset-x-0 bottom-0 z-[1] bg-background/90 py-1.5 text-center text-xs font-bold uppercase tracking-widest">
                        Sold
                    </span>
                )}
                {listing.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={listing.image}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div
                        className="flex h-full w-full items-end p-4"
                        style={{
                            backgroundImage:
                                "radial-gradient(rgba(244,245,250,0.08) 1px, transparent 1px)",
                            backgroundSize: "16px 16px",
                        }}
                    >
                        <span className="text-sm text-muted">{categoryLabel}</span>
                    </div>
                )}

                <span
                    className={`absolute left-3 top-3 rounded-full border bg-background/80 px-2.5 py-1 text-xs font-medium backdrop-blur ${conditionStyles[listing.condition] ?? "text-muted border-border"
                        }`}
                >
                    {listing.condition}
                </span>
            </div>

            {/* text area */}
            <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="font-heading text-xl font-bold text-foreground">
                    {listing.priceLabel ??
                        (listing.price === 0
                            ? "Free"
                            : `₹${listing.price.toLocaleString("en-IN")}`)}
                </p>
                <h3 className="line-clamp-2 text-base font-medium leading-snug text-foreground">
                    <Link
                        href={`/listings/${listing.id}`}
                        className="after:absolute after:inset-0 after:content-['']"
                    >
                        {listing.title}
                    </Link>
                </h3>
                <p className="mt-auto text-sm text-muted">
                    {listing.location} · {listing.postedAgo}
                </p>
            </div>

            {/* heart, sits above the stretched link */}
            <button
                type="button"
                onClick={() => {
                    toggle(listing.id);
                    onSavedChange?.(!saved);
                }}
                aria-pressed={saved}
                aria-label={saved ? "Remove from saved" : "Save listing"}
                className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-background/80 backdrop-blur transition hover:bg-background"
            >
                <svg
                    viewBox="0 0 24 24"
                    className={`h-5 w-5 transition ${saved ? "fill-primary stroke-primary" : "fill-none stroke-foreground"
                        }`}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M12 21s-7.5-4.6-9.5-9.2C1.1 8.3 3.2 5 6.6 5c2 0 3.7 1.1 5.4 3.2C13.7 6.1 15.4 5 17.4 5c3.4 0 5.5 3.3 4.1 6.8C19.5 16.4 12 21 12 21z" />
                </svg>
            </button>
        </article>
    );
}