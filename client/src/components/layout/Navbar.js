"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSaved } from "@/components/providers/SavedProvider";
import Button from "@/components/ui/Button";

const links = [
    { href: "/listings", label: "Browse" },
    { href: "/sell", label: "Sell" },
    { href: "/wishlist", label: "Saved" },
    { href: "/about", label: "About" },
];

export default function Navbar() {
    const pathname = usePathname();
    const { ids, ready } = useSaved();

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
                                        {link.href === "/wishlist" && ready && ids.length > 0 && (
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
                </div>
            </div>
        </header>
    );
}