import mongoose from 'mongoose';
import { Wishlist } from '../models/Wishlist.js';
import { Listing } from '../models/Listing.js';
import { AppError } from '../utils/AppError.js';
import { toBrowseListing } from '../utils/publicListing.js';

function checkId(id) {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError(400, 'INVALID_ID', 'That listing id is not valid.');
    }
}

// GET /api/wishlist: my saved listings (removed ones are skipped)
export async function getWishlist(req, res) {
    const entries = await Wishlist.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .limit(200)
        .populate({
            path: 'listing',
            match: { status: { $ne: 'removed' } },
            populate: {
                path: 'seller',
                select: 'name department year emailVerified createdAt',
            },
        });

    const listings = entries.filter((e) => e.listing).map((e) => toBrowseListing(e.listing));
    res.json({ data: { listings, ids: listings.map((l) => l.id) } });
}

// POST /api/wishlist/:listingId: save (safe to repeat)
export async function addToWishlist(req, res) {
    const { listingId } = req.params;
    checkId(listingId);

    const listing = await Listing.findById(listingId);
    if (!listing || listing.status === 'removed') {
        throw new AppError(404, 'NOT_FOUND', 'Listing not found.');
    }
    if (listing.seller.toString() === req.user.id) {
        throw new AppError(400, 'CANNOT_SAVE_OWN', 'You cannot save your own listing.');
    }

    try {
        await Wishlist.updateOne(
            { user: req.user.id, listing: listingId },
            { $setOnInsert: { user: req.user.id, listing: listingId } },
            { upsert: true }
        );
    } catch (err) {
        // two taps at the same moment: the unique index stops the second, which is fine
        if (err.code !== 11000) throw err;
    }

    res.json({ data: { saved: true } });
}

// DELETE /api/wishlist/:listingId: unsave (safe to repeat)
export async function removeFromWishlist(req, res) {
    const { listingId } = req.params;
    checkId(listingId);
    await Wishlist.deleteOne({ user: req.user.id, listing: listingId });
    res.json({ data: { saved: false } });
}