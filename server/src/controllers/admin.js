import mongoose from 'mongoose';
import { z } from 'zod';
import { Listing } from '../models/Listing.js';
import { Report } from '../models/Report.js';
import { AppError } from '../utils/AppError.js';
import { fieldErrors } from '../utils/fieldErrors.js';

const actionSchema = z
    .object({ action: z.enum(['remove-listing', 'dismiss'], 'Choose an action.') })
    .strict();

// GET /api/admin/reports: open reports, newest first
export async function listReports(req, res) {
    const rows = await Report.find({ status: 'open' })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('reporter', 'name')
        .populate({
            path: 'listing',
            select: 'title images status seller',
            populate: { path: 'seller', select: 'name' },
        });

    const reports = rows.map((r) => ({
        id: r.id,
        reason: r.reason,
        details: r.details,
        createdAt: r.createdAt,
        reporter: r.reporter ? { id: r.reporter.id, name: r.reporter.name } : null,
        listing: r.listing
            ? {
                id: r.listing.id,
                title: r.listing.title,
                status: r.listing.status,
                image: r.listing.images?.[0]?.url ?? null,
                seller: r.listing.seller ? { id: r.listing.seller.id, name: r.listing.seller.name } : null,
            }
            : null,
    }));

    res.json({ data: { reports } });
}

// PATCH /api/admin/reports/:id   body: { action: 'remove-listing' | 'dismiss' }
export async function resolveReport(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        throw new AppError(400, 'INVALID_ID', 'That id is not valid.');
    }

    const parsed = actionSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Choose an action.', fieldErrors(parsed.error));
    }

    const report = await Report.findById(req.params.id);
    if (!report) throw new AppError(404, 'NOT_FOUND', 'Report not found.');
    if (report.status !== 'open') {
        throw new AppError(409, 'ALREADY_RESOLVED', 'This report is already resolved.');
    }

    const now = new Date();

    if (parsed.data.action === 'remove-listing') {
        await Listing.updateOne({ _id: report.listing }, { status: 'removed' });
        // every open report about this listing is now settled
        await Report.updateMany(
            { listing: report.listing, status: 'open' },
            { status: 'resolved', resolution: 'removed', resolvedAt: now }
        );
    } else {
        report.status = 'resolved';
        report.resolution = 'dismissed';
        report.resolvedAt = now;
        await report.save();
    }

    res.json({ data: { resolved: true, action: parsed.data.action } });
}