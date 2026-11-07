// Only these fields of a user are ever shown to other people.
// No email, no phone, no password hash.
export function toPublicSeller(user) {
    return {
        id: String(user._id),
        name: user.name,
        department: user.department || null,
        year: user.year || null,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
    };
}

export function toPublicListing(listing) {
    return {
        id: String(listing._id),
        seller: String(listing.seller?._id ?? listing.seller),
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

// For browse and detail pages: the seller is filled in with public fields.
export function toBrowseListing(listing) {
    return {
        ...toPublicListing(listing),
        seller: listing.seller?._id ? toPublicSeller(listing.seller) : null,
    };
}