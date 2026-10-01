import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

router.get('/live', (_req: Request, res: Response) => {
  return res.json({ success: true, message: 'Clothify API is running' });
});

router.get('/ready', async (_req: Request, res: Response) => {
  let timeout: NodeJS.Timeout | undefined;

  try {
    await Promise.race([
      pool.query('SELECT 1'),
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new Error('Database readiness check timed out')), 1000);
      }),
    ]);
    return res.json({ success: true, message: 'Clothify API is running', database: 'connected' });
  } catch {
    return res.status(503).json({ success: true, message: 'Clothify API is running', database: 'disconnected' });
  } finally {
    if (timeout) clearTimeout(timeout);
  }
});

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
