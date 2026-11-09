import ListingDetail from "@/components/sections/ListingDetail";

export const metadata = { title: "Listing | CampusKart" };

export default async function ListingDetailPage({ params }) {
    const { id } = await params;

    return (
        <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
            <ListingDetail id={id} />
        </div>
    );
}