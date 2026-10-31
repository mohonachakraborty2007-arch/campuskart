import Button from "@/components/ui/Button";
import HeroCards from "@/components/sections/HeroCards";

const facts = [
    "Students only",
    "Meet on campus",
    "Free to list",
];

export default function Hero() {
    return (
        <section className="relative isolate overflow-hidden border-b border-border">
            {/* faint dot grid, fades out toward the bottom */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10"
                style={{
                    backgroundImage:
                        "radial-gradient(rgba(244,245,250,0.09) 1px, transparent 1px)",
                    backgroundSize: "26px 26px",
                    maskImage:
                        "linear-gradient(to bottom, black 40%, transparent 100%)",
                    WebkitMaskImage:
                        "linear-gradient(to bottom, black 40%, transparent 100%)",
                }}
            />
            {/* one-colour violet glow */}
            <div
                aria-hidden="true"
                className="absolute -top-40 right-[-10%] -z-10 h-[520px] w-[520px] rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(124,92,255,0.28) 0%, rgba(124,92,255,0) 65%)",
                }}
            />

            <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-20 md:px-6 md:py-28 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                    <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm text-muted">
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

                    <p className="mt-6 max-w-xl text-lg text-muted">
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

                    <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
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