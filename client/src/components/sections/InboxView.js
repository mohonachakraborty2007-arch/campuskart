"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { getAnyListing } from "@/lib/sampleListings";
import { initiallyRead, sampleInquiries } from "@/lib/sampleInquiries";

const KEY = "campuskart-inbox-read";

function replyLink(contact) {
    if (contact.type === "whatsapp") {
        return {
            href: `https://wa.me/${contact.value.replace(/\D/g, "")}`,
            label: "Reply on WhatsApp",
        };
    }
    return { href: `mailto:${contact.value}`, label: "Reply by email" };
}

export default function InboxView() {
    const [readIds, setReadIds] = useState(initiallyRead);
    const [openId, setOpenId] = useState(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) setReadIds(JSON.parse(raw));
        } catch {
            // storage can be blocked; the page still works
        }
    }, []);

    function save(next) {
        setReadIds(next);
        try {
            localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
            // ignore
        }
    }

    function toggleOpen(id) {
        if (openId === id) {
            setOpenId(null);
            return;
        }
        setOpenId(id);
        if (!readIds.includes(id)) save([...readIds, id]);
    }

    const unreadCount = sampleInquiries.filter(
        (q) => !readIds.includes(q.id)
    ).length;

    return (
        <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
                Inbox
                <span
                    aria-live="polite"
                    className="rounded-full bg-surface-2 px-3 py-1 font-sans text-base font-medium text-muted"
                >
                    {unreadCount} new
                </span>
            </h1>
            <p className="mt-2 text-muted">
                Buyers who are interested in your items. Reply on WhatsApp or email.
            </p>

            <div className="mt-8">
                {sampleInquiries.length === 0 ? (
                    <EmptyState
                        title="No messages yet"
                        action={<Button href="/sell">Post an item</Button>}
                    >
                        When a buyer contacts you about a listing, it shows up here.
                    </EmptyState>
                ) : (
                    <ul className="space-y-3">
                        {sampleInquiries.map((q) => {
                            const listing = getAnyListing(q.listingId);
                            const unread = !readIds.includes(q.id);
                            const open = openId === q.id;
                            const reply = replyLink(q.contact);
                            const panelId = `inquiry-${q.id}`;

                            return (
                                <li
                                    key={q.id}
                                    className={`rounded-card border transition ${unread
                                            ? "border-primary/50 bg-surface-2"
                                            : "border-border bg-surface"
                                        }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleOpen(q.id)}
                                        aria-expanded={open}
                                        aria-controls={panelId}
                                        className="flex w-full items-center gap-4 rounded-card p-4 text-left"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="h-14 w-14 shrink-0 rounded-input border border-border bg-surface-2"
                                            style={{
                                                backgroundImage:
                                                    "radial-gradient(rgba(244,245,250,0.1) 1px, transparent 1px)",
                                                backgroundSize: "10px 10px",
                                            }}
                                        />

                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center gap-2">
                                                {unread && (
                                                    <span
                                                        aria-hidden="true"
                                                        className="relative flex h-2.5 w-2.5 shrink-0"
                                                    >
                                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                                                    </span>
                                                )}
                                                <span
                                                    className={`truncate ${unread ? "font-bold" : "font-medium"
                                                        }`}
                                                >
                                                    {q.buyerName}
                                                </span>
                                                {unread && <Badge tone="accent">New</Badge>}
                                            </span>
                                            <span
                                                className={`mt-0.5 block truncate text-sm ${listing ? "text-foreground" : "text-muted line-through"
                                                    }`}
                                            >
                                                {listing ? listing.title : "Listing removed"}
                                            </span>
                                            <span className="mt-0.5 block truncate text-sm text-muted">
                                                {q.message}
                                            </span>
                                        </span>

                                        <span className="flex shrink-0 flex-col items-end gap-2 text-sm text-muted">
                                            {q.time}
                                            <svg
                                                viewBox="0 0 24 24"
                                                className={`h-5 w-5 fill-none stroke-current transition ${open ? "rotate-180" : ""
                                                    }`}
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden="true"
                                            >
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </span>
                                    </button>

                                    {open && (
                                        <div
                                            id={panelId}
                                            className="border-t border-border px-4 pb-4 pt-4"
                                        >
                                            <p className="whitespace-pre-line">{q.message}</p>
                                            <p className="mt-4 text-sm text-muted">
                                                Prefers {q.contact.type === "whatsapp" ? "WhatsApp" : "email"}:{" "}
                                                <span className="text-foreground">
                                                    {q.contact.value}
                                                </span>
                                            </p>

                                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                                <a
                                                    href={reply.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex min-h-11 items-center rounded-button bg-primary px-5 text-sm font-semibold text-background transition hover:brightness-110"
                                                >
                                                    {reply.label}
                                                </a>
                                                {listing && !listing.sold && (
                                                    <Link
                                                        href={`/listings/${listing.id}`}
                                                        className="text-sm text-accent underline-offset-4 hover:underline"
                                                    >
                                                        View listing
                                                    </Link>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        save(readIds.filter((id) => id !== q.id));
                                                        setOpenId(null);
                                                    }}
                                                    className="min-h-11 px-2 text-sm text-muted transition hover:text-foreground"
                                                >
                                                    Mark as unread
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}