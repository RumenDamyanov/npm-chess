/**
 * AI Module
 *
 * Chess AI engines for computer opponents.
 *
 * @module ai
 */

// Export AI engines
export { RandomAI } from './random';
export { MinimaxAI } from './minimax';

// Export opening book
export {
  OpeningBook,
  createDefaultOpeningBook,
  loadOpeningBookFromFile,
} from './opening-book';
export type {
  OpeningMove,
  OpeningBookConfig,
  OpeningBookData,
} from './opening-book';

// Export engine types and interfaces
export type {
  AIEngine,
  AIConfig,
  AIDifficulty,
  AIAnalysis,
  MoveEvaluation,
} from './engine';

export { getDefaultConfig, mergeConfig, DIFFICULTY_CONFIGS } from './engine';

// Export evaluation functions
export {
  evaluateBoard,
  evaluateMaterial,
  evaluatePosition,
  isEndgame,
  getPieceSquareValue,
  PIECE_VALUES,
} from './evaluation';

// Version
export const AI_VERSION = '0.1.0';
