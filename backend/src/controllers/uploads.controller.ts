import { Request, Response } from 'express';
import * as cloudinaryService from '../services/cloudinary.service';

export const upload = async (req: Request, res: Response) => {
  try {
    const { image } = req.body || {};
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const url = await cloudinaryService.uploadImage(image);
    return res.status(201).json({ success: true, message: 'Image uploaded', data: { url } });
  } catch (err: any) {
    if (err.message === 'CLOUDINARY_NOT_CONFIGURED') {
      return res.status(500).json({ success: false, message: 'Cloudinary not configured on server. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in env.' });
    }
    console.error('Upload error', err);
    return res.status(500).json({ success: false, message: 'Unable to upload image', error: err.message || 'SERVER_ERROR' });
  }
};
