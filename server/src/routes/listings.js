import { Router } from 'express';
import {
    createListing,
    removeListing,
    toggleSold,
    updateListing,
} from '../controllers/listings.js';
import { auth, requireVerified } from '../middleware/auth.js';
import { uploadImages } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { createListingSchema, updateListingSchema } from '../validators/listing.js';

const router = Router();

// order matters: log in first, then verified, then read the photos, then validate the text
router.post('/', auth, requireVerified, uploadImages, validate(createListingSchema), createListing);
router.patch('/:id', auth, requireVerified, uploadImages, validate(updateListingSchema), updateListing);
router.delete('/:id', auth, requireVerified, removeListing);
router.patch('/:id/sold', auth, requireVerified, toggleSold);

export default router;