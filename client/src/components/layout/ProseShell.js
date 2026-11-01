export default function ProseShell({ title, intro, updated, children }) {
    return (
        <div className="mx-auto max-w-[760px] px-4 py-12 md:px-6 md:py-16">
            <h1 className="text-4xl font-bold md:text-5xl">{title}</h1>
            {intro && <p className="mt-4 text-lg text-muted">{intro}</p>}
            {updated && (
                <p className="mt-2 text-sm text-muted">Last updated: {updated}</p>
            )}
            <div className="mt-10 space-y-10">{children}</div>
        </div>
    );
}

export function Section({ title, children }) {
    return (
        <section>
            <h2 className="text-2xl font-bold">{title}</h2>
            <div className="mt-3 space-y-3 text-muted">{children}</div>
        </section>
    );
}

export function List({ items }) {
    return (
        <ul className="space-y-2">
            {items.map((item) => (
                <li key={item} className="flex gap-3">
                    <span
                        aria-hidden="true"
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}