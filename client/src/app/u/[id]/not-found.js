import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export default function SellerNotFound() {
    return (
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-6">
            <EmptyState
                title="Seller not found"
                action={<Button href="/listings">Browse listings</Button>}
            >
                This profile does not exist or was removed.
            </EmptyState>
        </div>
    );
}