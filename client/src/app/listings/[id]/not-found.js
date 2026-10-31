import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export default function ListingNotFound() {
    return (
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-6">
            <EmptyState
                title="This listing is gone"
                action={<Button href="/listings">Browse other items</Button>}
            >
                It may have been sold or removed by the seller.
            </EmptyState>
        </div>
    );
}