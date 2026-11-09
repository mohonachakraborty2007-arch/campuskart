import SellerProfile from "@/components/sections/SellerProfile";

export const metadata = { title: "Seller profile | CampusKart" };

export default async function SellerProfilePage({ params }) {
    const { id } = await params;

    return (
        <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
            <SellerProfile id={id} />
        </div>
    );
}