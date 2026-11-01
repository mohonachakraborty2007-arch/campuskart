import { sampleListings } from "@/lib/sampleListings";

export default function LatestTicker() {
    const row = (key) => (
        <ul
            key={key}
            className="flex shrink-0 items-center gap-4 pr-4"
        >
            {sampleListings.map((l) => (
                <li
                    key={l.id}
                    className="flex items-center gap-3 whitespace-nowrap rounded-full border border-border bg-surface px-4 py-2 text-sm"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-pop" />
                    <span className="font-heading font-bold">
                        ₹{l.price.toLocaleString("en-IN")}
                    </span>
                    <span>{l.title}</span>
                    <span className="text-muted">{l.postedAgo}</span>
                </li>
            ))}
        </ul>
    );

    return (
        <div
            aria-hidden="true"
            className="overflow-hidden border-b border-border py-4"
            style={{
                maskImage:
                    "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            }}
        >
            <div className="marquee-track flex w-max">
                {row("a")}
                {row("b")}
            </div>
        </div>
    );
}