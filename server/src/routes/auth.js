import { Router } from 'express';
import {
    login,
    logout,
    me,
    register,
    resendVerification,
    verifyEmail,
} from '../controllers/auth.js';
import { auth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import {
    loginSchema,
    registerSchema,
    resendSchema,
    verifySchema,
} from '../validators/auth.js';

const router = Router();

// rate-limited: the routes people could abuse
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/verify-email', authLimiter, validate(verifySchema), verifyEmail);
router.post('/resend-verification', authLimiter, validate(resendSchema), resendVerification);
router.post('/login', authLimiter, validate(loginSchema), login);

// not limited: the site calls /me on every page load
router.post('/logout', logout);
router.get('/me', auth, me);

export default router;