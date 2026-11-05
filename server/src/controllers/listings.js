import mongoose from 'mongoose';
import { Listing } from '../models/Listing.js';
import { AppError } from '../utils/AppError.js';
import { LISTING_STATUSES, MAX_IMAGES } from '../utils/categories.js';
import { toPublicListing } from '../utils/publicListing.js';
import { deleteImage, uploadBuffer } from '../services/images.js';

const EDITABLE_FIELDS = [
    'title',
    'description',
    'category',
    'condition',
    'price',
    'openToExchange',
    'exchangeWants',
    'pickupSpot',
];

// Uploads all photos; if any one fails, the ones that worked are cleaned up.
async function uploadAll(files) {
    const results = await Promise.allSettled(files.map((file) => uploadBuffer(file.buffer)));
    const uploaded = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
    const failed = results.find((r) => r.status === 'rejected');

    if (failed) {
        await Promise.all(uploaded.map((img) => deleteImage(img.publicId)));
        if (failed.reason instanceof AppError) throw failed.reason;
        console.error('Image upload failed:', failed.reason?.message);
        throw new AppError(502, 'UPLOAD_FAILED', 'Could not upload your photos. Please try again.');
    }
    return uploaded;
}

// THE ownership check: load the listing, compare its seller to the logged-in user.
// We never trust a seller id sent from the browser.
async function loadOwnedListing(req) {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError(404, 'NOT_FOUND', 'Listing not found');
    }
    const listing = await Listing.findById(id);
    if (!listing || listing.status === 'removed') {
        throw new AppError(404, 'NOT_FOUND', 'Listing not found');
    }
    if (listing.seller.toString() !== req.user.id) {
        throw new AppError(403, 'FORBIDDEN', 'You can only change your own listings');
    }
    return listing;
}

export async function createListing(req, res) {
    const files = req.files ?? [];
    if (files.length === 0) {
        throw new AppError(400, 'IMAGES_REQUIRED', 'Add at least one photo');
    }

    const images = await uploadAll(files);

    let listing;
    try {
        listing = await Listing.create({
            ...req.body,
            openToExchange: req.body.openToExchange ?? false,
            seller: req.user._id,
            images,
        });
    } catch (err) {
        await Promise.all(images.map((img) => deleteImage(img.publicId)));
        throw err;
    }

    res.status(201).json({ data: { listing: toPublicListing(listing) } });
}

export async function updateListing(req, res) {
    const listing = await loadOwnedListing(req);

    const newFiles = req.files ?? [];
    const removeIds = new Set(req.body.removeImages ?? []);
    const kept = listing.images.filter((img) => !removeIds.has(img.publicId));
    const removed = listing.images.filter((img) => removeIds.has(img.publicId));

    if (kept.length + newFiles.length > MAX_IMAGES) {
        throw new AppError(400, 'TOO_MANY_FILES', `A listing can have at most ${MAX_IMAGES} photos`);
    }
    if (kept.length + newFiles.length === 0) {
        throw new AppError(400, 'IMAGES_REQUIRED', 'A listing needs at least one photo');
    }

    const uploaded = await uploadAll(newFiles);

    for (const key of EDITABLE_FIELDS) {
        if (req.body[key] !== undefined) listing[key] = req.body[key];
    }
    listing.images = [...kept, ...uploaded];

    try {
        await listing.save();
    } catch (err) {
        await Promise.all(uploaded.map((img) => deleteImage(img.publicId)));
        throw err;
    }

    // only after the database is saved, remove the old photos from Cloudinary
    await Promise.all(removed.map((img) => deleteImage(img.publicId)));

    res.json({ data: { listing: toPublicListing(listing) } });
}

// soft delete: the listing is hidden, not erased
export async function removeListing(req, res) {
    const listing = await loadOwnedListing(req);
    listing.status = 'removed';
    await listing.save();
    res.json({ data: { listing: toPublicListing(listing) } });
}

// switches between active and sold (Phase 7 builds on this)
export async function toggleSold(req, res) {
    const listing = await loadOwnedListing(req);
    if (listing.status === 'active') {
        listing.status = 'sold';
        listing.soldAt = new Date();
    } else {
        listing.status = 'active';
        listing.soldAt = undefined;
    }
    await listing.save();
    res.json({ data: { listing: toPublicListing(listing) } });
}

// GET /api/users/me/listings  (optional ?status=active|sold|removed)
export async function listMine(req, res) {
    const filter = { seller: req.user._id };
    if (LISTING_STATUSES.includes(req.query.status)) {
        filter.status = req.query.status;
    }
    const listings = await Listing.find(filter).sort({ createdAt: -1 });
    res.json({ data: { listings: listings.map(toPublicListing) } });
}