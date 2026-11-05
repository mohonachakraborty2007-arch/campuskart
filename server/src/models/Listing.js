import mongoose from 'mongoose';
import {
    CATEGORY_VALUES,
    CONDITIONS,
    LISTING_STATUSES,
    MAX_IMAGES,
} from '../utils/categories.js';

const imageSchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
    },
    { _id: false }
);

const listingSchema = new mongoose.Schema(
    {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 80,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 1000,
        },
        category: {
            type: String,
            required: true,
            enum: CATEGORY_VALUES,
        },
        condition: {
            type: String,
            required: true,
            enum: CONDITIONS,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        openToExchange: {
            type: Boolean,
            default: false,
        },
        exchangeWants: {
            type: String,
            trim: true,
            maxlength: 100,
            default: '',
        },
        pickupSpot: {
            type: String,
            trim: true,
            maxlength: 80,
            default: '',
        },
        images: {
            type: [imageSchema],
            default: [],
            validate: {
                validator: (list) => list.length <= MAX_IMAGES,
                message: `A listing can have at most ${MAX_IMAGES} photos`,
            },
        },
        status: {
            type: String,
            enum: LISTING_STATUSES,
            default: 'active',
        },
        soldAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// search by words in title + description (used in Phase 6)
listingSchema.index({ title: 'text', description: 'text' });
// browse pages: active listings by category, newest first
listingSchema.index({ status: 1, category: 1, createdAt: -1 });
// "my listings" page
listingSchema.index({ seller: 1, status: 1, createdAt: -1 });

export const Listing = mongoose.model('Listing', listingSchema);