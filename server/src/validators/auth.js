import { z } from 'zod';
import { allowedEmailDomains } from '../config/env.js';

const collegeEmail = z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Enter a valid email'))
    .refine(
        (email) => allowedEmailDomains.includes(email.split('@')[1]),
        'Use your college email'
    );

const anyEmail = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email'));

export const registerSchema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name is too long'),
    email: collegeEmail,
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(72, 'Password must be at most 72 characters')
        .regex(/[A-Za-z]/, 'Password needs at least one letter')
        .regex(/[0-9]/, 'Password needs at least one number'),
});

export const loginSchema = z.object({
    email: anyEmail,
    password: z.string().min(1, 'Enter your password'),
});

export const verifySchema = z.object({
    token: z.string().trim().min(1, 'Token is required'),
});

export const resendSchema = z.object({
    email: anyEmail,
});