import ListingCard from "@/components/ui/ListingCard";
import { sampleListings } from "@/lib/sampleListings";

const pick = (id) => sampleListings.find((l) => l.id === id);

export default function HeroCards() {
    return (
        <div className="relative hidden h-[580px] lg:block">
            <div className="float-a absolute left-0 top-0 w-56 -rotate-6">
                <ListingCard listing={pick("l2")} />
            </div>
            <div className="float-b absolute right-0 top-24 w-56 rotate-[5deg]">
                <ListingCard listing={pick("l3")} />
            </div>
            <div className="float-c absolute left-10 top-[290px] w-56 -rotate-2">
                <ListingCard listing={pick("l1")} />
            </div>
        </div>
    );
}