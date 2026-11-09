import mongoose from 'mongoose';
import { z } from 'zod';
import { Inquiry } from '../models/Inquiry.js';
import { Listing } from '../models/Listing.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { fieldErrors } from '../utils/fieldErrors.js';

const messageSchema = z
    .object({
        message: z
            .string()
            .trim()
            .min(1, 'Write a message first.')
            .max(500, 'Keep your message under 500 characters.'),
    })
    .strict();

function checkId(id) {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError(400, 'INVALID_ID', 'That id is not valid.');
    }
}

// POST /api/listings/:id/inquiries
export async function createInquiry(req, res) {
    checkId(req.params.id);

    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Please check your message.', fieldErrors(parsed.error));
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.status === 'removed') {
        throw new AppError(404, 'NOT_FOUND', 'Listing not found.');
    }
    if (listing.seller.toString() === req.user.id) {
        throw new AppError(400, 'CANNOT_MESSAGE_SELF', 'You cannot message yourself.');
    }
    if (listing.status === 'sold') {
        throw new AppError(400, 'LISTING_SOLD', 'This item has already been sold.');
    }

    // "to" always comes from the database, never from the request
    const inquiry = await Inquiry.create({
        listing: listing.id,
        from: req.user.id,
        to: listing.seller,
        message: parsed.data.message,
    });

    // the seller's WhatsApp is shared only if they opted in, and only now,
    // after this buyer has sent a message
    const seller = await User.findById(listing.seller).select('whatsapp showWhatsapp');
    const whatsapp = seller?.showWhatsapp && seller.whatsapp ? seller.whatsapp : null;

    res.status(201).json({
        data: {
            inquiry: { id: inquiry.id, createdAt: inquiry.createdAt },
            contact: whatsapp ? { whatsapp } : null,
        },
    });
}

// GET /api/inquiries: messages sent TO me
export async function getInbox(req, res) {
    const rows = await Inquiry.find({ to: req.user.id })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('from', 'name department')
        .populate('listing', 'title images status');

    const inquiries = rows.map((r) => ({
        id: r.id,
        message: r.message,
        createdAt: r.createdAt,
        unread: !r.readAt,
        from: r.from
            ? { id: r.from.id, name: r.from.name, department: r.from.department || '' }
            : null,
        listing: r.listing
            ? {
                id: r.listing.id,
                title: r.listing.title,
                status: r.listing.status,
                image: r.listing.images?.[0]?.url ?? null,
            }
            : null,
    }));

    res.json({ data: { inquiries, unread: inquiries.filter((i) => i.unread).length } });
}

// PATCH /api/inquiries/:id/read: only the recipient
export async function markRead(req, res) {
    checkId(req.params.id);

    const inquiry = await Inquiry.findOne({ _id: req.params.id, to: req.user.id });
    if (!inquiry) {
        // same answer for "does not exist" and "belongs to someone else"
        throw new AppError(404, 'NOT_FOUND', 'Message not found.');
    }
    if (!inquiry.readAt) {
        inquiry.readAt = new Date();
        await inquiry.save();
    }

    res.json({ data: { read: true } });
}