import ProseShell from "@/components/layout/ProseShell";
import ContactForm from "@/components/sections/ContactForm";
import { CONTACT_EMAIL } from "@/lib/config";

export const metadata = { title: "Contact | CampusKart" };

export default function ContactPage() {
    return (
        <ProseShell
            title="Contact"
            intro="Questions, bugs, ideas or something to report? Write to us."
        >
            <ContactForm />
            <p className="text-muted">
                Prefer email? Write to{" "}
                <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-accent underline-offset-4 hover:underline"
                >
                    {CONTACT_EMAIL}
                </a>
                .
            </p>
        </ProseShell>
    );
}