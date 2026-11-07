"use client";

import { useEffect, useState } from "react";
import RequireVerified from "@/components/sections/RequireVerified";
import SellForm from "@/components/sections/SellForm";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { api } from "@/lib/api";

function EditInner({ id }) {
    const [state, setState] = useState({ status: "loading", listing: null, error: "" });

    useEffect(() => {
        let cancelled = false;
        api("/users/me/listings")
            .then((data) => {
                if (cancelled) return;
                const found = data.listings.find(
                    (l) => l.id === id && l.status !== "removed"
                );
                setState(
                    found
                        ? { status: "ready", listing: found, error: "" }
                        : { status: "missing", listing: null, error: "" }
                );
            })
            .catch((err) => {
                if (!cancelled) {
                    setState({ status: "error", listing: null, error: err.message });
                }
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (state.status === "loading") {
        return (
            <p className="py-16 text-center text-muted" aria-live="polite">
                Loading your listing...
            </p>
        );
    }

    if (state.status === "error") {
        return (
            <EmptyState
                title="Could not load this listing"
                action={<Button href="/my-listings">Back to my listings</Button>}
            >
                {state.error}
            </EmptyState>
        );
    }

    if (state.status === "missing") {
        return (
            <EmptyState
                title="We could not find that listing"
                action={<Button href="/my-listings">Back to my listings</Button>}
            >
                It may have been removed, or it belongs to someone else. You can only
                edit your own listings.
            </EmptyState>
        );
    }

    const l = state.listing;
    const initial = {
        title: l.title,
        category: l.category,
        condition: l.condition,
        price: String(l.price),
        free: l.price === 0,
        description: l.description,
        pickup: l.pickupSpot,
        exchange: l.openToExchange,
    };
    const initialPhotos = l.images.map((img) => ({
        id: img.publicId,
        url: img.url,
        publicId: img.publicId,
        existing: true,
    }));

    return (
        <SellForm
            mode="edit"
            listingId={l.id}
            initial={initial}
            initialPhotos={initialPhotos}
        />
    );
}

export default function EditListing({ id }) {
    return (
        <RequireVerified>
            <EditInner id={id} />
        </RequireVerified>
    );
}