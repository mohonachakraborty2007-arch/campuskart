"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { useSaved } from "@/components/providers/SavedProvider";

const reasons = [
    { value: "spam", label: "Spam or fake listing" },
    { value: "prohibited", label: "Prohibited item" },
    { value: "misleading", label: "Wrong price or misleading" },
    { value: "other", label: "Something else" },
];

export default function ListingActions({ listing }) {
    const { isSaved, toggle } = useSaved();
    const saved = isSaved(listing.id);
    const sold = listing.status === "sold";
    const [contactOpen, setContactOpen] = useState(false);
    const [contactSent, setContactSent] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const [reportSent, setReportSent] = useState(false);

    function closeContact() {
        setContactOpen(false);
        setContactSent(false);
    }
    function closeReport() {
        setReportOpen(false);
        setReportSent(false);
    }

    return (
        <>
            <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" disabled={sold} onClick={() => setContactOpen(true)}>
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
                {contactSent ? (
                    <div>
                        <p className="text-muted">
                            Message sent. {listing.seller.name} will reply in the app. (Demo
                            only: real chat arrives with the backend.)
                        </p>
                        <Button className="mt-5" onClick={closeContact}>
                            Done
                        </Button>
                    </div>
                ) : (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setContactSent(true);
                        }}
                    >
                        <Textarea
                            label="Your message"
                            name="message"
                            required
                            defaultValue={`Hi, is "${listing.title}" still available?`}
                            hint="Suggest a pickup time at a public spot on campus."
                        />
                        <div className="mt-5 flex gap-3">
                            <Button type="submit">Send message</Button>
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