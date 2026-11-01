"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useListingStatus } from "@/components/providers/ListingStatusProvider";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { getAnyListing } from "@/lib/sampleListings";
import { sampleReports } from "@/lib/sampleReports";

const KEY = "campuskart-reports-resolved";

export default function AdminReportsView() {
    const { user, ready } = useAuth();
    const { setStatus } = useListingStatus();
    const [resolved, setResolved] = useState([]);
    const [confirmReport, setConfirmReport] = useState(null);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) setResolved(JSON.parse(raw));
        } catch {
            // storage can be blocked; the page still works
        }
    }, []);

    function resolve(id) {
        const next = [...resolved, id];
        setResolved(next);
        try {
            localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
            // ignore
        }
    }

    if (!ready) return null;

    if (!user || user.role !== "admin") {
        return (
            <EmptyState
                title="403: you do not have access"
                action={<Button href="/">Back to home</Button>}
            >
                This area is for admins only.
            </EmptyState>
        );
    }

    const open = sampleReports.filter((r) => !resolved.includes(r.id));
    const confirmListing = confirmReport
        ? getAnyListing(confirmReport.listingId)
        : null;

    return (
        <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
                Reports
                <span
                    aria-live="polite"
                    className="rounded-full bg-surface-2 px-3 py-1 font-sans text-base font-medium text-muted"
                >
                    {open.length} open
                </span>
            </h1>
            <p className="mt-2 text-muted">
                Review reported listings. Remove the listing or dismiss the report.
            </p>

            {notice && (
                <Alert tone="success" className="mt-6">
                    {notice}
                </Alert>
            )}

            <div className="mt-8">
                {open.length === 0 ? (
                    <EmptyState title="No open reports">
                        Everything has been reviewed. Nice work.
                    </EmptyState>
                ) : (
                    <div className="overflow-x-auto rounded-card border border-border bg-surface">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <caption className="sr-only">Open listing reports</caption>
                            <thead className="border-b border-border text-muted">
                                <tr>
                                    <th scope="col" className="px-5 py-3 font-medium">
                                        Listing
                                    </th>
                                    <th scope="col" className="px-5 py-3 font-medium">
                                        Reason
                                    </th>
                                    <th scope="col" className="px-5 py-3 font-medium">
                                        Reported by
                                    </th>
                                    <th scope="col" className="px-5 py-3 font-medium">
                                        Date
                                    </th>
                                    <th scope="col" className="px-5 py-3 font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {open.map((r) => {
                                    const listing = getAnyListing(r.listingId);
                                    return (
                                        <tr key={r.id}>
                                            <td className="px-5 py-4">
                                                {listing ? (
                                                    <Link
                                                        href={`/listings/${listing.id}`}
                                                        className="font-medium hover:text-accent"
                                                    >
                                                        {listing.title}
                                                    </Link>
                                                ) : (
                                                    <span className="text-muted line-through">
                                                        Listing removed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge tone="warning">{r.reason}</Badge>
                                            </td>
                                            <td className="px-5 py-4 text-muted">{r.reporter}</td>
                                            <td className="px-5 py-4 text-muted">{r.date}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => {
                                                            resolve(r.id);
                                                            setNotice("Report dismissed.");
                                                        }}
                                                    >
                                                        Dismiss
                                                    </Button>
                                                    {listing && (
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() => setConfirmReport(r)}
                                                        >
                                                            Remove listing
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                open={Boolean(confirmReport)}
                onClose={() => setConfirmReport(null)}
                title="Remove this listing?"
            >
                <p className="text-muted">
                    &ldquo;{confirmListing?.title}&rdquo; will disappear from Browse and
                    the report will be closed.
                </p>
                <div className="mt-6 flex gap-3">
                    <Button
                        variant="danger"
                        onClick={() => {
                            setStatus(confirmReport.listingId, "removed");
                            resolve(confirmReport.id);
                            setNotice(`"${confirmListing?.title}" was removed.`);
                            setConfirmReport(null);
                        }}
                    >
                        Remove
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirmReport(null)}>
                        Cancel
                    </Button>
                </div>
            </Modal>
        </div>
    );
}