"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const icons = {
    home: "M3 11l9-8 9 8M5 10v10h14V10",
    browse: "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.3-4.3",
    sell: "M12 5v14M5 12h14",
    saved:
        "M12 21s-7.5-4.6-9.5-9.2C1.1 8.3 3.2 5 6.6 5c2 0 3.7 1.1 5.4 3.2C13.7 6.1 15.4 5 17.4 5c3.4 0 5.5 3.3 4.1 6.8C19.5 16.4 12 21 12 21z",
    profile: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.6-7 8-7s8 3 8 7",
};

const tabs = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/listings", label: "Browse", icon: "browse" },
    { href: "/sell", label: "Sell", icon: "sell" },
    { href: "/saved", label: "Saved", icon: "saved" },
    { href: "/profile", label: "Profile", icon: "profile" },
];

export default function MobileTabBar() {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Main"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
        >
            <ul className="mx-auto grid max-w-[480px] grid-cols-5">
                {tabs.map((tab) => {
                    const active =
                        tab.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(tab.href);
                    return (
                        <li key={tab.href}>
                            <Link
                                href={tab.href}
                                aria-current={active ? "page" : undefined}
                                className={`flex min-h-14 flex-col items-center justify-center gap-1 text-xs transition ${active ? "text-primary" : "text-muted"
                                    }`}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-6 w-6 fill-none stroke-current"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d={icons[tab.icon]} />
                                </svg>
                                {tab.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}