import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { listReports, resolveReport } from '../controllers/admin.js';

const router = Router();

router.use(auth, requireAdmin); // the real lock: enforced on the server

router.get('/reports', listReports);
router.patch('/reports/:id', resolveReport);

export default router;