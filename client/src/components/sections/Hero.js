import Button from "@/components/ui/Button";
import HeroCards from "@/components/sections/HeroCards";

const facts = ["Students only", "Meet on campus", "Free to list"];

// How dark the layer on top of the video is (0 to 1). Raise it if text is hard to read.
const OVERLAY = 0.55;

export default function Hero() {
    return (
        <section className="relative isolate overflow-hidden border-b border-border">
            {/* animated video background, hidden for people who prefer reduced motion */}
            <video
                aria-hidden="true"
                className="absolute inset-0 -z-30 h-full w-full object-cover motion-reduce:hidden"
                src="/hero-bg.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
            />

            {/* dark layer so the text always stays readable */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-20 bg-background"
                style={{ opacity: OVERLAY }}
            />

            {/* stronger one-colour violet glows */}
            <div
                aria-hidden="true"
                className="absolute -top-40 right-[-10%] -z-10 h-[640px] w-[640px] rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(124,92,255,0.5) 0%, rgba(124,92,255,0) 65%)",
                }}
            />
            <div
                aria-hidden="true"
                className="absolute -bottom-48 left-[-10%] -z-10 h-[560px] w-[560px] rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(124,92,255,0.32) 0%, rgba(124,92,255,0) 65%)",
                }}
            />

            {/* fade into the page background at the bottom */}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 -z-10 h-32"
                style={{
                    background: "linear-gradient(to bottom, transparent, var(--background))",
                }}
            />

            <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-20 md:px-6 md:py-28 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                    <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-sm text-muted backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-pop" />
                        Student-only marketplace
                    </p>

                    <h1 className="mt-6 text-balance text-5xl font-bold leading-[1.05] md:text-6xl lg:text-7xl">
                        Buy, sell and trade on{" "}
                        <span className="relative inline-block">
                            campus
                            <span
                                aria-hidden="true"
                                className="absolute -bottom-1 left-0 h-[6px] w-full rounded-full bg-pop"
                            />
                        </span>
                        .
                    </h1>

                    <p className="mt-6 max-w-xl text-lg text-foreground/80">
                        Used books, cycles, notes and electronics from students you can
                        actually meet. No shipping, no strangers, no scams.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Button size="lg" href="/listings">
                            Browse items
                        </Button>
                        <Button size="lg" variant="secondary" href="/sell">
                            Sell something
                        </Button>
                    </div>

                    <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/80">
                        {facts.map((fact) => (
                            <li key={fact} className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                                {fact}
                            </li>
                        ))}
                    </ul>
                </div>

                <HeroCards />
            </div>
        </section>
    );
}