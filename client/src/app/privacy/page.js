import ProseShell, { List, Section } from "@/components/layout/ProseShell";

export const metadata = { title: "Privacy | CampusKart" };

export default function PrivacyPage() {
    return (
        <ProseShell
            title="Privacy"
            intro="What CampusKart collects, why, and who can see it, in plain language."
            updated="1 November 2026"
        >
            <Section title="What we collect">
                <List
                    items={[
                        "Your name and college email address, to create your account and confirm you are a student.",
                        "Your department and year, if you choose to add them.",
                        "Your WhatsApp number, only if you switch on sharing in Settings.",
                        "The listings you post: title, description, price and photos.",
                        "Messages sent to you about your listings, and reports you file.",
                    ]}
                />
            </Section>

            <Section title="Who can see what">
                <List
                    items={[
                        "Everyone can see your name, department, year, verified badge and your active and sold listings.",
                        "Your email address and password are never shown to other users.",
                        "Your WhatsApp number is hidden unless you opt in.",
                    ]}
                />
            </Section>

            <Section title="How we use it">
                <p>
                    To run the marketplace, let buyers reach you, keep the community
                    safe and fix problems. We do not sell your data and we do not show
                    advertising.
                </p>
            </Section>

            <Section title="Where it is stored">
                <p>
                    Account and listing data is stored in a managed database, and photos
                    are stored with an image hosting service. We use a single login
                    cookie to keep you signed in.
                </p>
            </Section>

            <Section title="Your choices">
                <List
                    items={[
                        "Edit your profile and contact preference any time in Settings.",
                        "Remove any listing, or mark it as sold, from My listings.",
                        "Ask us to delete your account from the Contact page.",
                    ]}
                />
            </Section>

            <p className="text-sm text-muted">
                This is a plain-language draft written for a student project. Have it
                reviewed before running CampusKart for real users.
            </p>
        </ProseShell>
    );
}