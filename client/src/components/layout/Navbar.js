"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";

const links = [
    { href: "/listings", label: "Browse" },
    { href: "/sell", label: "Sell" },
    { href: "/about", label: "About" },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
            <nav
                aria-label="Main"
                className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-6"
            >
                <Link href="/" aria-label="CampusKart home" className="flex items-center">
                    <Image
                        src="/logo-horizontal.png"
                        alt="CampusKart"
                        width={1246}
                        height={230}
                        priority
                        className="hidden h-8 w-auto md:block"
                    />
                    <Image
                        src="/logo-icon.png"
                        alt=""
                        aria-hidden="true"
                        width={487}
                        height={441}
                        priority
                        className="h-9 w-auto md:hidden"
                    />
                </Link>

                <ul className="hidden items-center gap-1 md:flex">
                    {links.map((link) => {
                        const active =
                            pathname === link.href || pathname.startsWith(link.href + "/");
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    aria-current={active ? "page" : undefined}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${active
                                            ? "bg-surface text-foreground"
                                            : "text-muted hover:bg-surface hover:text-foreground"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="flex items-center gap-2">
                    <Button href="/login" variant="ghost" size="sm">
                        Log in
                    </Button>
                    <Button href="/register" size="sm" className="hidden sm:inline-flex">
                        Sign up
                    </Button>
                </div>
            </nav>
        </header>
    );
}