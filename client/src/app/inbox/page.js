import InboxView from "@/components/sections/InboxView";

export const metadata = { title: "Inbox | CampusKart" };

export default function InboxPage() {
    return (
        <div className="mx-auto max-w-[800px] px-4 py-10 md:px-6">
            <InboxView />
        </div>
    );
}