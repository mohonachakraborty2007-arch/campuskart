import { createInquiry } from '../controllers/inquiries.js';
import { inquiryLimiter } from '../middleware/inquiryLimiter.js';
import { Router } from 'express';
import { browseListings, getListing } from '../controllers/browse.js';
import {
    createListing,
    removeListing,
    toggleSold,
    updateListing,
} from '../controllers/listings.js';
import { auth, optionalAuth, requireVerified } from '../middleware/auth.js';
import { uploadImages } from '../middleware/upload.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { browseQuerySchema } from '../validators/listingQuery.js';
import { createListingSchema, updateListingSchema } from '../validators/listing.js';

const router = Router();

// public: anyone can browse and open a listing
router.get('/', validateQuery(browseQuerySchema), browseListings);
router.get('/:id', optionalAuth, getListing);

// private: log in first, then verified, then read the photos, then validate the text
router.post('/', auth, requireVerified, uploadImages, validate(createListingSchema), createListing);
router.post('/:id/inquiries', auth, requireVerified, inquiryLimiter, createInquiry);
router.patch('/:id', auth, requireVerified, uploadImages, validate(updateListingSchema), updateListing);
router.delete('/:id', auth, requireVerified, removeListing);
router.patch('/:id/sold', auth, requireVerified, toggleSold);

export default router;