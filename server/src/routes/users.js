import { Router } from 'express';
import { getPublicProfile } from '../controllers/browse.js';
import { listMine } from '../controllers/listings.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/me/listings', auth, listMine);
router.get('/:id', getPublicProfile);

export default router;