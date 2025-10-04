/**
 * npm-chess - A powerful, type-safe chess engine library
 *
 * @packageDocumentation
 */

// Export core engine
export * from './engine/index';

// Export AI
export * from './ai/index';

// Export types
export * from './types/index';

// Export utilities
export * from './utils/index';

// Export API Server
export { ApiServer } from './api-server';
export type { ApiConfig, GameResponse, MoveRecord, ErrorResponse } from './api-server';

// Re-export commonly used types
export type { Color, PieceType, Piece, Square, Position, Move, GameStatus } from './types/index';

// Package version
export const VERSION = '0.5.0';
