import StepCard from "@/components/ui/StepCard";

const steps = [
    {
        title: "Post in a minute",
        text: "Add a photo, a price and a short description. Listing is free.",
    },
    {
        title: "Chat with the buyer",
        text: "Students message you in the app. No phone numbers needed.",
    },
    {
        title: "Meet on campus",
        text: "Pick a public spot like the library or main gate, then hand it over.",
    },
];

export default function HowItWorks() {
    return (
        <section className="border-t border-border">
            <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-6">
                <h2 className="text-2xl font-bold md:text-3xl">How it works</h2>
                <p className="mt-2 text-muted">Three steps from clutter to cash.</p>

                <div className="mt-8 grid gap-5 md:grid-cols-3">
                    {steps.map((step, i) => (
                        <StepCard key={step.title} number={i + 1} title={step.title}>
                            {step.text}
                        </StepCard>
                    ))}
                </div>
            </div>
        </section>
    );
}