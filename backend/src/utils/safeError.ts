import logger from './logger';
import { requestContext } from './requestContext';

export function safeErrorMessage(error: unknown): string {
  logger.error(
    { err: error, requestId: requestContext.getStore()?.requestId },
    'Request handler failed'
  );

  if (process.env.NODE_ENV === 'production') return 'SERVER_ERROR';
  return error instanceof Error ? error.message : 'SERVER_ERROR';
}
