import Link from "next/link";
import { notFound } from "next/navigation";
import Badge from "@/components/ui/Badge";
import ImageGallery from "@/components/ui/ImageGallery";
import ListingCard from "@/components/ui/ListingCard";
import ListingActions from "@/components/sections/ListingActions";
import { categories, getListing, sampleListings } from "@/lib/sampleListings";

const tones = { "Like new": "success", Good: "accent", Fair: "warning" };

export async function generateMetadata({ params }) {
    const { id } = await params;
    const listing = getListing(id);
    return {
        title: listing
            ? `${listing.title} | CampusKart`
            : "Listing not found | CampusKart",
    };
}

export default async function ListingDetailPage({ params }) {
    const { id } = await params;
    const listing = getListing(id);
    if (!listing) notFound();

    const categoryLabel =
        categories.find((c) => c.slug === listing.category)?.label ??
        listing.category;

    const moreFromSeller = sampleListings
        .filter((l) => l.id !== listing.id)
        .map((l) => getListing(l.id))
        .filter((l) => l && l.sellerId === listing.sellerId);

    const seller = listing.seller;

    return (
        <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
            <Link
                href="/listings"
                className="text-sm text-muted transition hover:text-foreground"
            >
                ← Back to listings
            </Link>

            <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
                <ImageGallery title={listing.title} count={listing.photos} />

                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={tones[listing.condition] ?? "neutral"}>
                            {listing.condition}
                        </Badge>
                        <Badge>{categoryLabel}</Badge>
                    </div>

                    <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                        {listing.title}
                    </h1>

                    <p className="mt-5 inline-block rounded-full bg-surface-2 px-5 py-2 font-heading text-3xl font-bold">
                        ₹{listing.price.toLocaleString("en-IN")}
                    </p>

                    <p className="mt-6 text-muted">{listing.description}</p>

                    <dl className="mt-6 divide-y divide-border rounded-card border border-border bg-surface">
                        <div className="flex justify-between gap-4 px-5 py-4">
                            <dt className="text-muted">Pickup spot</dt>
                            <dd className="text-right font-medium">{listing.pickup}</dd>
                        </div>
                        <div className="flex justify-between gap-4 px-5 py-4">
                            <dt className="text-muted">Payment</dt>
                            <dd className="text-right font-medium">{listing.exchange}</dd>
                        </div>
                        <div className="flex justify-between gap-4 px-5 py-4">
                            <dt className="text-muted">Location</dt>
                            <dd className="text-right font-medium">
                                {listing.location} · {listing.postedAgo}
                            </dd>
                        </div>
                    </dl>

                    {/* seller card */}
                    <div className="mt-6 flex items-center gap-4 rounded-card border border-border bg-surface p-5">
                        <span
                            aria-hidden="true"
                            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface-2 font-heading text-lg font-bold"
                        >
                            {seller.name[0]}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold">{seller.name}</p>
                            <p className="text-sm text-muted">
                                {seller.department} · Member since {seller.memberSince}
                            </p>
                            {seller.verified && (
                                <Badge tone="success" className="mt-2">
                                    Verified student
                                </Badge>
                            )}
                        </div>
                        <Link
                            href={`/u/${seller.id}`}
                            className="text-sm text-accent underline-offset-4 hover:underline"
                        >
                            View profile
                        </Link>
                    </div>

                    <ListingActions listing={listing} />
                </div>
            </div>

            {moreFromSeller.length > 0 && (
                <section className="mt-16">
                    <h2 className="text-2xl font-bold">More from {seller.name}</h2>
                    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {moreFromSeller.map((l) => (
                            <ListingCard key={l.id} listing={l} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}