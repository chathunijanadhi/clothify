import express from 'express';
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from 'prom-client';
import type { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export const registry = new Registry();

collectDefaultMetrics({ register: registry });

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of completed HTTP requests.',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
});

export const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of completed HTTP requests in seconds.',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});

new Gauge({
  name: 'db_pool_total_connections',
  help: 'Total PostgreSQL connections currently in the pool.',
  registers: [registry],
  collect() {
    this.set(pool.totalCount);
  },
});

new Gauge({
  name: 'db_pool_idle_connections',
  help: 'Idle PostgreSQL connections currently in the pool.',
  registers: [registry],
  collect() {
    this.set(pool.idleCount);
  },
});

new Gauge({
  name: 'db_pool_waiting_requests',
  help: 'Requests currently waiting for a PostgreSQL connection.',
  registers: [registry],
  collect() {
    this.set(pool.waitingCount);
  },
});

export function getRoutePattern(req: Request): string {
  const routePath = req.route?.path;
  if (!routePath) return 'unmatched';

  const path = Array.isArray(routePath) ? routePath.join('|') : routePath;
  return `${req.baseUrl}${path}` || '/';
}

export function httpMetricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const startedAt = process.hrtime.bigint();

  res.once('finish', () => {
    const route = getRoutePattern(req);
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1e9;

    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationSeconds);
  });

  next();
}

export const metricsApp = express();

metricsApp.get('/metrics', async (_req, res) => {
  res.setHeader('Content-Type', registry.contentType);
  res.end(await registry.metrics());
});
