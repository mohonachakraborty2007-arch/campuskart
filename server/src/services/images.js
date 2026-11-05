import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// Sends one image (a Buffer) to Cloudinary. Returns what we store in the database.
export function uploadBuffer(buffer) {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
        throw new AppError(503, 'UPLOAD_NOT_CONFIGURED', 'Photo uploads are not set up yet');
    }
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'campuskart/listings', resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                resolve({ url: result.secure_url, publicId: result.public_id });
            }
        );
        stream.end(buffer);
    });
}

// Removes an image from Cloudinary. Never throws: a failed cleanup must not break the request.
export async function deleteImage(publicId) {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error('Could not delete image', publicId, err.message);
    }
}