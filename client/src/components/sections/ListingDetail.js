"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import ListingActions from "@/components/sections/ListingActions";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ImageGallery from "@/components/ui/ImageGallery";
import ListingCard from "@/components/ui/ListingCard";
import { api } from "@/lib/api";
import { categoryLabel, conditionLabels } from "@/lib/categories";
import {
    formatPrice,
    memberSince,
    timeAgo,
    toCardListing,
} from "@/lib/listingFormat";

const tones = { new: "accent", "like-new": "success", good: "accent", fair: "warning" };

export default function ListingDetail({ id }) {
    const { user, ready } = useAuth();
    const [reloadKey, setReloadKey] = useState(0);
    const [state, setState] = useState({
        key: null,
        listing: null,
        more: [],
        error: "",
        code: "",
    });
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState("");

    // fetch again when the viewer changes (so owners can see their removed listing)
    const requestKey = `${id}:${reloadKey}:${user?.id ?? "guest"}`;

    useEffect(() => {
        if (!ready) return;
        let cancelled = false;
        (async () => {
            try {
                const data = await api(`/listings/${id}`);
                let more = [];
                try {
                    const profile = await api(`/users/${data.listing.seller.id}`);
                    more = profile.listings.active
                        .filter((l) => l.id !== data.listing.id)
                        .slice(0, 4);
                } catch {
                    // "more from this seller" is a bonus; ignore errors
                }
                if (!cancelled) {
                    setState({ key: requestKey, listing: data.listing, more, error: "", code: "" });
                }
            } catch (err) {
                if (!cancelled) {
                    setState({
                        key: requestKey,
                        listing: null,
                        more: [],
                        error: err.message,
                        code: err.code,
                    });
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id, ready, requestKey]);

    useEffect(() => {
        if (state.listing) document.title = `${state.listing.title} | CampusKart`;
    }, [state.listing]);

    const loading = !ready || state.key !== requestKey;

    async function toggleSold() {
        setBusy(true);
        setActionError("");
        try {
            const data = await api(`/listings/${id}/sold`, { method: "PATCH" });
            setState((s) => ({
                ...s,
                listing: { ...s.listing, status: data.listing.status, soldAt: data.listing.soldAt },
            }));
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusy(false);
        }
    }

    const backLink = (
        <Link href="/listings" className="text-sm text-muted transition hover:text-foreground">
            ← Back to listings
        </Link>
    );

    if (loading) {
        return (
            <div>
                {backLink}
                <p className="py-16 text-center text-muted" aria-live="polite">
                    Loading listing...
                </p>
            </div>
        );
    }

    if (!state.listing) {
        const missing = state.code === "NOT_FOUND" || state.code === "INVALID_ID";
        return (
            <div>
                {backLink}
                <div className="mt-6">
                    {missing ? (
                        <EmptyState
                            title="Listing not found"
                            action={<Button href="/listings">Browse listings</Button>}
                        >
                            It may have been removed, or the link is not correct.
                        </EmptyState>
                    ) : (
                        <EmptyState
                            title="Could not load this listing"
                            action={
                                <Button onClick={() => setReloadKey((k) => k + 1)}>Try again</Button>
                            }
                        >
                            {state.error}
                        </EmptyState>
                    )}
                </div>
            </div>
        );
    }

    const listing = state.listing;
    const seller = listing.seller;
    const isOwner = Boolean(user && seller && user.id === seller.id);
    const sold = listing.status === "sold";

    return (
        <div>
            {backLink}

            <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
                <ImageGallery
                    title={listing.title}
                    images={listing.images.map((img) => img.url)}
                />

                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={tones[listing.condition] ?? "neutral"}>
                            {conditionLabels[listing.condition] ?? listing.condition}
                        </Badge>
                        <Badge>{categoryLabel(listing.category)}</Badge>
                        {sold && <Badge tone="warning">Sold</Badge>}
                    </div>

                    <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                        {listing.title}
                    </h1>

                    <p className="mt-5 inline-block rounded-full bg-surface-2 px-5 py-2 font-heading text-3xl font-bold">
                        {formatPrice(listing.price)}
                    </p>

                    <p className="mt-6 whitespace-pre-line text-muted">{listing.description}</p>

                    <dl className="mt-6 divide-y divide-border rounded-card border border-border bg-surface">
                        <div className="flex justify-between gap-4 px-5 py-4">
                            <dt className="text-muted">Pickup spot</dt>
                            <dd className="text-right font-medium">
                                {listing.pickupSpot || "Ask the seller"}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4 px-5 py-4">
                            <dt className="text-muted">Payment</dt>
                            <dd className="text-right font-medium">
                                {listing.openToExchange ? "Cash or exchange" : "Cash"}
                            </dd>
                        </div>
                        {listing.openToExchange && listing.exchangeWants && (
                            <div className="flex justify-between gap-4 px-5 py-4">
                                <dt className="text-muted">Looking for</dt>
                                <dd className="text-right font-medium">{listing.exchangeWants}</dd>
                            </div>
                        )}
                        <div className="flex justify-between gap-4 px-5 py-4">
                            <dt className="text-muted">Posted</dt>
                            <dd className="text-right font-medium">{timeAgo(listing.createdAt)}</dd>
                        </div>
                    </dl>

                    {/* seller card */}
                    {seller && (
                        <div className="mt-6 flex items-center gap-4 rounded-card border border-border bg-surface p-5">
                            <span
                                aria-hidden="true"
                                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface-2 font-heading text-lg font-bold"
                            >
                                {seller.name[0]}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold">{seller.name}</p>
                                <p className="text-sm text-muted">
                                    {[seller.department, `Member since ${memberSince(seller.createdAt)}`]
                                        .filter(Boolean)
                                        .join(" · ")}
                                </p>
                                {seller.emailVerified && (
                                    <Badge tone="success" className="mt-2">
                                        Verified student
                                    </Badge>
                                )}
                            </div>
                            <Link
                                href={`/u/${seller.id}`}
                                className="text-sm text-accent underline-offset-4 hover:underline"
                            >
                                View profile
                            </Link>
                        </div>
                    )}

                    {listing.status === "removed" && (
                        <div className="mt-6">
                            <Alert tone="info" title="This listing is removed.">
                                Only you can see it.
                            </Alert>
                        </div>
                    )}
                    {sold && !isOwner && (
                        <div className="mt-6">
                            <Alert tone="info" title="This item has been sold." />
                        </div>
                    )}
                    {actionError && (
                        <div className="mt-6">
                            <Alert tone="error" title="That did not work.">
                                {actionError}
                            </Alert>
                        </div>
                    )}

                    {isOwner ? (
                        listing.status !== "removed" && (
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Button size="lg" href={`/listings/${listing.id}/edit`}>
                                    Edit listing
                                </Button>
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    loading={busy}
                                    onClick={toggleSold}
                                >
                                    {sold ? "Mark as available" : "Mark as sold"}
                                </Button>
                            </div>
                        )
                    ) : (
                        <ListingActions listing={listing} />
                    )}
                </div>
            </div>

            {state.more.length > 0 && seller && (
                <section className="mt-16">
                    <h2 className="text-2xl font-bold">More from {seller.name}</h2>
                    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {state.more.map((l) => (
                            <ListingCard key={l.id} listing={toCardListing(l)} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}