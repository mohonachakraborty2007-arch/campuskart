import mongoose from 'mongoose';

export const REPORT_REASONS = ['spam', 'scam', 'prohibited', 'wrong-category', 'other'];

const reportSchema = new mongoose.Schema(
    {
        listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
        reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        reason: { type: String, enum: REPORT_REASONS, required: true },
        details: { type: String, trim: true, maxlength: 300, default: '' },
        status: { type: String, enum: ['open', 'resolved'], default: 'open' },
        resolution: { type: String, enum: ['removed', 'dismissed', null], default: null },
        resolvedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// one report per person per listing
reportSchema.index({ listing: 1, reporter: 1 }, { unique: true });
reportSchema.index({ status: 1, createdAt: -1 });

export const Report = mongoose.model('Report', reportSchema);