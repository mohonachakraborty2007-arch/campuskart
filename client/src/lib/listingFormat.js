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