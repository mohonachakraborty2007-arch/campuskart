import { getSettings, updateSettings } from '../controllers/settings.js';
import { Router } from 'express';
import { getPublicProfile } from '../controllers/browse.js';
import { listMine } from '../controllers/listings.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/me/listings', auth, listMine);
router.get('/me/settings', auth, getSettings);
router.patch('/me/settings', auth, updateSettings);
router.get('/:id', getPublicProfile);

export default router;