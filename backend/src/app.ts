import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';

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

const app = express();
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
app.use((req, _res, next) => {
  requestContext.run({ requestId: String(req.id) }, next);
});
app.use(httpMetricsMiddleware);
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;
