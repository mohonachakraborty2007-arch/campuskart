"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ListingCard from "@/components/ui/ListingCard";
import Tabs from "@/components/ui/Tabs";
import { api } from "@/lib/api";
import { memberSince, toCardListing } from "@/lib/listingFormat";

function Grid({ items, emptyTitle, emptyText }) {
    if (items.length === 0) {
        return <EmptyState title={emptyTitle}>{emptyText}</EmptyState>;
    }
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((l) => (
                <ListingCard key={l.id} listing={toCardListing(l)} />
            ))}
        </div>
    );
}

export default function SellerProfile({ id }) {
    const [reloadKey, setReloadKey] = useState(0);
    const [state, setState] = useState({ key: null, data: null, error: "", code: "" });
    const requestKey = `${id}:${reloadKey}`;

    useEffect(() => {
        let cancelled = false;
        api(`/users/${id}`)
            .then((data) => {
                if (!cancelled) setState({ key: requestKey, data, error: "", code: "" });
            })
            .catch((err) => {
                if (!cancelled) {
                    setState({ key: requestKey, data: null, error: err.message, code: err.code });
                }
            });
        return () => {
            cancelled = true;
        };
    }, [id, requestKey]);

    useEffect(() => {
        if (state.data) document.title = `${state.data.user.name} | CampusKart`;
    }, [state.data]);

    if (state.key !== requestKey) {
        return (
            <p className="py-16 text-center text-muted" aria-live="polite">
                Loading profile...
            </p>
        );
    }

    if (!state.data) {
        const missing = state.code === "NOT_FOUND" || state.code === "INVALID_ID";
        return missing ? (
            <EmptyState
                title="Seller not found"
                action={<Button href="/listings">Browse listings</Button>}
            >
                This profile does not exist.
            </EmptyState>
        ) : (
            <EmptyState
                title="Could not load this profile"
                action={<Button onClick={() => setReloadKey((k) => k + 1)}>Try again</Button>}
            >
                {state.error}
            </EmptyState>
        );
    }

    const { user, listings } = state.data;
    const { active, sold } = listings;

    const tabs = [
        {
            id: "active",
            label: "Active",
            count: active.length,
            content: (
                <Grid
                    items={active}
                    emptyTitle="No active listings"
                    emptyText="This seller has nothing for sale right now."
                />
            ),
        },
        {
            id: "sold",
            label: "Sold",
            count: sold.length,
            content: (
                <Grid
                    items={sold}
                    emptyTitle="Nothing sold yet"
                    emptyText="Sold items will show up here."
                />
            ),
        },
    ];

    const details = [
        user.department,
        user.year ? `Year ${user.year}` : null,
        `Member since ${memberSince(user.createdAt)}`,
    ]
        .filter(Boolean)
        .join(" · ");

    return (
        <div>
            <header className="flex flex-col gap-6 rounded-card border border-border bg-surface p-6 sm:flex-row sm:items-center">
                <span
                    aria-hidden="true"
                    className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-surface-2 font-heading text-3xl font-bold"
                >
                    {user.name[0]}
                </span>

                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold md:text-3xl">{user.name}</h1>
                    <p className="mt-1 text-muted">{details}</p>
                    {user.emailVerified && (
                        <Badge tone="success" className="mt-3">
                            Verified student
                        </Badge>
                    )}
                </div>

                <p className="rounded-full bg-surface-2 px-5 py-2 font-heading text-lg font-bold">
                    Sold {user.counts.sold} {user.counts.sold === 1 ? "item" : "items"}
                </p>
            </header>

            <div className="mt-10">
                <Tabs tabs={tabs} />
            </div>
        </div>
    );
}