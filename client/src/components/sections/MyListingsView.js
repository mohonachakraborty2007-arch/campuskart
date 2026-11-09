"use client";

import { useEffect, useState } from "react";
import RequireVerified from "@/components/sections/RequireVerified";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Tabs from "@/components/ui/Tabs";
import Toggle from "@/components/ui/Toggle";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatPrice, timeAgo } from "@/lib/listingFormat";

function MyListingsInner() {
    const [listings, setListings] = useState(null); // null = still loading
    const [loadError, setLoadError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [actionError, setActionError] = useState("");
    const [busyId, setBusyId] = useState(null);
    const [confirmItem, setConfirmItem] = useState(null);

    useEffect(() => {
        let cancelled = false;
        api("/users/me/listings")
            .then((data) => {
                if (!cancelled) setListings(data.listings);
            })
            .catch((err) => {
                if (!cancelled) {
                    setLoadError(err.message);
                    setListings([]);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [reloadKey]);

    function retry() {
        setListings(null);
        setLoadError("");
        setReloadKey((k) => k + 1);
    }

    function replace(updated) {
        setListings((current) =>
            current.map((l) => (l.id === updated.id ? updated : l))
        );
    }

    async function toggleSold(listing) {
        if (busyId) return;
        setBusyId(listing.id);
        setActionError("");
        try {
            const data = await api(`/listings/${listing.id}/sold`, { method: "PATCH" });
            replace(data.listing);
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId(null);
        }
    }

    async function removeListing() {
        const listing = confirmItem;
        setConfirmItem(null);
        if (!listing) return;
        setBusyId(listing.id);
        setActionError("");
        try {
            const data = await api(`/listings/${listing.id}`, { method: "DELETE" });
            replace(data.listing);
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId(null);
        }
    }

    if (listings === null) {
        return (
            <p className="py-16 text-center text-muted" aria-live="polite">
                Loading your listings...
            </p>
        );
    }

    if (loadError) {
        return (
            <EmptyState
                title="Could not load your listings"
                action={<Button onClick={retry}>Try again</Button>}
            >
                {loadError}
            </EmptyState>
        );
    }

    const byStatus = (s) => listings.filter((l) => l.status === s);

    function renderRow(listing) {
        const removed = listing.status === "removed";
        return (
            <li
                key={listing.id}
                className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 sm:flex-row sm:items-center"
            >
                {listing.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={listing.images[0].url}
                        alt=""
                        className="hidden h-16 w-16 shrink-0 rounded-input border border-border object-cover sm:block"
                    />
                ) : (
                    <span
                        aria-hidden="true"
                        className="hidden h-16 w-16 shrink-0 rounded-input border border-border bg-surface-2 sm:block"
                    />
                )}

                <div className="min-w-0 flex-1">
                    {removed ? (
                        <p className="truncate font-medium text-muted line-through">
                            {listing.title}
                        </p>
                    ) : (
                        <Link
                            href={`/listings/${listing.id}`}
                            className="block truncate font-medium hover:text-accent"
                        >
                            {listing.title}
                        </Link>
                    )}
                    <p className="mt-1 text-sm text-muted">
                        {formatPrice(listing.price)} · {timeAgo(listing.createdAt)}
                    </p>
                </div>

                {removed ? (
                    <p className="text-sm text-muted">Removed</p>
                ) : (
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <div className="w-40">
                            <Toggle
                                label="Mark as sold"
                                checked={listing.status === "sold"}
                                onChange={() => toggleSold(listing)}
                            />
                        </div>
                        <Link
                            href={`/listings/${listing.id}/edit`}
                            className="min-h-11 content-center text-sm text-accent underline-offset-4 hover:underline"
                        >
                            Edit
                        </Link>
                        <button
                            type="button"
                            onClick={() => setConfirmItem(listing)}
                            className="min-h-11 text-sm text-muted transition hover:text-danger"
                        >
                            Remove
                        </button>
                    </div>
                )}
            </li>
        );
    }

    function list(status, emptyTitle, emptyText, emptyAction) {
        const items = byStatus(status);
        if (items.length === 0) {
            return (
                <EmptyState title={emptyTitle} action={emptyAction}>
                    {emptyText}
                </EmptyState>
            );
        }
        return <ul className="space-y-3">{items.map(renderRow)}</ul>;
    }

    const tabs = [
        {
            id: "active",
            label: "Active",
            count: byStatus("active").length,
            content: list(
                "active",
                "Post your first item",
                "Items you list will show up here.",
                <Button href="/sell">Post an item</Button>
            ),
        },
        {
            id: "sold",
            label: "Sold",
            count: byStatus("sold").length,
            content: list(
                "sold",
                "Nothing sold yet",
                "Flip the Sold switch on an active item once it is gone."
            ),
        },
        {
            id: "removed",
            label: "Removed",
            count: byStatus("removed").length,
            content: list(
                "removed",
                "No removed listings",
                "Items you remove are hidden from Browse and show up here."
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold md:text-4xl">My listings</h1>
                    <p className="mt-2 text-muted">Manage what you are selling.</p>
                </div>
                <Button href="/sell">Post an item</Button>
            </div>

            {actionError && (
                <div className="mt-6">
                    <Alert tone="error" title="That did not work.">
                        {actionError}
                    </Alert>
                </div>
            )}

            <div className="mt-8">
                <Tabs tabs={tabs} />
            </div>

            <Modal
                open={Boolean(confirmItem)}
                onClose={() => setConfirmItem(null)}
                title="Remove this listing?"
            >
                <p className="text-muted">
                    &ldquo;{confirmItem?.title}&rdquo; will disappear from Browse.
                </p>
                <div className="mt-6 flex gap-3">
                    <Button variant="danger" onClick={removeListing}>
                        Remove
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirmItem(null)}>
                        Cancel
                    </Button>
                </div>
            </Modal>
        </div>
    );
}

export default function MyListingsView() {
    return (
        <RequireVerified>
            <MyListingsInner />
        </RequireVerified>
    );
}