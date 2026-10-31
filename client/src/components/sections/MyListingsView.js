"use client";

import { useState } from "react";
import Link from "next/link";
import { useListingStatus } from "@/components/providers/ListingStatusProvider";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Tabs from "@/components/ui/Tabs";
import Toggle from "@/components/ui/Toggle";
import { getSellerListings } from "@/lib/sampleListings";

const OWNER = "s3"; // demo seller: Kabir M.

export default function MyListingsView() {
    const { statusOf, setStatus } = useListingStatus();
    const [confirmItem, setConfirmItem] = useState(null);

    const { active, sold } = getSellerListings(OWNER);
    const mine = [...active, ...sold];
    const byStatus = (s) => mine.filter((l) => statusOf(l.id) === s);

    function Row({ listing, status }) {
        return (
            <li className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 sm:flex-row sm:items-center">
                <span
                    aria-hidden="true"
                    className="hidden h-16 w-16 shrink-0 rounded-input border border-border bg-surface-2 sm:block"
                    style={{
                        backgroundImage:
                            "radial-gradient(rgba(244,245,250,0.1) 1px, transparent 1px)",
                        backgroundSize: "10px 10px",
                    }}
                />

                <div className="min-w-0 flex-1">
                    {status === "removed" ? (
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
                        ₹{listing.price.toLocaleString("en-IN")} · {listing.postedAgo}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    {status === "removed" ? (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setStatus(listing.id, "active")}
                        >
                            Restore
                        </Button>
                    ) : (
                        <>
                            <div className="w-40">
                                <Toggle
                                    label="Mark as sold"
                                    checked={status === "sold"}
                                    onChange={(on) =>
                                        setStatus(listing.id, on ? "sold" : "active")
                                    }
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
                        </>
                    )}
                </div>
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
        return (
            <ul className="space-y-3">
                {items.map((l) => (
                    <Row key={l.id} listing={l} status={status} />
                ))}
            </ul>
        );
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
                "Items you remove can be restored from here."
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

            <div className="mt-8">
                <Tabs tabs={tabs} />
            </div>

            <Modal
                open={Boolean(confirmItem)}
                onClose={() => setConfirmItem(null)}
                title="Remove this listing?"
            >
                <p className="text-muted">
                    &ldquo;{confirmItem?.title}&rdquo; will disappear from Browse. You can
                    restore it from the Removed tab.
                </p>
                <div className="mt-6 flex gap-3">
                    <Button
                        variant="danger"
                        onClick={() => {
                            setStatus(confirmItem.id, "removed");
                            setConfirmItem(null);
                        }}
                    >
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