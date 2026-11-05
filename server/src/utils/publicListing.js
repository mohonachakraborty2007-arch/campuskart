export function toPublicListing(listing) {
    return {
        id: String(listing._id),
        seller: String(listing.seller),
        title: listing.title,
        description: listing.description,
        category: listing.category,
        condition: listing.condition,
        price: listing.price,
        openToExchange: listing.openToExchange,
        exchangeWants: listing.exchangeWants,
        pickupSpot: listing.pickupSpot,
        images: listing.images.map((img) => ({ url: img.url, publicId: img.publicId })),
        status: listing.status,
        soldAt: listing.soldAt || null,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
    };
}