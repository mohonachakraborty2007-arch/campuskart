import { Router } from 'express';
import { listMine } from '../controllers/listings.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/me/listings', auth, listMine);

export default router;