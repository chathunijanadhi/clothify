import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';
import rateLimit from 'express-rate-limit';
import type { ErrorRequestHandler } from 'express';

import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import uploadsRoutes from './routes/uploads.routes';
import cartRoutes from './routes/cart.routes';
import wishlistRoutes from './routes/wishlist.routes';
import orderRoutes from './routes/order.routes';
import adminRoutes from './routes/admin.routes';
import reviewRoutes from './routes/review.routes';
import logger from './utils/logger';
import { getRoutePattern, httpMetricsMiddleware } from './observability/metrics';
import { requestContext } from './utils/requestContext';

dotenv.config({ quiet: true });

function positiveIntegerFromEnv(name: string, fallback: number): number {
  const configured = process.env[name];
  if (configured === undefined || configured === '') return fallback;

  const value = Number(configured);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return value;
}

const requestTimeoutMs = positiveIntegerFromEnv('REQUEST_TIMEOUT_MS', 30000);
const requestId = (req: express.Request): string => String(req.id ?? 'unknown');
const rateLimitResponse = (req: express.Request, res: express.Response) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests',
    requestId: requestId(req),
  });
};

const app = express();
const configuredTrustProxy = process.env.TRUST_PROXY ?? '0';
app.set(
  'trust proxy',
  configuredTrustProxy === 'false'
    ? false
    : /^\d+$/.test(configuredTrustProxy)
      ? Number(configuredTrustProxy)
      : configuredTrustProxy
);
app.use(pinoHttp({
  logger,
  quietReqLogger: true,
  quietResLogger: true,
  customAttributeKeys: { reqId: 'requestId' },
  genReqId: (req, res) => {
    const incomingRequestId = req.headers['x-request-id'];
    const requestId = typeof incomingRequestId === 'string' && incomingRequestId
      ? incomingRequestId
      : randomUUID();
    res.setHeader('X-Request-Id', requestId);
    return requestId;
  },
  customLogLevel: (_req, res) => {
    if (res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessObject: (req, res, value) => ({
    method: req.method,
    path: getRoutePattern(req),
    statusCode: res.statusCode,
    durationMs: value.responseTime,
  }),
  customErrorObject: (req, res, error, value) => ({
    method: req.method,
    path: getRoutePattern(req),
    statusCode: res.statusCode,
    durationMs: value.responseTime,
    err: error,
  }),
}));
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    if (res.statusCode >= 400 && body !== null && typeof body === 'object' && !Array.isArray(body)) {
      return originalJson({ ...body, requestId: requestId(req) });
    }
    return originalJson(body);
  }) as typeof res.json;
  next();
});
app.use((req, _res, next) => {
  requestContext.run({ requestId: String(req.id) }, next);
});
app.use(httpMetricsMiddleware);
app.use((req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: 'Request timed out',
        requestId: requestId(req),
      });
    }
  }, requestTimeoutMs);
  res.once('finish', () => clearTimeout(timeout));
  res.once('close', () => clearTimeout(timeout));
  next();
});
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://clothify-one.vercel.app',
  'https://www.clothify-one.vercel.app',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean) : []),
]);

// Middleware
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  })
);
export const generalRateLimiter = rateLimit({
  windowMs: positiveIntegerFromEnv('RATE_LIMIT_WINDOW_MS', 900000),
  limit: positiveIntegerFromEnv('RATE_LIMIT_MAX', 300),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: (req) =>
    req.path === '/api/health' ||
    req.path.startsWith('/api/health/') ||
    req.path === '/metrics',
  handler: rateLimitResponse,
});
export const authRateLimiter = rateLimit({
  windowMs: positiveIntegerFromEnv('AUTH_RATE_LIMIT_WINDOW_MS', 900000),
  limit: positiveIntegerFromEnv('AUTH_RATE_LIMIT_MAX', 10),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: rateLimitResponse,
});
app.use(generalRateLimiter);
app.use('/api/auth/login', authRateLimiter);
app.use('/api/auth/register', authRateLimiter);
const requestBodyLimit = process.env.REQUEST_BODY_LIMIT || '1mb';
app.use(express.json({ limit: requestBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: requestBodyLimit }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestId: requestId(req),
  });
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const requestIdValue = requestId(req);
  logger.error({ err, requestId: requestIdValue }, 'Request failed');
  const statusCode = Number.isInteger(err.status) && err.status >= 400 && err.status <= 599
    ? err.status
    : 500;
  const message = process.env.NODE_ENV === 'production'
    ? (statusCode >= 500 ? 'Internal server error' : 'Request failed')
    : (err.message || 'Request failed');

  res.status(statusCode).json({
    success: false,
    message,
    requestId: requestIdValue,
  });
};

app.use(errorHandler);

export default app;
