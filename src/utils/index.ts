/**
 * Utility Functions
 *
 * Helper functions and utilities for the chess engine.
 *
 * @module utils
 */

// Export utilities (to be implemented)
// export { validateMove } from './validation.js';
// export { ChessError } from './errors.js';
// export { logger } from './logger.js';
// export { config } from './config.js';

// Placeholder export for Phase 1
export const UTILS_VERSION = '0.1.0';

/**
 * Simple logger utility for Phase 1
 */
export const logger = {
  info: (message: string, ...args: unknown[]): void => {
    console.log(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]): void => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]): void => {
    if (process.env['NODE_ENV'] === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};
