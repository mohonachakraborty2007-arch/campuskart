import SettingsView from "@/components/sections/SettingsView";

export const metadata = { title: "Settings | CampusKart" };

export default function SettingsPage() {
    return (
        <div className="mx-auto max-w-[640px] px-4 py-10 md:px-6">
            <SettingsView />
        </div>
    );
}