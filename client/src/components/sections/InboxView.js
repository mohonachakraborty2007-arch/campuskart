"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/listingFormat";

export default function InboxView() {
    const { user, ready } = useAuth();
    const userId = user?.id ?? null;
    const [state, setState] = useState({ key: null, items: [], error: "" });
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        if (!ready || !userId) return;
        let cancelled = false;
        api("/inquiries")
            .then((data) => {
                if (!cancelled) setState({ key: userId, items: data.inquiries, error: "" });
            })
            .catch((err) => {
                if (!cancelled) setState({ key: userId, items: [], error: err.message });
            });
        return () => {
            cancelled = true;
        };
    }, [ready, userId]);

    async function markRead(id) {
        setActionError("");
        try {
            await api(`/inquiries/${id}/read`, { method: "PATCH" });
            setState((s) => ({
                ...s,
                items: s.items.map((i) => (i.id === id ? { ...i, unread: false } : i)),
            }));
        } catch (err) {
            setActionError(err.message);
        }
    }

    const loading = !ready || (userId && state.key !== userId);
    const unread = state.items.filter((i) => i.unread).length;

    let body;
    if (loading) {
        body = (
            <p className="py-12 text-center text-muted" aria-live="polite">
                Loading messages...
            </p>
        );
    } else if (!userId) {
        body = (
            <EmptyState
                title="Log in to see your inbox"
                action={<Button href="/login?next=/inbox">Log in</Button>}
            >
                Messages from buyers show up here.
            </EmptyState>
        );
    } else if (state.error) {
        body = <EmptyState title="Could not load your inbox">{state.error}</EmptyState>;
    } else if (state.items.length === 0) {
        body = (
            <EmptyState title="No messages yet">
                When a buyer messages you about a listing, it will appear here.
            </EmptyState>
        );
    } else {
        body = (
            <ul className="space-y-4">
                {state.items.map((item) => (
                    <li
                        key={item.id}
                        className="rounded-card border border-border bg-surface p-5"
                    >
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            {item.unread && (
                                <span className="rounded-full border border-accent/40 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-accent">
                                    New
                                </span>
                            )}
                            <p className="font-bold">{item.from?.name ?? "Deleted user"}</p>
                            {item.from?.department && (
                                <p className="text-sm text-muted">{item.from.department}</p>
                            )}
                            <p className="text-sm text-muted">{timeAgo(item.createdAt)}</p>
                        </div>

                        {item.listing && (
                            <p className="mt-2 text-sm text-muted">
                                About{" "}
                                {item.listing.status === "removed" ? (
                                    <span className="line-through">{item.listing.title}</span>
                                ) : (
                                    <Link
                                        href={`/listings/${item.listing.id}`}
                                        className="text-accent underline-offset-4 hover:underline"
                                    >
                                        {item.listing.title}
                                    </Link>
                                )}
                                {item.listing.status === "sold" && " (sold)"}
                            </p>
                        )}

                        {/* plain text only: React escapes it */}
                        <p className="mt-3 whitespace-pre-line">{item.message}</p>

                        {item.unread && (
                            <Button
                                className="mt-4"
                                size="sm"
                                variant="secondary"
                                onClick={() => markRead(item.id)}
                            >
                                Mark as read
                            </Button>
                        )}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
                Inbox
                {!loading && userId && unread > 0 && (
                    <span className="rounded-full bg-surface-2 px-3 py-1 font-sans text-base font-medium text-muted">
                        {unread} new
                    </span>
                )}
            </h1>
            <p className="mt-2 text-muted">Messages from students interested in your items.</p>

            {actionError && (
                <div className="mt-6">
                    <Alert tone="error" title="That did not work.">
                        {actionError}
                    </Alert>
                </div>
            )}

            <div className="mt-8">{body}</div>
        </div>
    );
}