"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import CategoryChip from "@/components/ui/CategoryChip";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import ListingCard from "@/components/ui/ListingCard";
import Select from "@/components/ui/Select";
import { useListingStatus } from "@/components/providers/ListingStatusProvider";
import { categories, sampleListings } from "@/lib/sampleListings";

const PAGE_SIZE = 6;

const sortOptions = [
    { value: "newest", label: "Newest first" },
    { value: "price-asc", label: "Price: low to high" },
    { value: "price-desc", label: "Price: high to low" },
];

const conditionOptions = [
    { value: "", label: "Any condition" },
    { value: "Like new", label: "Like new" },
    { value: "Good", label: "Good" },
    { value: "Fair", label: "Fair" },
];

export default function BrowseView() {
    const router = useRouter();
    const params = useSearchParams();
    const [open, setOpen] = useState(false);
    const { statusOf } = useListingStatus();

    const q = params.get("q") ?? "";
    const category = params.get("category") ?? "";
    const sort = params.get("sort") ?? "newest";
    const condition = params.get("condition") ?? "";
    const min = params.get("min") ?? "";
    const max = params.get("max") ?? "";
    const page = Math.max(1, Number(params.get("page")) || 1);

    function hrefWith(changes) {
        const next = new URLSearchParams(params.toString());
        for (const [key, value] of Object.entries(changes)) {
            if (value === "" || value == null) next.delete(key);
            else next.set(key, value);
        }
        if (!("page" in changes)) next.delete("page");
        const qs = next.toString();
        return qs ? `/listings?${qs}` : "/listings";
    }

    function handleSubmit(e) {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const sortValue = data.get("sort");
        router.replace(
            hrefWith({
                q: String(data.get("q") ?? "").trim(),
                sort: sortValue === "newest" ? "" : sortValue,
                condition: data.get("condition"),
                min: data.get("min"),
                max: data.get("max"),
            }),
            { scroll: false }
        );
    }

    // filter
    const all = sampleListings
        .filter((l) => statusOf(l.id) !== "removed")
        .map((l) => ({ ...l, sold: statusOf(l.id) === "sold" }));

    const filtered = all.filter((l) => {
        if (category && l.category !== category) return false;
        if (condition && l.condition !== condition) return false;
        if (q && !l.title.toLowerCase().includes(q.toLowerCase())) return false;
        if (min !== "" && l.price < Number(min)) return false;
        if (max !== "" && l.price > Number(max)) return false;
        return true;
    });

    // sort
    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);

    // paginate
    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const current = Math.min(page, totalPages);
    const visible = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

    const hasFilters =
        q || category || condition || min || max || sort !== "newest";

    return (
        <div>
            {/* search + filters */}
            <form key={params.toString()} onSubmit={handleSubmit}>
                <div className="flex gap-2">
                    <Input
                        className="flex-1"
                        label="Search listings"
                        hideLabel
                        name="q"
                        type="search"
                        placeholder="Search books, cycles, calculators"
                        defaultValue={q}
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

                <div
                    id="filter-panel"
                    className={`${open ? "grid" : "hidden"
                        } mt-4 gap-3 sm:grid-cols-2 md:grid md:grid-cols-5`}
                >
                    <Select
                        label="Sort by"
                        name="sort"
                        defaultValue={sort}
                        options={sortOptions}
                        onChange={(e) => e.currentTarget.form.requestSubmit()}
                    />
                    <Select
                        label="Condition"
                        name="condition"
                        defaultValue={condition}
                        options={conditionOptions}
                        onChange={(e) => e.currentTarget.form.requestSubmit()}
                    />
                    <Input
                        label="Min price (₹)"
                        name="min"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        defaultValue={min}
                    />
                    <Input
                        label="Max price (₹)"
                        name="max"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        defaultValue={max}
                    />
                    <Button type="submit" variant="secondary" className="self-end">
                        Apply
                    </Button>
                </div>
            </form>

            {/* category tabs */}
            <div className="mt-6 flex flex-wrap gap-2">
                <CategoryChip
                    label="All"
                    active={!category}
                    href={hrefWith({ category: "" })}
                />
                {categories.map((cat) => (
                    <CategoryChip
                        key={cat.slug}
                        label={cat.label}
                        active={category === cat.slug}
                        href={hrefWith({ category: cat.slug })}
                    />
                ))}
            </div>

            {/* result count */}
            <div className="mt-8 flex items-center justify-between gap-4">
                <p aria-live="polite" className="text-muted">
                    {sorted.length} {sorted.length === 1 ? "item" : "items"}
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

            {/* grid or empty */}
            {visible.length > 0 ? (
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            ) : (
                <div className="mt-5">
                    <EmptyState
                        title="No results"
                        action={
                            <Button href="/listings" variant="secondary">
                                Clear filters
                            </Button>
                        }
                    >
                        Nothing matches your search. Try different words or clear the
                        filters.
                    </EmptyState>
                </div>
            )}

            {/* pagination */}
            {totalPages > 1 && (
                <nav
                    aria-label="Pagination"
                    className="mt-10 flex items-center justify-center gap-2"
                >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                        <Link
                            key={n}
                            href={hrefWith({ page: n === 1 ? "" : String(n) })}
                            aria-current={n === current ? "page" : undefined}
                            className={`grid h-11 min-w-11 place-items-center rounded-button border px-3 text-sm font-medium transition ${n === current
                                ? "border-primary bg-primary text-background"
                                : "border-border text-muted hover:border-primary hover:text-foreground"
                                }`}
                        >
                            {n}
                        </Link>
                    ))}
                </nav>
            )}
        </div>
    );
}