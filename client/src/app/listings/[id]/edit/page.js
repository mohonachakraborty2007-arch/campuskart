import EditListing from "@/components/sections/EditListing";

export const metadata = { title: "Edit listing | CampusKart" };

export default async function EditListingPage({ params }) {
    const { id } = await params;

    return (
        <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
            <h1 className="text-3xl font-bold md:text-4xl">Edit listing</h1>
            <p className="mt-2 text-muted">
                Change the details, remove photos or add new ones, then save.
            </p>
            <div className="mt-8">
                <EditListing id={id} />
            </div>
        </div>
    );
}