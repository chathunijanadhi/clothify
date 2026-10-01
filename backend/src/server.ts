import app from './app';
import dotenv from 'dotenv';
import logger from './utils/logger';
import { metricsApp } from './observability/metrics';
import pool, { verifyDatabaseConnection } from './config/database';
import { validateStartupConfig } from './config/startup';
import { setShuttingDown } from './utils/lifecycle';
import type { Server } from 'http';

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

const apiPort = positiveIntegerFromEnv('PORT', 5000);
const metricsPort = positiveIntegerFromEnv('METRICS_PORT', 9464);
const shutdownTimeoutMs = positiveIntegerFromEnv('SHUTDOWN_TIMEOUT_MS', 10000);
const requestTimeoutMs = positiveIntegerFromEnv('REQUEST_TIMEOUT_MS', 30000);
const metricsHost = process.env.METRICS_HOST || '127.0.0.1';
let apiServer: Server | undefined;
let metricsServer: Server | undefined;
let shutdownPromise: Promise<void> | undefined;

function closeServer(server: Server | undefined): Promise<void> {
  if (!server?.listening) return Promise.resolve();
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function shutdown(reason: string): Promise<void> {
  if (shutdownPromise) return shutdownPromise;

  setShuttingDown(true);
  logger.info({ reason }, 'Graceful shutdown started');
  shutdownPromise = (async () => {
    const forceExitTimer = setTimeout(() => {
      logger.fatal({ timeoutMs: shutdownTimeoutMs, reason }, 'Graceful shutdown timed out');
      process.exit(1);
    }, shutdownTimeoutMs);

    try {
      await Promise.all([closeServer(apiServer), closeServer(metricsServer)]);
      await pool.end();
      clearTimeout(forceExitTimer);
      logger.info({ reason }, 'Graceful shutdown completed');
      process.exit(0);
    } catch (err) {
      clearTimeout(forceExitTimer);
      logger.fatal({ err, reason }, 'Graceful shutdown failed');
      process.exit(1);
    }
  })();
  return shutdownPromise;
}

function registerProcessHandlers(): void {
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.fatal({ err: reason }, 'Unhandled promise rejection');
    void shutdown('unhandledRejection');
  });
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception');
    void shutdown('uncaughtException');
  });
}

export async function startServer(): Promise<void> {
  validateStartupConfig();
  registerProcessHandlers();
  await verifyDatabaseConnection();

  apiServer = app.listen(apiPort);
  apiServer.timeout = requestTimeoutMs + 1000;
  apiServer.requestTimeout = requestTimeoutMs;
  await new Promise<void>((resolve, reject) => {
    apiServer?.once('listening', resolve);
    apiServer?.once('error', reject);
  });

  metricsServer = metricsApp.listen(metricsPort, metricsHost);
  await new Promise<void>((resolve, reject) => {
    metricsServer?.once('listening', resolve);
    metricsServer?.once('error', reject);
  });

  logger.info({ port: apiPort }, 'API server listening');
  logger.info({ host: metricsHost, port: metricsPort }, 'Internal metrics server listening');
}

if (require.main === module) {
  void startServer().catch(async (err: unknown) => {
    logger.fatal({ err }, 'Backend startup failed');
    try {
      await pool.end();
    } catch (poolError) {
      logger.error({ err: poolError }, 'Failed to close PostgreSQL pool after startup failure');
    }
    process.exit(1);
  });
}
