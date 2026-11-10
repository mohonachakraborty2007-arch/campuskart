"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatPrice, timeAgo } from "@/lib/listingFormat";

export default function LatestTicker() {
    const [listings, setListings] = useState([]);

    useEffect(() => {
        let cancelled = false;
        api("/listings?limit=10")
            .then((data) => {
                if (!cancelled) setListings(data.listings);
            })
            .catch(() => {
                // decoration only: if it fails, the strip just stays hidden
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // too few items would leave gaps in the loop
    if (listings.length < 3) return null;

    // repeat the list so each half of the loop is wider than the screen
    const items = Array.from(
        { length: Math.max(8, listings.length) },
        (_, i) => listings[i % listings.length]
    );

    const row = (key) => (
        <ul key={key} className="flex shrink-0 items-center gap-4 pr-4">
            {items.map((l, i) => (
                <li
                    key={`${l.id}-${i}`}
                    className="flex items-center gap-3 whitespace-nowrap rounded-full border border-border bg-surface px-4 py-2 text-sm"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-pop" />
                    <span className="font-heading font-bold">{formatPrice(l.price)}</span>
                    <span>{l.title}</span>
                    <span className="text-muted">{timeAgo(l.createdAt)}</span>
                </li>
            ))}
        </ul>
    );

    return (
        <div
            aria-hidden="true"
            className="overflow-hidden border-b border-border py-4"
            style={{
                maskImage:
                    "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            }}
        >
            <div className="marquee-track flex w-max">
                {row("a")}
                {row("b")}
            </div>
        </div>
    );
}