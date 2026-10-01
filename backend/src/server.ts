import app from './app';
import dotenv from 'dotenv';
import logger from './utils/logger';
import { metricsApp } from './observability/metrics';

dotenv.config({ quiet: true });

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const METRICS_PORT = process.env.METRICS_PORT ? Number(process.env.METRICS_PORT) : 9464;
const METRICS_HOST = process.env.METRICS_HOST || '127.0.0.1';

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'API server listening');
});

metricsApp.listen(METRICS_PORT, METRICS_HOST, () => {
  logger.info({ host: METRICS_HOST, port: METRICS_PORT }, 'Internal metrics server listening');
});
