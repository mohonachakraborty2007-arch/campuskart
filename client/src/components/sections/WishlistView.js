"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSaved } from "@/components/providers/SavedProvider";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ListingCard from "@/components/ui/ListingCard";
import { ListingCardSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { toCardListing } from "@/lib/listingFormat";

export default function WishlistView() {
    const { user, ready: authReady } = useAuth();
    const { ids, ready, toggle } = useSaved();
    const userId = user?.id ?? null;
    const headingRef = useRef(null);
    const [undo, setUndo] = useState(null);
    const [fetched, setFetched] = useState({ key: null, listings: [], error: "" });

    useEffect(() => {
        if (!authReady || !userId) return;
        let cancelled = false;
        api("/wishlist")
            .then((data) => {
                if (!cancelled) setFetched({ key: userId, listings: data.listings, error: "" });
            })
            .catch((err) => {
                if (!cancelled) setFetched({ key: userId, listings: [], error: err.message });
            });
        return () => {
            cancelled = true;
        };
    }, [authReady, userId]);

    useEffect(() => {
        if (!undo) return;
        const timer = setTimeout(() => setUndo(null), 6000);
        return () => clearTimeout(timer);
    }, [undo]);

    const loading = !authReady || !ready || (userId && fetched.key !== userId);

    // listings you un-hearted disappear; Undo brings them back
    const items = fetched.listings.filter((l) => ids.includes(l.id)).map(toCardListing);

    function handleChange(listing, nowSaved) {
        if (!nowSaved) {
            setUndo({ id: listing.id, title: listing.title });
            headingRef.current?.focus();
        }
    }

    let body;
    if (loading) {
        body = (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <ListingCardSkeleton key={i} />
                ))}
            </div>
        );
    } else if (!userId) {
        body = (
            <EmptyState
                title="Log in to see your saved items"
                action={<Button href="/login?next=/wishlist">Log in</Button>}
            >
                Your saved items are kept on your account.
            </EmptyState>
        );
    } else if (fetched.error) {
        body = (
            <EmptyState title="Could not load saved items">{fetched.error}</EmptyState>
        );
    } else if (items.length === 0) {
        body = (
            <EmptyState
                title="Nothing saved yet"
                action={<Button href="/listings">Browse listings</Button>}
            >
                Tap the heart on any item to keep it here.
            </EmptyState>
        );
    } else {
        body = (
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
        );
    }

    return (
        <div>
            <h1
                ref={headingRef}
                tabIndex={-1}
                className="flex items-center gap-3 text-3xl font-bold focus:outline-none md:text-4xl"
            >
                Saved items
                {!loading && userId && (
                    <span className="rounded-full bg-surface-2 px-3 py-1 font-sans text-base font-medium text-muted">
                        {items.length}
                    </span>
                )}
            </h1>
            <p className="mt-2 text-muted">Everything you hearted, in one place.</p>

            <div className="mt-8">{body}</div>

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