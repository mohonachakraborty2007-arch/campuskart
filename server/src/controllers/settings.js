import { z } from 'zod';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { fieldErrors } from '../utils/fieldErrors.js';

const cleanNumber = (v) => v.replace(/[\s-]/g, '');

const settingsSchema = z
    .object({
        name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(60).optional(),
        department: z.string().trim().max(60).optional(),
        whatsapp: z
            .string()
            .trim()
            .refine(
                (v) => cleanNumber(v) === '' || /^\+?\d{10,15}$/.test(cleanNumber(v)),
                'Enter a valid number, like +919830012345.'
            )
            .transform(cleanNumber)
            .optional(),
        showWhatsapp: z.boolean().optional(),
    })
    .strict();

function toSettings(user) {
    return {
        name: user.name,
        email: user.email,
        department: user.department || '',
        whatsapp: user.whatsapp || '',
        showWhatsapp: Boolean(user.showWhatsapp),
    };
}

// GET /api/users/me/settings
export async function getSettings(req, res) {
    const user = await User.findById(req.user.id);
    if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found.');
    res.json({ data: { settings: toSettings(user) } });
}

// PATCH /api/users/me/settings
export async function updateSettings(req, res) {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Please check the highlighted fields.', fieldErrors(parsed.error));
    }

    const user = await User.findById(req.user.id);
    if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found.');

    Object.assign(user, parsed.data);

    if (user.showWhatsapp && !user.whatsapp) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Please check the highlighted fields.', {
            whatsapp: 'Add your number to show it to buyers.',
        });
    }

    await user.save();
    res.json({ data: { settings: toSettings(user) } });
}