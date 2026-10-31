import MyListingsView from "@/components/sections/MyListingsView";

export const metadata = { title: "My listings | CampusKart" };

export default function MyListingsPage() {
    return (
        <div className="mx-auto max-w-[960px] px-4 py-10 md:px-6">
            <MyListingsView />
        </div>
    );
}