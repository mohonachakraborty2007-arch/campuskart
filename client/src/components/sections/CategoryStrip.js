import CategoryChip from "@/components/ui/CategoryChip";
import { categories, sampleListings } from "@/lib/sampleListings";

export default function CategoryStrip() {
    return (
        <section className="mx-auto max-w-[1200px] px-4 pt-14 md:px-6">
            <h2 className="text-2xl font-bold md:text-3xl">Browse by category</h2>
            <div className="mt-6 flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <CategoryChip
                        key={cat.slug}
                        label={cat.label}
                        count={
                            sampleListings.filter((l) => l.category === cat.slug).length
                        }
                        href={`/listings?category=${cat.slug}`}
                    />
                ))}
            </div>
        </section>
    );
}