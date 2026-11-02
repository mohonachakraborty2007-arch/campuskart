import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
    PORT: z.coerce.number().default(5000),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    MONGODB_URI_TEST: z.string().default(''),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    CLIENT_ORIGIN: z.string().min(1, 'CLIENT_ORIGIN is required'),
    ALLOWED_EMAIL_DOMAINS: z.string().default(''),
    EMAIL_API_KEY: z.string().default(''),
    EMAIL_FROM: z.string().default('CampusKart <onboarding@resend.dev>'),
});

const result = schema.safeParse(process.env);

if (!result.success) {
    console.error('Invalid environment variables:');
    for (const issue of result.error.issues) {
        console.error(`- ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
}

// Turns "...mongodb.net//campuskart" into "...mongodb.net/campuskart"
function cleanMongoUri(uri) {
    return uri.trim().replace(/^(mongodb(?:\+srv)?:\/\/[^/]+)\/{2,}/, '$1/');
}

export const env = {
    ...result.data,
    MONGODB_URI: cleanMongoUri(result.data.MONGODB_URI),
    MONGODB_URI_TEST: cleanMongoUri(result.data.MONGODB_URI_TEST),
};

export const allowedEmailDomains = env.ALLOWED_EMAIL_DOMAINS
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);