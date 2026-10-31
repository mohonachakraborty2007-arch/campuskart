import Button from "@/components/ui/Button";
import ListingCard from "@/components/ui/ListingCard";
import { sampleListings } from "@/lib/sampleListings";

export default function FreshListings() {
    return (
        <section className="mx-auto max-w-[1200px] px-4 py-14 md:px-6">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold md:text-3xl">Fresh on campus</h2>
                    <p className="mt-2 text-muted">Posted by students in the last few days.</p>
                </div>
                <Button variant="secondary" href="/listings">
                    View all
                </Button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {sampleListings.slice(0, 8).map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>
        </section>
    );
}