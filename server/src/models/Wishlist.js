import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    },
    { timestamps: true }
);

// a user can save a listing only once
wishlistSchema.index({ user: 1, listing: 1 }, { unique: true });
wishlistSchema.index({ user: 1, createdAt: -1 });

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);