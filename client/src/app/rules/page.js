import ProseShell, { List, Section } from "@/components/layout/ProseShell";

export const metadata = { title: "Posting rules | CampusKart" };

export default function RulesPage() {
    return (
        <ProseShell
            title="Posting rules"
            intro="A few simple rules keep CampusKart useful and safe for everyone on campus."
            updated="1 November 2026"
        >
            <Section title="What you can post">
                <List
                    items={[
                        "Items you own and are allowed to sell: books, notes, electronics, cycles, hostel gear and clothing.",
                        "One item per listing, with a clear title and an honest description.",
                        "Real photos of the actual item, not pictures copied from the internet.",
                        "A fair price. Free items are welcome too.",
                    ]}
                />
            </Section>

            <Section title="What is not allowed">
                <List
                    items={[
                        "Weapons, drugs, alcohol, tobacco and anything illegal.",
                        "Stolen, counterfeit or pirated goods.",
                        "Exam papers, answer keys, or anyone offering to cheat for others.",
                        "Live animals, adult content, or anything unsafe.",
                        "Listings meant to scam, spam or mislead buyers.",
                    ]}
                />
            </Section>

            <Section title="Meeting and paying">
                <List
                    items={[
                        "Meet in a public, busy spot on campus and in daylight.",
                        "Check the item before you pay, and pay at hand-over.",
                        "Never send money in advance to someone you have not met.",
                    ]}
                />
            </Section>

            <Section title="Keeping your listings fresh">
                <List
                    items={[
                        "Mark an item as sold as soon as it is gone.",
                        "Remove listings you no longer want to sell.",
                        "Respond to messages politely, even to say no.",
                    ]}
                />
            </Section>

            <Section title="If something goes wrong">
                <p>
                    Use the Report button on any listing. We review reports and may
                    remove listings or accounts that break these rules.
                </p>
            </Section>
        </ProseShell>
    );
}