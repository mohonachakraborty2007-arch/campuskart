"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/listingFormat";

const reasonLabels = {
    spam: "Spam or fake listing",
    scam: "Scam or suspicious",
    prohibited: "Prohibited item",
    "wrong-category": "Wrong category",
    other: "Something else",
};

export default function AdminReports() {
    const { user, ready } = useAuth();
    const userId = user?.id ?? null;
    const [state, setState] = useState({ key: null, reports: [], error: "", code: "" });
    const [busyId, setBusyId] = useState(null);
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        if (!ready || !userId) return;
        let cancelled = false;
        api("/admin/reports")
            .then((data) => {
                if (!cancelled) setState({ key: userId, reports: data.reports, error: "", code: "" });
            })
            .catch((err) => {
                if (!cancelled) {
                    setState({ key: userId, reports: [], error: err.message, code: err.code });
                }
            });
        return () => {
            cancelled = true;
        };
    }, [ready, userId]);

    async function act(report, action) {
        if (
            action === "remove-listing" &&
            !window.confirm(`Remove "${report.listing?.title}" from CampusKart?`)
        ) {
            return;
        }
        setBusyId(report.id);
        setActionError("");
        try {
            await api(`/admin/reports/${report.id}`, { method: "PATCH", body: { action } });
            setState((s) => ({
                ...s,
                reports: s.reports.filter((r) =>
                    action === "remove-listing"
                        ? r.listing?.id !== report.listing?.id
                        : r.id !== report.id
                ),
            }));
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId(null);
        }
    }

    const loading = !ready || (userId && state.key !== userId);

    let body;
    if (loading) {
        body = (
            <p className="py-12 text-center text-muted" aria-live="polite">
                Loading reports...
            </p>
        );
    } else if (!userId) {
        body = (
            <EmptyState
                title="Log in first"
                action={<Button href="/login?next=/admin/reports">Log in</Button>}
            >
                This page is for admins.
            </EmptyState>
        );
    } else if (state.code === "FORBIDDEN") {
        body = (
            <EmptyState title="Admins only" action={<Button href="/">Go home</Button>}>
                Your account does not have access to this page.
            </EmptyState>
        );
    } else if (state.error) {
        body = <EmptyState title="Could not load reports">{state.error}</EmptyState>;
    } else if (state.reports.length === 0) {
        body = (
            <EmptyState title="No open reports">Nothing needs your attention right now.</EmptyState>
        );
    } else {
        body = (
            <ul className="space-y-4">
                {state.reports.map((r) => (
                    <li key={r.id} className="rounded-card border border-border bg-surface p-5">
                        <p className="text-sm text-muted">
                            {reasonLabels[r.reason] ?? r.reason} · reported by{" "}
                            {r.reporter?.name ?? "deleted user"} · {timeAgo(r.createdAt)}
                        </p>

                        {r.listing ? (
                            <p className="mt-2">
                                <Link
                                    href={`/listings/${r.listing.id}`}
                                    className="font-bold text-accent underline-offset-4 hover:underline"
                                >
                                    {r.listing.title}
                                </Link>
                                {r.listing.seller && (
                                    <span className="text-muted"> · seller {r.listing.seller.name}</span>
                                )}
                            </p>
                        ) : (
                            <p className="mt-2 text-muted">Listing no longer exists.</p>
                        )}

                        {/* plain text only: React escapes it */}
                        {r.details && <p className="mt-3 whitespace-pre-line">{r.details}</p>}

                        <div className="mt-4 flex flex-wrap gap-3">
                            <Button
                                size="sm"
                                loading={busyId === r.id}
                                onClick={() => act(r, "remove-listing")}
                            >
                                Remove listing
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                loading={busyId === r.id}
                                onClick={() => act(r, "dismiss")}
                            >
                                Dismiss
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold md:text-4xl">Reports</h1>
            <p className="mt-2 text-muted">Open reports, newest first.</p>

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