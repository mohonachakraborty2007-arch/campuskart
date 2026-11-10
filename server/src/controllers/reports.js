import mongoose from 'mongoose';
import { z } from 'zod';
import { Listing } from '../models/Listing.js';
import { Report, REPORT_REASONS } from '../models/Report.js';
import { AppError } from '../utils/AppError.js';
import { fieldErrors } from '../utils/fieldErrors.js';

const reportSchema = z
    .object({
        reason: z.enum(REPORT_REASONS, 'Choose a reason.'),
        details: z.string().trim().max(300, 'Keep details under 300 characters.').optional(),
    })
    .strict();

// POST /api/listings/:id/reports
export async function createReport(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new AppError(400, 'INVALID_ID', 'That listing id is not valid.');
    }

    const parsed = reportSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Please check your report.', fieldErrors(parsed.error));
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing || listing.status === 'removed') {
        throw new AppError(404, 'NOT_FOUND', 'Listing not found.');
    }
    if (listing.seller.toString() === req.user.id) {
        throw new AppError(400, 'CANNOT_REPORT_OWN', 'You cannot report your own listing.');
    }

    try {
        await Report.create({
            listing: listing.id,
            reporter: req.user.id,
            reason: parsed.data.reason,
            details: parsed.data.details ?? '',
        });
    } catch (err) {
        if (err.code === 11000) {
            throw new AppError(409, 'ALREADY_REPORTED', 'You have already reported this listing.');
        }
        throw err;
    }

    res.status(201).json({ data: { reported: true } });
}