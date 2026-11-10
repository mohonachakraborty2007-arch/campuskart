import AdminReports from "@/components/sections/AdminReportsView";

export const metadata = { title: "Reports | CampusKart admin" };

export default function AdminReportsPage() {
    return (
        <div className="mx-auto max-w-[800px] px-4 py-10 md:px-6">
            <AdminReports />
        </div>
    );
}