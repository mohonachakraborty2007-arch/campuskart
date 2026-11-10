import Link from "next/link";
import { allCategories } from "@/lib/categories";

const blurbs = {
    books: "Textbooks and novels",
    electronics: "Calculators, laptops, gadgets",
    cycles: "Rides for getting around campus",
    notes: "Handwritten and printed notes",
    hostel: "Room and mess essentials",
    clothing: "Hoodies, lab coats, more",
    stationery: "Lab and drawing supplies",
    other: "Everything else",
};

const icons = {
    books: (
        <>
            <path d="M5 4h10a2 2 0 012 2v14H7a2 2 0 01-2-2V4z" />
            <path d="M9 8h4" />
        </>
    ),
    electronics: (
        <>
            <rect x="4" y="5" width="16" height="11" rx="2" />
            <path d="M2 19h20" />
        </>
    ),
    cycles: (
        <>
            <circle cx="6" cy="16" r="3.5" />
            <circle cx="18" cy="16" r="3.5" />
            <path d="M6 16l4-8h5l3 8M10 8H8" />
        </>
    ),
    notes: (
        <>
            <path d="M7 3h8l4 4v14H7z" />
            <path d="M15 3v4h4M10 12h6M10 16h6" />
        </>
    ),
    hostel: (
        <>
            <path d="M9 3h6l2 8H7z" />
            <path d="M12 11v8M8 21h8" />
        </>
    ),
    clothing: <path d="M8 3L3 7l3 3 2-1v11h8V9l2 1 3-3-5-4a4 4 0 01-8 0z" />,
    stationery: (
        <>
            <path d="M4 20l1-4L16 5l3 3L8 19z" />
            <path d="M14 7l3 3" />
        </>
    ),
    other: (
        <>
            <circle cx="6" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="18" cy="12" r="1.5" />
        </>
    ),
};

export default function CategoryStrip() {
    return (
        <section className="mx-auto max-w-[1200px] px-4 pt-16 md:px-6">
            <h2 className="text-2xl font-bold md:text-3xl">Browse by category</h2>
            <p className="mt-2 text-muted">Start with what you need this semester.</p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {allCategories.map((cat) => (
                    <Link
                        key={cat.slug}
                        href={`/listings?category=${cat.slug}`}
                        className="group flex flex-col gap-4 rounded-card border border-border bg-surface p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_12px_40px_-12px_rgba(124,92,255,0.45)]"
                    >
                        <span className="grid h-12 w-12 place-items-center rounded-full border border-border bg-surface-2 transition group-hover:border-primary/60">
                            <svg
                                viewBox="0 0 24 24"
                                className="h-6 w-6 fill-none stroke-accent"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                {icons[cat.slug]}
                            </svg>
                        </span>
                        <span>
                            <span className="block font-heading text-lg font-bold">
                                {cat.label}
                            </span>
                            <span className="text-sm text-muted">{blurbs[cat.slug]}</span>
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}