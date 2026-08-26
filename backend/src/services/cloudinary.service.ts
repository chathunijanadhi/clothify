/* Cloudinary upload helper
   Uses environment variables:
   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
*/
import pool from '../config/database';

// use require to avoid type package issues
const cloudinary = require('cloudinary').v2;

export async function uploadImage(dataUrl: string, folder = 'clothify') {
  // Read env vars at call time so restarting isn't strictly required when envs change
  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD || null;
  const API_KEY = process.env.CLOUDINARY_API_KEY || null;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET || null;

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error('CLOUDINARY_NOT_CONFIGURED');
  }

  // configure cloudinary with current env values
  cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET });

  try {
    // Cloudinary accepts data URLs directly
    const res = await cloudinary.uploader.upload(dataUrl, { folder, allowed_formats: ['jpg', 'png', 'jpeg', 'webp'] });
    return res.secure_url as string;
  } catch (err: any) {
    console.error('Cloudinary upload failed', err);
    throw new Error(err?.message || 'CLOUDINARY_UPLOAD_FAILED');
  }
}
