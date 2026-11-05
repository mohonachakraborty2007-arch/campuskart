import { z } from 'zod';
import { CATEGORY_VALUES, CONDITIONS, MAX_IMAGES } from '../utils/categories.js';

// form fields arrive as text: "true" / "false"
const flag = z.union([
    z.boolean(),
    z.enum(['true', 'false']).transform((v) => v === 'true'),
]);

// a missing or empty price must be an error, not 0
const price = z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.coerce
        .number({ error: 'Enter a valid price' })
        .min(0, 'Price cannot be negative')
        .max(1000000, 'Price is too high')
);

const fields = {
    title: z
        .string()
        .trim()
        .min(3, 'Title must be at least 3 characters')
        .max(80, 'Title must be at most 80 characters'),
    description: z
        .string()
        .trim()
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description must be at most 1000 characters'),
    category: z.enum(CATEGORY_VALUES, { error: 'Choose a category' }),
    condition: z.enum(CONDITIONS, { error: 'Choose a condition' }),
    price,
    openToExchange: flag.optional(),
    exchangeWants: z.string().trim().max(100, 'Keep it under 100 characters').optional(),
    pickupSpot: z.string().trim().max(80, 'Keep it under 80 characters').optional(),
};

export const createListingSchema = z.object(fields);

// editing: every field is optional; removeImages lists the publicIds to delete
export const updateListingSchema = z.object({
    ...Object.fromEntries(
        Object.entries(fields).map(([key, rule]) => [key, rule.optional()])
    ),
    removeImages: z
        .preprocess(
            (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]),
            z.array(z.string().max(200)).max(MAX_IMAGES)
        )
        .optional(),
});