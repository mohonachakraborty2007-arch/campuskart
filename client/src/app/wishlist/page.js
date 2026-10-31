import WishlistView from "@/components/sections/WishlistView";

export const metadata = { title: "Saved items | CampusKart" };

export default function WishlistPage() {
    return (
        <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
            <WishlistView />
        </div>
    );
}