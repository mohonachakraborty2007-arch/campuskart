import Button from "@/components/ui/Button";
import HeroCards from "@/components/sections/HeroCards";
import KineticGrid from "@/components/ui/KineticGrid";

const facts = ["Students only", "Meet on campus", "Free to list"];

export default function Hero() {
    return (
        <KineticGrid className="border-b border-border">
            {/* drifting violet orbs (behind the interactive grid) */}
            <div
                aria-hidden="true"
                className="orb-a absolute -top-32 right-[-8%] -z-20 h-[620px] w-[620px] rounded-full bg-primary/40 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="orb-b absolute bottom-[-200px] left-[-10%] -z-20 h-[520px] w-[520px] rounded-full bg-primary/30 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="orb-c absolute left-[35%] top-[8%] -z-20 h-[360px] w-[360px] rounded-full bg-primary/20 blur-3xl"
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
        </KineticGrid>
    );
}