/**
 * Random AI Engine
 *
 * Selects a random legal move. Useful for testing and as a baseline opponent.
 *
 * @module ai/random
 */

import type { Move } from '@/types/index';
import type { Game } from '@/engine/game';
import type { AIEngine, AIConfig, AIAnalysis, MoveEvaluation } from './engine';
import { mergeConfig } from './engine';

/**
 * Random AI Engine
 * 
 * Picks a random legal move from the available moves.
 * Optionally can use basic evaluation to avoid obviously bad moves.
 */
export class RandomAI implements AIEngine {
  public readonly name = 'Random';
  public readonly config: Required<AIConfig>;

  /**
   * Create a new Random AI engine
   *
   * @param config - AI configuration
   */
  constructor(config?: AIConfig) {
    this.config = mergeConfig(config);
  }

  /**
   * Get the best move (randomly selected)
   *
   * @param game - Current game state
   * @returns Promise resolving to a random legal move
   */
  public async getBestMove(game: Game): Promise<Move> {
    const startTime = Date.now();
    const legalMoves = game.getLegalMoves();

    if (legalMoves.length === 0) {
      throw new Error('No legal moves available');
    }

    // Simple random selection
    const randomIndex = Math.floor(Math.random() * legalMoves.length);
    const move = legalMoves[randomIndex]!;

    // Simulate some "thinking time" to make it feel more natural
    const thinkingTime = Date.now() - startTime;
    const minThinkingTime = 100; // At least 100ms
    if (thinkingTime < minThinkingTime) {
      await this.sleep(minThinkingTime - thinkingTime);
    }

    return move;
  }

  /**
   * Analyze position (simplified for random AI)
   *
   * @param game - Current game state
   * @returns Analysis result with random move
   */
  public async analyze(game: Game): Promise<AIAnalysis> {
    const startTime = Date.now();
    const legalMoves = game.getLegalMoves();

    if (legalMoves.length === 0) {
      throw new Error('No legal moves available');
    }

    // Pick random move
    const randomIndex = Math.floor(Math.random() * legalMoves.length);
    const bestMove = legalMoves[randomIndex]!;

    const thinkingTime = Date.now() - startTime;

    return {
      bestMove,
      score: 0, // Random AI doesn't evaluate positions
      thinkingTime,
      depth: 0, // No search depth
      nodesEvaluated: legalMoves.length, // Only looked at available moves
    };
  }

  /**
   * Evaluate a specific move (random score)
   *
   * @param _game - Current game state (unused)
   * @param move - Move to evaluate
   * @returns Move evaluation with random score
   */
  public async evaluateMove(_game: Game, move: Move): Promise<MoveEvaluation> {
    return {
      move,
      score: Math.random() * 200 - 100, // Random score between -100 and +100
      depth: 0,
      nodesEvaluated: 1,
    };
  }

  /**
   * Sleep for a given duration
   *
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
