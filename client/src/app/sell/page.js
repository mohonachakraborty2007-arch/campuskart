import RequireVerified from "@/components/sections/RequireVerified";
import SellForm from "@/components/sections/SellForm";

export const metadata = { title: "Sell something | CampusKart" };

export default function SellPage() {
    return (
        <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
            <h1 className="text-3xl font-bold md:text-4xl">Sell something</h1>
            <p className="mt-2 text-muted">
                Post it in under two minutes. Listing is free.
            </p>
            <div className="mt-8">
                <RequireVerified>
                    <SellForm />
                </RequireVerified>
            </div>
        </div>
    );
}