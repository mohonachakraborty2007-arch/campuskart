"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSaved } from "@/components/providers/SavedProvider";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { api } from "@/lib/api";

const reasons = [
    { value: "spam", label: "Spam or fake listing" },
    { value: "prohibited", label: "Prohibited item" },
    { value: "misleading", label: "Wrong price or misleading" },
    { value: "other", label: "Something else" },
];

export default function ListingActions({ listing }) {
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { isSaved, toggle } = useSaved();
    const saved = isSaved(listing.id);
    const sold = listing.status === "sold";

    const [contactOpen, setContactOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [contactError, setContactError] = useState("");
    const [sentInfo, setSentInfo] = useState(null); // { whatsapp } once sent

    const [reportOpen, setReportOpen] = useState(false);
    const [reportSent, setReportSent] = useState(false);

    function openContact() {
        if (!user) {
            router.push(`/login?next=${encodeURIComponent(pathname)}`);
            return;
        }
        setContactOpen(true);
    }

    function closeContact() {
        setContactOpen(false);
        setSentInfo(null);
        setContactError("");
    }

    function closeReport() {
        setReportOpen(false);
        setReportSent(false);
    }

    async function sendMessage(e) {
        e.preventDefault();
        const message = String(new FormData(e.currentTarget).get("message") ?? "").trim();
        setSending(true);
        setContactError("");
        try {
            const data = await api(`/listings/${listing.id}/inquiries`, {
                method: "POST",
                body: { message },
            });
            setSentInfo({ whatsapp: data.contact?.whatsapp ?? null });
        } catch (err) {
            setContactError(err.fields?.message || err.message);
        } finally {
            setSending(false);
        }
    }

    return (
        <>
            <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" disabled={sold} onClick={openContact}>
                    {sold ? "Sold" : "Contact seller"}
                </Button>
                <Button
                    size="lg"
                    variant="secondary"
                    aria-pressed={saved}
                    onClick={() => toggle(listing.id)}
                >
                    {saved ? "Saved" : "Save"}
                </Button>
                <Button size="lg" variant="ghost" onClick={() => setReportOpen(true)}>
                    Report
                </Button>
            </div>

            <Modal
                open={contactOpen}
                onClose={closeContact}
                title={`Message ${listing.seller.name}`}
            >
                {sentInfo ? (
                    <div>
                        <p className="text-muted">
                            Message sent. {listing.seller.name} will see it in their inbox.
                        </p>
                        {sentInfo.whatsapp && (
                            <p className="mt-4">
                                {listing.seller.name} also shares WhatsApp:{" "}
                                <a
                                    href={`https://wa.me/${sentInfo.whatsapp.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-accent underline-offset-4 hover:underline"
                                >
                                    {sentInfo.whatsapp}
                                </a>
                            </p>
                        )}
                        <Button className="mt-5" onClick={closeContact}>
                            Done
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={sendMessage} className="space-y-4">
                        <Textarea
                            label="Your message"
                            name="message"
                            required
                            maxLength={500}
                            defaultValue={`Hi, is "${listing.title}" still available?`}
                            hint="Say how the seller can reach you, and suggest a public spot on campus."
                        />
                        {contactError && (
                            <Alert tone="error" title="Message not sent.">
                                {contactError}
                            </Alert>
                        )}
                        <div className="flex gap-3">
                            <Button type="submit" loading={sending}>
                                Send message
                            </Button>
                            <Button type="button" variant="ghost" onClick={closeContact}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal open={reportOpen} onClose={closeReport} title="Report this listing">
                {reportSent ? (
                    <div>
                        <p className="text-muted">
                            Thanks. We will review this listing. (Demo only: reports are
                            stored once the backend exists.)
                        </p>
                        <Button className="mt-5" onClick={closeReport}>
                            Done
                        </Button>
                    </div>
                ) : (
                    <form
                        className="space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            setReportSent(true);
                        }}
                    >
                        <Select label="Reason" name="reason" options={reasons} />
                        <Textarea
                            label="Details (optional)"
                            name="details"
                            placeholder="Tell us what looks wrong"
                        />
                        <div className="flex gap-3">
                            <Button type="submit">Send report</Button>
                            <Button type="button" variant="ghost" onClick={closeReport}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </>
    );
}