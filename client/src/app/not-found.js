import Button from "@/components/ui/Button";

export const metadata = { title: "Page not found | CampusKart" };

export default function NotFound() {
    return (
        <div className="relative isolate overflow-hidden">
            <div
                aria-hidden="true"
                className="absolute left-1/2 top-[-120px] -z-10 h-[460px] w-[640px] -translate-x-1/2 rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(124,92,255,0.3) 0%, rgba(124,92,255,0) 65%)",
                }}
            />

            <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-[700px] flex-col items-center justify-center px-4 py-16 text-center md:px-6">
                <div className="relative">
                    <p
                        aria-hidden="true"
                        className="font-heading text-[7rem] font-bold leading-none text-foreground/90 md:text-[10rem]"
                    >
                        404
                    </p>
                    <span className="float-a absolute -right-6 top-2 rotate-12 rounded-full bg-pop px-3 py-1 text-xs font-bold text-background md:-right-10 md:text-sm">
                        Lost &amp; found
                    </span>
                </div>

                <h1 className="mt-6 text-3xl font-bold md:text-4xl">
                    This page wandered off campus
                </h1>
                <p className="mt-3 max-w-md text-muted">
                    The link may be broken, or the page may have been moved. Let&apos;s
                    get you back to something useful.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button size="lg" href="/">
                        Back to home
                    </Button>
                    <Button size="lg" variant="secondary" href="/listings">
                        Browse items
                    </Button>
                </div>
            </div>
        </div>
    );
}