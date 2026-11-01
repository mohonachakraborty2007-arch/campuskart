import SettingsView from "@/components/sections/SettingsView";

export const metadata = { title: "Settings | CampusKart" };

export default function SettingsPage() {
    return (
        <div className="mx-auto max-w-[720px] px-4 py-10 md:px-6">
            <h1 className="text-3xl font-bold md:text-4xl">Settings</h1>
            <p className="mt-2 text-muted">Your profile and how buyers reach you.</p>
            <div className="mt-8">
                <SettingsView />
            </div>
        </div>
    );
}