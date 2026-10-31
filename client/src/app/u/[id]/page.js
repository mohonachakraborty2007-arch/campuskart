import { notFound } from "next/navigation";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ListingCard from "@/components/ui/ListingCard";
import Tabs from "@/components/ui/Tabs";
import { getSeller, getSellerListings } from "@/lib/sampleListings";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const seller = getSeller(id);
    return {
        title: seller
            ? `${seller.name} | CampusKart`
            : "Seller not found | CampusKart",
    };
}

function Grid({ items, emptyTitle, emptyText }) {
    if (items.length === 0) {
        return <EmptyState title={emptyTitle}>{emptyText}</EmptyState>;
    }
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((l) => (
                <ListingCard key={l.id} listing={l} />
            ))}
        </div>
    );
}

export default async function SellerProfilePage({ params }) {
    const { id } = await params;
    const seller = getSeller(id);
    if (!seller) notFound();

    const { active, sold } = getSellerListings(id);

    const tabs = [
        {
            id: "active",
            label: "Active",
            count: active.length,
            content: (
                <Grid
                    items={active}
                    emptyTitle="No active listings"
                    emptyText="This seller has nothing for sale right now."
                />
            ),
        },
        {
            id: "sold",
            label: "Sold",
            count: sold.length,
            content: (
                <Grid
                    items={sold}
                    emptyTitle="Nothing sold yet"
                    emptyText="Sold items will show up here."
                />
            ),
        },
    ];

    return (
        <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
            <header className="flex flex-col gap-6 rounded-card border border-border bg-surface p-6 sm:flex-row sm:items-center">
                <span
                    aria-hidden="true"
                    className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-surface-2 font-heading text-3xl font-bold"
                >
                    {seller.name[0]}
                </span>

                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold md:text-3xl">{seller.name}</h1>
                    <p className="mt-1 text-muted">
                        {seller.department} · Member since {seller.memberSince}
                    </p>
                    {seller.verified && (
                        <Badge tone="success" className="mt-3">
                            Verified student
                        </Badge>
                    )}
                </div>

                <p className="rounded-full bg-surface-2 px-5 py-2 font-heading text-lg font-bold">
                    Sold {sold.length} {sold.length === 1 ? "item" : "items"}
                </p>
            </header>

            <div className="mt-10">
                <Tabs tabs={tabs} />
            </div>
        </div>
    );
}