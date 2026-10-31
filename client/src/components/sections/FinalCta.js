import Button from "@/components/ui/Button";

export default function FinalCta() {
    return (
        <section className="mx-auto max-w-[1200px] px-4 pb-20 md:px-6">
            <div className="relative isolate overflow-hidden rounded-card border border-border bg-surface px-6 py-14 text-center md:px-12">
                <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-[-120px] -z-10 h-[320px] w-[520px] -translate-x-1/2 rounded-full"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(124,92,255,0.22) 0%, rgba(124,92,255,0) 70%)",
                    }}
                />
                <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold md:text-4xl">
                    Got something you no longer need?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-muted">
                    Someone on your campus is looking for it right now. Post it in a
                    minute and keep the money.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Button size="lg" href="/sell">
                        Sell something
                    </Button>
                    <Button size="lg" variant="secondary" href="/listings">
                        Browse items
                    </Button>
                </div>
            </div>
        </section>
    );
}