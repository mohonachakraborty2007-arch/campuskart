import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.js';

const router = Router();

router.use(auth); // every wishlist route needs a logged-in user

router.get('/', getWishlist);
router.post('/:listingId', addToWishlist);
router.delete('/:listingId', removeFromWishlist);

export default router;