"use client";

import { useRef } from "react";
import ListingCard from "@/components/ui/ListingCard";
import { sampleListings } from "@/lib/sampleListings";

const pick = (id) => sampleListings.find((l) => l.id === id);

export default function HeroCards() {
    const ref = useRef(null);

    function setTilt(x, y) {
        const el = ref.current;
        if (!el) return;
        el.style.setProperty("--tilt-x", `${x}deg`);
        el.style.setProperty("--tilt-y", `${y}deg`);
    }

    // tilt toward the mouse: desktop mouse only, never with "reduce motion"
    function handleMove(e) {
        if (e.pointerType !== "mouse") return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const box = ref.current.getBoundingClientRect();
        const px = (e.clientX - box.left) / box.width - 0.5;
        const py = (e.clientY - box.top) / box.height - 0.5;
        setTilt((-py * 8).toFixed(2), (px * 10).toFixed(2));
    }

    return (
        <div
            ref={ref}
            onPointerMove={handleMove}
            onPointerLeave={() => setTilt(0, 0)}
            aria-hidden="true"
            className="relative hidden h-[580px] lg:block"
        >
            {/* "inert" = decoration only: no links, no focus, no clicking */}
            <div className="float-a tilt absolute left-0 top-0 w-56 -rotate-6">
                <div inert>
                    <ListingCard listing={pick("l2")} />
                </div>
            </div>
            <div className="float-b tilt absolute right-0 top-24 w-56 rotate-[5deg]">
                <div inert>
                    <ListingCard listing={pick("l3")} />
                </div>
            </div>
            <div className="float-c tilt absolute left-10 top-[290px] w-56 -rotate-2">
                <div inert>
                    <ListingCard listing={pick("l1")} />
                </div>
            </div>
        </div>
    );
}