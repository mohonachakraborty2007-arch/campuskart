export default function AuthShell({ title, subtitle, children, footer }) {
    return (
        <div className="relative isolate overflow-hidden">
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10"
                style={{
                    backgroundImage:
                        "radial-gradient(rgba(244,245,250,0.08) 1px, transparent 1px)",
                    backgroundSize: "26px 26px",
                    maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
                    WebkitMaskImage:
                        "linear-gradient(to bottom, black 30%, transparent 100%)",
                }}
            />
            <div
                aria-hidden="true"
                className="absolute left-1/2 top-[-160px] -z-10 h-[460px] w-[640px] -translate-x-1/2 rounded-full"
                style={{
                    background:
                        "radial-gradient(circle, rgba(124,92,255,0.26) 0%, rgba(124,92,255,0) 65%)",
                }}
            />

            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1200px] items-center justify-center px-4 py-12 md:px-6">
                <div className="w-full max-w-[440px]">
                    <div className="rounded-card border border-border bg-surface p-6 sm:p-8">
                        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
                        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
                        <div className="mt-6">{children}</div>
                    </div>
                    {footer && (
                        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
                    )}
                </div>
            </div>
        </div>
    );
}