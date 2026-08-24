import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_for_development_only';

export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = (req.headers.authorization || '') as string;
    if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const payload = jwt.verify(token, JWT_SECRET) as any;

    // Attach minimal auth info to request
    (req as any).auth = { userId: payload.userId, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
