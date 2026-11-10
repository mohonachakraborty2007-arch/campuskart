import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

// use AFTER auth
export async function requireAdmin(req, res, next) {
    const user = await User.findById(req.user.id).select('role');
    if (!user || user.role !== 'admin') {
        throw new AppError(403, 'FORBIDDEN', 'Admins only.');
    }
    next();
}