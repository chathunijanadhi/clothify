import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  // Basic API health
  const base = { success: true, message: 'Clothify API is running' };

  try {
    // Try a lightweight query to verify DB connectivity
    await pool.query('SELECT 1');
    return res.json({ ...base, database: 'connected' });
  } catch (err) {
    // Do not expose error details or credentials
    return res.status(503).json({ ...base, database: 'disconnected' });
  }
});

export default router;
