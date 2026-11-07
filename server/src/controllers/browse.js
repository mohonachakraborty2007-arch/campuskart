import { Listing } from '../models/Listing.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import {
    toBrowseListing,
    toPublicListing,
    toPublicSeller,
} from '../utils/publicListing.js';

const SELLER_FIELDS = 'name department year createdAt emailVerified';
const OBJECT_ID = /^[a-f\d]{24}$/i;

const SORTS = {
    newest: { createdAt: -1 },
    price_asc: { price: 1, createdAt: -1 },
    price_desc: { price: -1, createdAt: -1 },
};

// GET /api/listings
export async function browseListings(req, res) {
    // built ONLY from the validated values
    const { q, category, condition, exchange, minPrice, maxPrice, sort, page, limit } =
        res.locals.query;

    const filter = { status: 'active' };
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (exchange !== undefined) filter.openToExchange = exchange;
    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = minPrice;
        if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    // with a search word: best match first, then newest
    const projection = q ? { score: { $meta: 'textScore' } } : undefined;
    const order = q ? { score: { $meta: 'textScore' }, createdAt: -1 } : SORTS[sort];

    const [total, listings] = await Promise.all([
        Listing.countDocuments(filter),
        Listing.find(filter, projection)
            .sort(order)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('seller', SELLER_FIELDS),
    ]);

    res.json({
        data: {
            listings: listings.map(toBrowseListing),
            meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
        },
    });
}

// GET /api/listings/:id
export async function getListing(req, res) {
    const { id } = req.params;
    if (!OBJECT_ID.test(id)) {
        throw new AppError(400, 'INVALID_ID', 'That listing link is not valid');
    }

    const listing = await Listing.findById(id).populate('seller', SELLER_FIELDS);
    if (!listing || !listing.seller) {
        throw new AppError(404, 'NOT_FOUND', 'Listing not found');
    }

    // removed listings are visible only to their owner or an admin
    if (listing.status === 'removed') {
        const isOwner = req.user && String(listing.seller._id) === req.user.id;
        const isAdmin = req.user?.role === 'admin';
        if (!isOwner && !isAdmin) {
            throw new AppError(404, 'NOT_FOUND', 'Listing not found');
        }
    }

    res.json({ data: { listing: toBrowseListing(listing) } });
}

// GET /api/users/:id  (public profile)
export async function getPublicProfile(req, res) {
    const { id } = req.params;
    if (!OBJECT_ID.test(id)) {
        throw new AppError(400, 'INVALID_ID', 'That profile link is not valid');
    }

    const user = await User.findById(id);
    if (!user) throw new AppError(404, 'NOT_FOUND', 'Profile not found');

    const listings = await Listing.find({
        seller: user._id,
        status: { $in: ['active', 'sold'] },
    })
        .sort({ createdAt: -1 })
        .limit(100);

    const active = listings.filter((l) => l.status === 'active').map(toPublicListing);
    const sold = listings.filter((l) => l.status === 'sold').map(toPublicListing);

    res.json({
        data: {
            user: { ...toPublicSeller(user), counts: { active: active.length, sold: sold.length } },
            listings: { active, sold },
        },
    });
}