import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
    {
        listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true, trim: true, minlength: 1, maxlength: 500 },
        readAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// the seller's inbox: my messages, newest first
inquirySchema.index({ to: 1, createdAt: -1 });

export const Inquiry = mongoose.model('Inquiry', inquirySchema);