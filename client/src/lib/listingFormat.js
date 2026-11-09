import { conditionLabels } from "@/lib/categories";

export function formatPrice(price) {
    return price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`;
}

export function timeAgo(dateString) {
    const seconds = Math.max(
        0,
        Math.round((Date.now() - new Date(dateString).getTime()) / 1000)
    );
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
    });
}

export function memberSince(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
    });
}

// turns a listing from the API into the shape ListingCard expects
export function toCardListing(l) {
    return {
        id: l.id,
        title: l.title,
        price: l.price,
        priceLabel: formatPrice(l.price),
        condition: conditionLabels[l.condition] ?? l.condition,
        category: l.category,
        location: l.pickupSpot || "On campus",
        postedAgo: timeAgo(l.createdAt),
        image: l.images?.[0]?.url ?? null,
        sold: l.status === "sold",
    };
}