// Asks Cloudinary for a smaller, auto-format, auto-quality version of an image.
// Non-Cloudinary URLs (like demo images) are returned unchanged.
export function resized(url, width) {
    if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
        return url;
    }
    if (url.includes(`/upload/f_auto`)) return url; // already transformed
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}