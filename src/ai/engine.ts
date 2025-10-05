/**
 * AI Engine Interface
 *
 * Defines the base types and interfaces for chess AI engines.
 * All AI implementations must implement the AIEngine interface.
 *
 * @module ai/engine
 */

import type { Move } from '@/types/index';
import type { Game } from '@/engine/game';

/**
 * AI difficulty levels
 */
export type AIDifficulty = 'harmless' | 'easy' | 'medium' | 'hard' | 'expert' | 'godlike';

/**
 * AI engine configuration
 */
export interface AIConfig {
  /**
   * Difficulty level of the AI
   * - harmless: Depth 1, very weak, makes many mistakes (50% randomness)
   * - easy: Depth 2, quick thinking, some random moves (30% randomness)
   * - medium: Depth 3, balanced play (10% randomness)
   * - hard: Depth 4, strong tactical play (5% randomness)
   * - expert: Depth 5, very strong play (no randomness)
   * - godlike: Depth 6, maximum strength (no randomness)
   */
  difficulty?: AIDifficulty;

  /**
   * Maximum thinking time in milliseconds
   * If not set, AI will use depth-based search
   */
  maxThinkingTime?: number;

  /**
   * Maximum search depth (overrides difficulty default)
   */
  maxDepth?: number;

  /**
   * Add randomness to move selection (for lower difficulties)
   * Value between 0 (no randomness) and 1 (maximum randomness)
   */
  randomness?: number;
}

/**
 * Move evaluation result
 */
export interface MoveEvaluation {
  /**
   * The move being evaluated
   */
  move: Move;

  /**
   * Evaluation score (from white's perspective)
   * Positive values favor white, negative favor black
   * Typical range: -10000 to +10000 (centipawns)
   */
  score: number;

  /**
   * Search depth reached for this move
   */
  depth: number;

  /**
   * Number of positions evaluated
   */
  nodesEvaluated?: number;

  /**
   * Principal variation (best line found)
   */
  principalVariation?: Move[];
}

/**
 * AI thinking analysis result
 */
export interface AIAnalysis {
  /**
   * Best move found
   */
  bestMove: Move;

  /**
   * Evaluation score for the best move
   */
  score: number;

  /**
   * Time taken to find the move (milliseconds)
   */
  thinkingTime: number;

  /**
   * Search depth reached
   */
  depth: number;

  /**
   * Total number of positions evaluated
   */
  nodesEvaluated: number;

  /**
   * Opening name (if move from opening book)
   */
  openingName?: string;

  /**
   * ECO code (if move from opening book)
   */
  eco?: string;

  /**
   * Top evaluated moves (sorted by score)
   */
  topMoves?: MoveEvaluation[];

  /**
   * Principal variation (best line)
   */
  principalVariation?: Move[];
}

/**
 * Base interface for all AI engines
 */
export interface AIEngine {
  /**
   * Get the AI's name/type
   */
  readonly name: string;

  /**
   * Get the AI's configuration
   */
  readonly config: AIConfig;

  /**
   * Calculate the best move for the current position
   *
   * @param game - Current game state
   * @returns Promise resolving to the best move found
   */
  getBestMove(game: Game): Promise<Move>;

  /**
   * Analyze a position and return detailed information
   *
   * @param game - Current game state
   * @returns Promise resolving to analysis result
   */
  analyze(game: Game): Promise<AIAnalysis>;

  /**
   * Evaluate a specific move without making it
   *
   * @param game - Current game state
   * @param move - Move to evaluate
   * @returns Promise resolving to move evaluation
   */
  evaluateMove?(game: Game, move: Move): Promise<MoveEvaluation>;
}

/**
 * Default difficulty configurations
 */
export const DIFFICULTY_CONFIGS: Record<
  AIDifficulty,
  Required<Omit<AIConfig, 'maxThinkingTime'>>
> = {
  harmless: {
    difficulty: 'harmless',
    maxDepth: 1,
    randomness: 0.5, // 50% chance to pick sub-optimal move
  },
  easy: {
    difficulty: 'easy',
    maxDepth: 2,
    randomness: 0.3, // 30% chance to pick sub-optimal move
  },
  medium: {
    difficulty: 'medium',
    maxDepth: 3,
    randomness: 0.1, // 10% chance for variety
  },
  hard: {
    difficulty: 'hard',
    maxDepth: 4,
    randomness: 0.05, // 5% chance for variety
  },
  expert: {
    difficulty: 'expert',
    maxDepth: 5,
    randomness: 0, // No randomness
  },
  godlike: {
    difficulty: 'godlike',
    maxDepth: 6,
    randomness: 0, // No randomness
  },
};

/**
 * Get default configuration for a difficulty level
 *
 * @param difficulty - Difficulty level
 * @returns Default configuration
 */
export function getDefaultConfig(difficulty: AIDifficulty): AIConfig {
  return { ...DIFFICULTY_CONFIGS[difficulty] };
}

/**
 * Merge user config with defaults
 *
 * @param userConfig - User-provided configuration
 * @returns Merged configuration
 */
export function mergeConfig(userConfig?: AIConfig): Required<AIConfig> {
  const difficulty = userConfig?.difficulty ?? 'medium';
  const defaults = DIFFICULTY_CONFIGS[difficulty];

  return {
    difficulty,
    maxDepth: userConfig?.maxDepth ?? defaults.maxDepth,
    randomness: userConfig?.randomness ?? defaults.randomness,
    maxThinkingTime: userConfig?.maxThinkingTime ?? 30000, // 30 seconds default
  };
}
