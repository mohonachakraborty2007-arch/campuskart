import { Suspense } from "react";
import BrowseView from "@/components/sections/BrowseView";
import { ListingCardSkeleton } from "@/components/ui/Skeleton";

export const metadata = { title: "Browse listings | CampusKart" };

export default function ListingsPage() {
    return (
        <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
            <h1 className="text-3xl font-bold md:text-4xl">Browse listings</h1>
            <p className="mt-2 text-muted">
                Find what you need from students on your campus.
            </p>

            <div className="mt-8">
                <Suspense
                    fallback={
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <ListingCardSkeleton key={i} />
                            ))}
                        </div>
                    }
                >
                    <BrowseView />
                </Suspense>
            </div>
        </div>
    );
}