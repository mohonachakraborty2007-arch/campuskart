import { z } from 'zod';
import { CATEGORY_VALUES, CONDITIONS } from '../utils/categories.js';

const priceRule = (label) =>
    z.coerce
        .number({ error: `${label} must be a number` })
        .min(0, `${label} cannot be negative`)
        .max(1000000, `${label} is too high`)
        .optional();

// .strict(): any option we do not know (like minPrice[$gt]=0) is rejected with 400
export const browseQuerySchema = z
    .object({
        q: z.string().trim().max(60, 'Search is too long (60 characters max)').optional(),
        category: z.enum(CATEGORY_VALUES, { error: 'Unknown category' }).optional(),
        condition: z.enum(CONDITIONS, { error: 'Unknown condition' }).optional(),
        exchange: z
            .enum(['true', 'false'], { error: 'exchange must be true or false' })
            .transform((v) => v === 'true')
            .optional(),
        minPrice: priceRule('Minimum price'),
        maxPrice: priceRule('Maximum price'),
        sort: z
            .enum(['newest', 'price_asc', 'price_desc'], { error: 'Unknown sort option' })
            .default('newest'),
        page: z.coerce.number({ error: 'page must be a number' }).int().min(1).default(1),
        limit: z.coerce
            .number({ error: 'limit must be a number' })
            .int()
            .min(1)
            .transform((n) => Math.min(n, 24))
            .default(12),
    })
    .strict()
    .refine(
        (d) => d.minPrice === undefined || d.maxPrice === undefined || d.minPrice <= d.maxPrice,
        { message: 'Maximum price must be at least the minimum price', path: ['maxPrice'] }
    );