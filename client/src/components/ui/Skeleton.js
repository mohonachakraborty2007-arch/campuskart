export function Skeleton({ className = "" }) {
    return (
        <div
            aria-hidden="true"
            className={`animate-pulse rounded-input bg-surface-2 ${className}`}
        />
    );
}

export function ListingCardSkeleton() {
    return (
        <div
            aria-hidden="true"
            className="overflow-hidden rounded-card border border-border bg-surface"
        >
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className="space-y-3 p-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    );
}