'use strict';

const pino = require('pino');

module.exports = pino({
  level: process.env.LOG_LEVEL || 'info',
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
    ],
    censor: '[REDACTED]',
  },
});
