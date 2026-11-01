import AdminReportsView from "@/components/sections/AdminReportsView";

export const metadata = { title: "Reports | CampusKart" };

export default function AdminReportsPage() {
    return (
        <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-6">
            <AdminReportsView />
        </div>
    );
}