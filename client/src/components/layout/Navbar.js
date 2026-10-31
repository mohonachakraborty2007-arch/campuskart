"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSaved } from "@/components/providers/SavedProvider";
import Button from "@/components/ui/Button";

const links = [
    { href: "/listings", label: "Browse" },
    { href: "/sell", label: "Sell" },
    { href: "/wishlist", label: "Saved" },
    { href: "/about", label: "About" },
];

function AccountMenu({ user, onSignOut, pathname }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!open) return;
        function onDown(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        function onKey(e) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const itemClass =
        "flex min-h-11 w-full items-center rounded-input px-3 text-left text-sm transition hover:bg-surface-2";

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="account-menu"
                aria-label={`Account menu for ${user.name}`}
                className="flex min-h-10 items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 transition hover:border-primary"
            >
                <span
                    aria-hidden="true"
                    className="grid h-8 w-8 place-items-center rounded-full bg-primary font-heading text-sm font-bold text-background"
                >
                    {user.name[0]}
                </span>
                <span className="hidden text-sm font-medium sm:inline">
                    {user.name}
                </span>
            </button>

            {open && (
                <div
                    id="account-menu"
                    className="absolute right-0 top-12 z-50 w-56 rounded-card border border-border bg-surface p-2 shadow-lg"
                >
                    <Link href="/inbox" className={itemClass}>
                        Inbox
                    </Link>
                    <Link href="/my-listings" className={itemClass}>
                        My listings
                    </Link>
                    <Link href="/wishlist" className={itemClass}>
                        Saved items
                    </Link>
                    <button
                        type="button"
                        onClick={onSignOut}
                        className={`${itemClass} border-t border-border text-muted`}
                    >
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
}

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { ids, ready: savedReady } = useSaved();
    const { user, ready: authReady, signOut } = useAuth();

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
            <div className="mx-auto grid h-16 max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-6">
                <Link
                    href="/"
                    aria-label="CampusKart home"
                    className="justify-self-start"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/logo-horizontal.png"
                        alt="CampusKart"
                        className="hidden h-8 w-auto md:block"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/logo-icon.png"
                        alt="CampusKart"
                        className="h-9 w-auto md:hidden"
                    />
                </Link>

                <nav aria-label="Primary" className="hidden md:block">
                    <ul className="flex items-center gap-1">
                        {links.map((link) => {
                            const active = pathname.startsWith(link.href);
                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        aria-current={active ? "page" : undefined}
                                        className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${active
                                                ? "bg-surface text-foreground"
                                                : "text-muted hover:bg-surface hover:text-foreground"
                                            }`}
                                    >
                                        {link.label}
                                        {link.href === "/wishlist" &&
                                            savedReady &&
                                            ids.length > 0 && (
                                                <span className="rounded-full bg-primary px-1.5 text-xs font-bold text-background">
                                                    {ids.length}
                                                </span>
                                            )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="flex items-center gap-2 justify-self-end">
                    {!authReady ? (
                        <span className="h-10 w-24" aria-hidden="true" />
                    ) : user ? (
                        <AccountMenu
                            user={user}
                            pathname={pathname}
                            onSignOut={() => {
                                signOut();
                                router.push("/");
                            }}
                        />
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" href="/login">
                                Log in
                            </Button>
                            <Button
                                size="sm"
                                href="/register"
                                className="hidden sm:inline-flex"
                            >
                                Sign up
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}