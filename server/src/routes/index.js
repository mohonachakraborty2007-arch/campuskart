import { Router } from 'express';
import authRoutes from './auth.js';
import listingRoutes from './listings.js';
import userRoutes from './users.js';
import wishlistRoutes from './wishlist.js';

const router = Router();

router.get('/health', (req, res) => {
    res.json({ data: { status: 'ok' } });
});

router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/users', userRoutes);
router.use('/wishlist', wishlistRoutes);

export default router;