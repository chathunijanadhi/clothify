import pino from 'pino';
import dotenv from 'dotenv';
import { requestContext } from './requestContext';

dotenv.config({ quiet: true });

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  mixin(_mergeObject, _level, activeLogger) {
    if (activeLogger.bindings().requestId) return {};
    const context = requestContext.getStore();
    return context ? { requestId: context.requestId } : {};
  },
  redact: {
    paths: [
      'password',
      '*.password',
      '*.password_hash',
      'token',
      '*.token',
      'jwt',
      '*.jwt',
      'idToken',
      '*.idToken',
      'accessToken',
      '*.accessToken',
      'refreshToken',
      '*.refreshToken',
      'bearerToken',
      '*.bearerToken',
      'authorization',
      '*.authorization',
      'cookie',
      '*.cookie',
      'set-cookie',
      '*.set-cookie',
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers.set-cookie',
      'req.body.password',
      'req.body.confirmPassword',
      'req.body.token',
      'req.body.jwt',
      'req.body.idToken',
      'req.body.accessToken',
      'req.body.refreshToken',
    ],
    censor: '[REDACTED]',
  },
});

export default logger;
