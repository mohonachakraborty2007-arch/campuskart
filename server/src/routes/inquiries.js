import { Router } from 'express';
import { auth, requireVerified } from '../middleware/auth.js';
import { getInbox, markRead } from '../controllers/inquiries.js';

const router = Router();

router.use(auth, requireVerified);

router.get('/', getInbox);
router.patch('/:id/read', markRead);

export default router;