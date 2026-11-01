import FinalCta from "@/components/sections/FinalCta";
import HowItWorks from "@/components/sections/HowItWorks";
import {
    HandoffStrip,
    InfoCard,
    Marquee,
} from "@/components/sections/AboutParts";
import KineticGrid from "@/components/ui/KineticGrid";
import Reveal from "@/components/ui/Reveal";
import { CONTACT_EMAIL } from "@/lib/config";

export const metadata = { title: "About | CampusKart" };

// Edit this block to change the "built by" card.
const builder = {
    name: "Mohona Chakraborty",
    line: "First-year B.Tech CSE (AI-ML) student at Sister Nivedita University, building CampusKart as a solo project.",
};

const tips = [
    "Meet in a public, busy spot on campus such as the library or main gate, and in daylight.",
    "Bring a friend if the item is expensive.",
    "Check the item properly before you pay.",
    "Pay at hand-over with cash or UPI. Never pay in advance.",
    "Report anything that feels off, and leave if you are uncomfortable.",
];

export default function AboutPage() {
    return (
        <>
            {/* hero */}
            <KineticGrid>
                <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-[-180px] -z-20 h-[520px] w-[720px] -translate-x-1/2 rounded-full"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(124,92,255,0.28) 0%, rgba(124,92,255,0) 65%)",
                    }}
                />

                <div className="mx-auto max-w-[900px] px-4 pb-16 pt-16 text-center md:px-6 md:pt-24">
                    <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm text-muted">
                        <span className="h-2 w-2 rounded-full bg-pop" />
                        About CampusKart
                    </p>
                    <h1 className="mt-6 text-balance text-5xl font-bold leading-[1.05] md:text-7xl">
                        Made for campus, by a{" "}
                        <span className="relative inline-block">
                            student
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 200 14"
                                preserveAspectRatio="none"
                                fill="none"
                                className="absolute -bottom-3 left-0 h-3 w-full"
                            >
                                <path
                                    className="squiggle-draw stroke-pop"
                                    d="M2 8 Q 14 2 26 8 T 50 8 T 74 8 T 98 8 T 122 8 T 146 8 T 170 8 T 198 8"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    pathLength="1"
                                    vectorEffect="non-scaling-stroke"
                                />
                            </svg>
                        </span>
                        .
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
                        Every semester, books, cycles and gadgets pile up in hostel rooms
                        while someone two blocks away is paying full price for the same
                        thing. CampusKart connects the two.
                    </p>
                    <HandoffStrip />
                </div>
            </KineticGrid>

            <Marquee />

            {/* problem and fix */}
            <section className="mx-auto max-w-[1000px] px-4 py-20 md:px-6">
                <Reveal>
                    <h2 className="text-3xl font-bold md:text-4xl">Why it exists</h2>
                </Reveal>
                <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <Reveal className="h-full">
                        <InfoCard label="The problem" title="Listings get buried">
                            Group chats and notice boards bury posts in a day, and public
                            marketplaces mean strangers, shipping and scams.
                        </InfoCard>
                    </Reveal>
                    <Reveal delay={120} className="h-full">
                        <InfoCard label="The fix" title="A marketplace just for campus">
                            Everyone signs up with a college email, items are local, and
                            hand-overs happen on campus. Free to list and free to buy.
                        </InfoCard>
                    </Reveal>
                </div>
            </section>

            <HowItWorks />

            {/* safety */}
            <section className="mx-auto max-w-[1000px] px-4 py-20 md:px-6">
                <Reveal>
                    <h2 className="text-3xl font-bold md:text-4xl">
                        Safety tips for meeting up
                    </h2>
                    <p className="mt-3 text-muted">
                        Five habits that keep every hand-over smooth.
                    </p>
                </Reveal>
                <ol className="mt-8 grid gap-4 sm:grid-cols-2">
                    {tips.map((tip, i) => (
                        <li
                            key={tip}
                            className={i === tips.length - 1 ? "sm:col-span-2" : ""}
                        >
                            <Reveal delay={i * 90} className="h-full">
                                <div className="flex h-full gap-4 rounded-card border border-border bg-surface p-5 transition duration-200 hover:border-primary/60">
                                    <span
                                        aria-hidden="true"
                                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface-2 font-heading font-bold text-accent"
                                    >
                                        {i + 1}
                                    </span>
                                    <span>{tip}</span>
                                </div>
                            </Reveal>
                        </li>
                    ))}
                </ol>
            </section>

            {/* builder */}
            <section className="mx-auto max-w-[1000px] px-4 pb-16 md:px-6">
                <Reveal>
                    <h2 className="text-3xl font-bold md:text-4xl">Who built it</h2>
                    <div className="mt-8 flex flex-col gap-5 rounded-card border border-border bg-surface p-6 sm:flex-row sm:items-center">
                        <span
                            aria-hidden="true"
                            className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary font-heading text-2xl font-bold text-background"
                        >
                            {builder.name[0]}
                        </span>
                        <div>
                            <p className="text-lg font-bold">{builder.name}</p>
                            <p className="mt-1 text-muted">{builder.line}</p>
                            <p className="mt-3 text-sm">
                                Questions or feedback?{" "}
                                <a
                                    href={`mailto:${CONTACT_EMAIL}`}
                                    className="text-accent underline-offset-4 hover:underline"
                                >
                                    {CONTACT_EMAIL}
                                </a>
                            </p>
                        </div>
                    </div>
                </Reveal>
            </section>

            <FinalCta />
        </>
    );
}