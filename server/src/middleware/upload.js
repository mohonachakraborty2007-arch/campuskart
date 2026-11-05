import multer from 'multer';
import { AppError } from '../utils/AppError.js';
import { MAX_IMAGES } from '../utils/categories.js';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB per photo
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const parser = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_BYTES, files: MAX_IMAGES },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
            return cb(new AppError(400, 'INVALID_FILE_TYPE', 'Only JPEG, PNG or WebP photos are allowed'));
        }
        cb(null, true);
    },
});

// We do not trust the file name or the type the browser claims.
// We look at the first bytes of the file to see what it really is.
function looksLikeImage(buf) {
    if (!buf || buf.length < 12) return false;
    const jpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    const png = buf
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const webp =
        buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buf.subarray(8, 12).toString('ascii') === 'WEBP';
    return jpeg || png || webp;
}

export function uploadImages(req, res, next) {
    parser.array('images', MAX_IMAGES)(req, res, (err) => {
        if (err) {
            if (err instanceof AppError) return next(err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(new AppError(400, 'FILE_TOO_LARGE', 'Each photo must be 5 MB or smaller'));
            }
            if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
                return next(new AppError(400, 'TOO_MANY_FILES', `You can upload at most ${MAX_IMAGES} photos`));
            }
            return next(err);
        }
        for (const file of req.files ?? []) {
            if (!looksLikeImage(file.buffer)) {
                return next(
                    new AppError(400, 'INVALID_FILE_TYPE', 'Only real JPEG, PNG or WebP photos are allowed')
                );
            }
        }
        next();
    });
}