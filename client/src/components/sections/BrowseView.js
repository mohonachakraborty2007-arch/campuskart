"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import CategoryChip from "@/components/ui/CategoryChip";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import ListingCard from "@/components/ui/ListingCard";
import Select from "@/components/ui/Select";
import { ListingCardSkeleton } from "@/components/ui/Skeleton";
import Toggle from "@/components/ui/Toggle";
import { api } from "@/lib/api";
import { allCategories, conditionOptions } from "@/lib/categories";
import { toCardListing } from "@/lib/listingFormat";

const sortOptions = [
    { value: "newest", label: "Newest first" },
    { value: "price_asc", label: "Price: low to high" },
    { value: "price_desc", label: "Price: high to low" },
];

// 1 ... 4 5 6 ... 12
function pageNumbers(current, pages) {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const wanted = [...new Set([1, pages, current - 1, current, current + 1])]
        .filter((n) => n >= 1 && n <= pages)
        .sort((a, b) => a - b);
    const out = [];
    wanted.forEach((n, i) => {
        if (i > 0 && n - wanted[i - 1] > 1) out.push(`gap-${n}`);
        out.push(n);
    });
    return out;
}

export default function BrowseView() {
    const router = useRouter();
    const params = useSearchParams();
    const paramsString = params.toString();
    const [open, setOpen] = useState(false);

    // everything lives in the URL
    const q = params.get("q") ?? "";
    const category = params.get("category") ?? "";
    const sort = params.get("sort") ?? "newest";
    const condition = params.get("condition") ?? "";
    const exchange = params.get("exchange") === "true";
    const minPrice = params.get("minPrice") ?? "";
    const maxPrice = params.get("maxPrice") ?? "";
    const page = Math.max(1, Number(params.get("page")) || 1);

    const buildHref = useCallback(
        (changes) => {
            const next = new URLSearchParams(paramsString);
            for (const [key, value] of Object.entries(changes)) {
                if (value === "" || value == null) next.delete(key);
                else next.set(key, value);
            }
            if (!("page" in changes)) next.delete("page");
            const qs = next.toString();
            return qs ? `/listings?${qs}` : "/listings";
        },
        [paramsString]
    );

    const update = useCallback(
        (changes) => router.replace(buildHref(changes), { scroll: false }),
        [router, buildHref]
    );

    // text boxes: typed locally, pushed to the URL 400 ms after you stop typing
    const [search, setSearch] = useState(q);
    const [minInput, setMinInput] = useState(minPrice);
    const [maxInput, setMaxInput] = useState(maxPrice);
    const pushed = useRef({ q, minPrice, maxPrice });

    function applyText() {
        const next = { q: search.trim(), minPrice: minInput, maxPrice: maxInput };
        pushed.current = next;
        update(next);
    }

    useEffect(() => {
        const trimmed = search.trim();
        if (trimmed === q && minInput === minPrice && maxInput === maxPrice) return;
        const timer = setTimeout(() => {
            const next = { q: trimmed, minPrice: minInput, maxPrice: maxInput };
            pushed.current = next;
            update(next);
        }, 400);
        return () => clearTimeout(timer);
    }, [search, minInput, maxInput, q, minPrice, maxPrice, update]);

    // URL changed from outside (Clear filters, back button): refresh the boxes
    useEffect(() => {
        const last = pushed.current;
        if (q === last.q && minPrice === last.minPrice && maxPrice === last.maxPrice) return;
        pushed.current = { q, minPrice, maxPrice };
        setSearch(q);
        setMinInput(minPrice);
        setMaxInput(maxPrice);
    }, [q, minPrice, maxPrice]);

    // fetch from the server (filtering is done by the server, never here)
    const apiQuery = useMemo(() => {
        const source = new URLSearchParams(paramsString);
        const p = new URLSearchParams();
        for (const key of ["q", "category", "condition", "sort", "minPrice", "maxPrice"]) {
            const v = source.get(key);
            if (v) p.set(key, v);
        }
        if (source.get("exchange") === "true") p.set("exchange", "true");
        p.set("page", String(Math.max(1, Number(source.get("page")) || 1)));
        p.set("limit", "12");
        return p.toString();
    }, [paramsString]);

    const [result, setResult] = useState({ key: null, listings: [], meta: null, error: "" });

    useEffect(() => {
        let cancelled = false;
        api(`/listings?${apiQuery}`)
            .then((data) => {
                if (!cancelled) {
                    setResult({ key: apiQuery, listings: data.listings, meta: data.meta, error: "" });
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setResult({ key: apiQuery, listings: [], meta: null, error: err.message });
                }
            });
        return () => {
            cancelled = true;
        };
    }, [apiQuery]);

    const loading = result.key !== apiQuery;
    const hasData = result.key !== null;
    const total = result.meta?.total ?? 0;
    const pages = result.meta?.pages ?? 1;

    const hasFilters =
        q || category || condition || exchange || minPrice || maxPrice || sort !== "newest";

    function handleSubmit(e) {
        e.preventDefault();
        applyText();
    }

    let body;
    if (result.error && !loading) {
        body = (
            <EmptyState
                title="Could not load listings"
                action={
                    <Button href="/listings" variant="secondary">
                        Clear filters
                    </Button>
                }
            >
                {result.error}
            </EmptyState>
        );
    } else if (loading && result.listings.length === 0) {
        body = (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <ListingCardSkeleton key={i} />
                ))}
            </div>
        );
    } else if (result.listings.length > 0) {
        body = (
            <div
                aria-busy={loading}
                className={`grid grid-cols-1 gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-60" : ""
                    }`}
            >
                {result.listings.map((listing) => (
                    <ListingCard key={listing.id} listing={toCardListing(listing)} />
                ))}
            </div>
        );
    } else {
        body = (
            <EmptyState
                title="No results"
                action={
                    <Button href="/listings" variant="secondary">
                        Clear filters
                    </Button>
                }
            >
                Nothing matches your search. Try different words or clear the filters.
            </EmptyState>
        );
    }

    return (
        <div>
            {/* search + filters */}
            <form onSubmit={handleSubmit}>
                <div className="flex gap-2">
                    <Input
                        className="flex-1"
                        label="Search listings"
                        hideLabel
                        name="q"
                        type="search"
                        maxLength={60}
                        placeholder="Search books, cycles, calculators"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button type="submit">Search</Button>
                    <button
                        type="button"
                        onClick={() => setOpen((o) => !o)}
                        aria-expanded={open}
                        aria-controls="filter-panel"
                        className="min-h-11 rounded-button border border-border px-4 text-sm font-medium transition hover:border-primary md:hidden"
                    >
                        Filters
                    </button>
                </div>
                <p className="mt-2 text-xs text-muted">
                    Search matches whole words, so try &ldquo;calculator&rdquo; rather than
                    &ldquo;calc&rdquo;.
                </p>

                <div id="filter-panel" className={`${open ? "block" : "hidden"} md:block`}>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                        <Select
                            label="Sort by"
                            name="sort"
                            value={sort}
                            options={sortOptions}
                            onChange={(e) =>
                                update({ sort: e.target.value === "newest" ? "" : e.target.value })
                            }
                        />
                        <Select
                            label="Condition"
                            name="condition"
                            value={condition}
                            options={conditionOptions}
                            onChange={(e) => update({ condition: e.target.value })}
                        />
                        <Input
                            label="Min price (₹)"
                            name="minPrice"
                            type="number"
                            min="0"
                            inputMode="numeric"
                            value={minInput}
                            onChange={(e) => setMinInput(e.target.value)}
                        />
                        <Input
                            label="Max price (₹)"
                            name="maxPrice"
                            type="number"
                            min="0"
                            inputMode="numeric"
                            value={maxInput}
                            onChange={(e) => setMaxInput(e.target.value)}
                        />
                    </div>
                    <div className="mt-4">
                        <Toggle
                            label="Open to exchange only"
                            checked={exchange}
                            onChange={(on) => update({ exchange: on ? "true" : "" })}
                        />
                    </div>
                </div>
            </form>

            {/* category tabs */}
            <div className="mt-6 flex flex-wrap gap-2">
                <CategoryChip label="All" active={!category} href={buildHref({ category: "" })} />
                {allCategories.map((cat) => (
                    <CategoryChip
                        key={cat.slug}
                        label={cat.label}
                        active={category === cat.slug}
                        href={buildHref({ category: cat.slug })}
                    />
                ))}
            </div>

            {/* result count */}
            <div className="mt-8 flex items-center justify-between gap-4">
                <p aria-live="polite" className="text-muted">
                    {loading && hasData
                        ? "Updating..."
                        : loading
                            ? "Loading..."
                            : result.error
                                ? ""
                                : `${total} ${total === 1 ? "item" : "items"}`}
                </p>
                {hasFilters && (
                    <Link
                        href="/listings"
                        className="text-sm text-accent underline-offset-4 hover:underline"
                    >
                        Clear filters
                    </Link>
                )}
            </div>

            <div className="mt-5">{body}</div>

            {/* pagination */}
            {pages > 1 && (
                <nav
                    aria-label="Pagination"
                    className="mt-10 flex flex-wrap items-center justify-center gap-2"
                >
                    {page > 1 && (
                        <Link
                            href={buildHref({ page: page - 1 === 1 ? "" : String(page - 1) })}
                            className="grid h-11 place-items-center rounded-button border border-border px-4 text-sm font-medium text-muted transition hover:border-primary hover:text-foreground"
                        >
                            Previous
                        </Link>
                    )}
                    {pageNumbers(page, pages).map((n) =>
                        typeof n === "string" ? (
                            <span key={n} aria-hidden="true" className="px-1 text-muted">
                                ...
                            </span>
                        ) : (
                            <Link
                                key={n}
                                href={buildHref({ page: n === 1 ? "" : String(n) })}
                                aria-current={n === page ? "page" : undefined}
                                className={`grid h-11 min-w-11 place-items-center rounded-button border px-3 text-sm font-medium transition ${n === page
                                    ? "border-primary bg-primary text-background"
                                    : "border-border text-muted hover:border-primary hover:text-foreground"
                                    }`}
                            >
                                {n}
                            </Link>
                        )
                    )}
                    {page < pages && (
                        <Link
                            href={buildHref({ page: String(page + 1) })}
                            className="grid h-11 place-items-center rounded-button border border-border px-4 text-sm font-medium text-muted transition hover:border-primary hover:text-foreground"
                        >
                            Next
                        </Link>
                    )}
                </nav>
            )}
        </div>
    );
}