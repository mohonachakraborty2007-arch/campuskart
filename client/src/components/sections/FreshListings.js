"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ListingCard from "@/components/ui/ListingCard";
import { ListingCardSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { toCardListing } from "@/lib/listingFormat";

export default function FreshListings() {
    const [state, setState] = useState({ status: "loading", listings: [], error: "" });

    useEffect(() => {
        let cancelled = false;
        api("/listings?limit=8")
            .then((data) => {
                if (!cancelled) setState({ status: "ready", listings: data.listings, error: "" });
            })
            .catch((err) => {
                if (!cancelled) setState({ status: "error", listings: [], error: err.message });
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section className="mx-auto max-w-[1200px] px-4 py-14 md:px-6">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold md:text-3xl">Fresh on campus</h2>
                    <p className="mt-2 text-muted">Posted by students in the last few days.</p>
                </div>
                <Button variant="secondary" href="/listings">
                    View all
                </Button>
            </div>

            <div className="mt-8">
                {state.status === "loading" && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <ListingCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {state.status === "error" && (
                    <EmptyState title="Could not load listings">{state.error}</EmptyState>
                )}

                {state.status === "ready" && state.listings.length === 0 && (
                    <EmptyState
                        title="No listings yet"
                        action={<Button href="/sell">Post the first item</Button>}
                    >
                        Be the first to list something on campus.
                    </EmptyState>
                )}

                {state.status === "ready" && state.listings.length > 0 && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {state.listings.map((listing) => (
                            <ListingCard key={listing.id} listing={toCardListing(listing)} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}