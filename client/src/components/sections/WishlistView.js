"use client";

import { useEffect, useRef, useState } from "react";
import { useSaved } from "@/components/providers/SavedProvider";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ListingCard from "@/components/ui/ListingCard";
import { ListingCardSkeleton } from "@/components/ui/Skeleton";
import { getAnyListing } from "@/lib/sampleListings";

export default function WishlistView() {
    const { ids, ready, toggle } = useSaved();
    const headingRef = useRef(null);
    const [undo, setUndo] = useState(null);

    useEffect(() => {
        if (!undo) return;
        const timer = setTimeout(() => setUndo(null), 6000);
        return () => clearTimeout(timer);
    }, [undo]);

    // removed or unknown listings are simply left out
    const items = ids.map(getAnyListing).filter(Boolean);

    function handleChange(listing, nowSaved) {
        if (!nowSaved) {
            setUndo({ id: listing.id, title: listing.title });
            headingRef.current?.focus();
        }
    }

    return (
        <div>
            <h1
                ref={headingRef}
                tabIndex={-1}
                className="flex items-center gap-3 text-3xl font-bold focus:outline-none md:text-4xl"
            >
                Saved items
                {ready && (
                    <span className="rounded-full bg-surface-2 px-3 py-1 font-sans text-base font-medium text-muted">
                        {items.length}
                    </span>
                )}
            </h1>
            <p className="mt-2 text-muted">
                Everything you hearted, in one place.
            </p>

            <div className="mt-8">
                {!ready ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <ListingCardSkeleton key={i} />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <EmptyState
                        title="Nothing saved yet"
                        action={<Button href="/listings">Browse listings</Button>}
                    >
                        Tap the heart on any item to keep it here.
                    </EmptyState>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                        {items.map((listing) => (
                            <div
                                key={listing.id}
                                className={listing.sold ? "opacity-60 grayscale" : ""}
                            >
                                <ListingCard
                                    listing={listing}
                                    onSavedChange={(now) => handleChange(listing, now)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {undo && (
                <div
                    role="status"
                    className="fixed inset-x-4 bottom-20 z-50 mx-auto flex max-w-md items-center justify-between gap-4 rounded-card border border-border bg-surface px-5 py-3 shadow-lg md:bottom-6"
                >
                    <span className="min-w-0 truncate text-sm">
                        Removed &ldquo;{undo.title}&rdquo;
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            toggle(undo.id);
                            setUndo(null);
                        }}
                        className="min-h-11 shrink-0 px-2 text-sm font-medium text-accent underline-offset-4 hover:underline"
                    >
                        Undo
                    </button>
                </div>
            )}
        </div>
    );
}