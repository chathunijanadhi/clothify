import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import jwt from 'jsonwebtoken';
import { toPublic } from '../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_for_development_only';
const JWT_EXPIRES_IN = '7d';

export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body;

    // Basic validation
    if (!email || typeof email !== 'string') return res.status(400).json({ success: false, message: 'Invalid email' });
    if (!password || typeof password !== 'string' || password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const user = await authService.registerUser({ fullName, email, password });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({ success: true, message: 'User registered successfully', data: { user: toPublic(user), token } });
  } catch (err: any) {
    if (err.message === 'EMAIL_ALREADY_REGISTERED') {
      return res.status(409).json({ success: false, message: 'Email already registered', error: 'EMAIL_ALREADY_REGISTERED' });
    }
    console.error('Register error', err);
    return res.status(500).json({ success: false, message: 'Unable to register user', error: err.message || 'SERVER_ERROR' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await authService.authenticateUser({ email, password });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({ success: true, message: 'Login successful', data: { user: toPublic(user), token } });
  } catch (err: any) {
    if (err.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ success: false, message: 'Invalid credentials', error: 'INVALID_CREDENTIALS' });
    }
    console.error('Login error', err);
    return res.status(500).json({ success: false, message: 'Unable to login', error: err.message || 'SERVER_ERROR' });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId as string | undefined;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await (await import('../models/user.model')).findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.json({ success: true, message: 'User profile retrieved', data: { user: toPublic(user) } });
  } catch (err: any) {
    console.error('Me error', err);
    return res.status(500).json({ success: false, message: 'Unable to retrieve profile', error: err.message || 'SERVER_ERROR' });
  }
};
