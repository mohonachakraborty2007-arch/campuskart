import { notFound } from "next/navigation";
import SellForm from "@/components/sections/SellForm";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { DEMO_OWNER_ID } from "@/lib/config";
import { getListing } from "@/lib/sampleListings";

export const metadata = { title: "Edit listing | CampusKart" };

export default async function EditListingPage({ params }) {
    const { id } = await params;
    const listing = getListing(id);
    if (!listing) notFound();

    if (listing.sellerId !== DEMO_OWNER_ID) {
        return (
            <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-6">
                <EmptyState
                    title="You can only edit your own listings"
                    action={<Button href="/listings">Browse listings</Button>}
                >
                    This listing belongs to someone else.
                </EmptyState>
            </div>
        );
    }

    const initial = {
        title: listing.title,
        category: listing.category,
        condition: listing.condition,
        price: String(listing.price),
        free: listing.price === 0,
        description: listing.description,
        pickup: listing.pickup,
        exchange: listing.exchange.startsWith("Open to exchange"),
    };

    return (
        <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
            <h1 className="text-3xl font-bold md:text-4xl">Edit listing</h1>
            <p className="mt-2 text-muted">
                Your {listing.photos} current photos are kept. Add more below if you
                like.
            </p>
            <div className="mt-8">
                <SellForm
                    mode="edit"
                    initial={initial}
                    existingPhotos={listing.photos}
                />
            </div>
        </div>
    );
}