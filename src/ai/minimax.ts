/**
 * Minimax AI Engine with Alpha-Beta Pruning
 *
 * Implements the minimax algorithm with alpha-beta pruning for efficient
 * chess move search. Supports configurable search depth and difficulty levels.
 *
 * @module ai/minimax
 */

import type { Move } from '@/types/index';
import type { Game } from '@/engine/game';
import type { AIEngine, AIConfig, AIAnalysis, MoveEvaluation } from './engine';
import { mergeConfig } from './engine';
import { evaluateBoard } from './evaluation';
import type { OpeningBook } from './opening-book';

/**
 * Search statistics
 */
interface SearchStats {
  nodesEvaluated: number;
  pruneCount: number;
  maxDepthReached: number;
}

/**
 * Minimax AI Engine
 * 
 * Uses minimax algorithm with alpha-beta pruning to search the game tree
 * and find the best move. Evaluates positions using material and positional
 * evaluation functions.
 */
export class MinimaxAI implements AIEngine {
  public readonly name = 'Minimax';
  public readonly config: Required<AIConfig>;
  private openingBook?: OpeningBook;

  private stats: SearchStats = {
    nodesEvaluated: 0,
    pruneCount: 0,
    maxDepthReached: 0,
  };

  /**
   * Create a new Minimax AI engine
   *
   * @param config - AI configuration
   * @param openingBook - Optional opening book for opening phase
   */
  constructor(config?: AIConfig, openingBook?: OpeningBook) {
    this.config = mergeConfig(config);
    this.openingBook = openingBook;
  }

  /**
   * Set opening book for this AI instance
   *
   * @param book - Opening book to use
   */
  public setOpeningBook(book: OpeningBook | undefined): void {
    this.openingBook = book;
  }

  /**
   * Get the best move using minimax with alpha-beta pruning
   *
   * @param game - Current game state
   * @returns Promise resolving to the best move found
   */
  public async getBestMove(game: Game): Promise<Move> {
    const analysis = await this.analyze(game);
    return analysis.bestMove;
  }

  /**
   * Analyze position and return best move with evaluation
   *
   * @param game - Current game state
   * @returns Analysis result
   */
  public async analyze(game: Game): Promise<AIAnalysis> {
    const startTime = Date.now();
    
    // Check opening book first (if available)
    if (this.openingBook) {
      const bookMove = this.openingBook.getMove(game);
      if (bookMove) {
        // Convert the opening book move notation to a Move object
        const legalMoves = game.getLegalMoves();
        const matchingMove = legalMoves.find((m) => m.san === bookMove.move);
        
        if (matchingMove) {
          return {
            bestMove: matchingMove,
            score: 0,
            thinkingTime: Date.now() - startTime,
            depth: 0,
            nodesEvaluated: 1,
            openingName: bookMove.name,
            eco: bookMove.eco,
          };
        }
      }
    }
    
    // Reset stats
    this.stats = {
      nodesEvaluated: 0,
      pruneCount: 0,
      maxDepthReached: 0,
    };

    const legalMoves = game.getLegalMoves();
    if (legalMoves.length === 0) {
      throw new Error('No legal moves available');
    }

    // Only one legal move? Return it immediately
    if (legalMoves.length === 1) {
      return {
        bestMove: legalMoves[0]!,
        score: 0,
        thinkingTime: Date.now() - startTime,
        depth: 0,
        nodesEvaluated: 1,
      };
    }

    const maximizingPlayer = game.getTurn() === 'white';
    const evaluations: MoveEvaluation[] = [];

    // Evaluate each legal move
    for (const move of legalMoves) {
      // Make the move
      const gameCopy = this.cloneGame(game);
      gameCopy.move(move);

      // Search deeper from this position
      const score = this.minimax(
        gameCopy,
        this.config.maxDepth - 1,
        -Infinity,
        Infinity,
        !maximizingPlayer,
        startTime
      );

      evaluations.push({
        move,
        score,
        depth: this.config.maxDepth,
        nodesEvaluated: this.stats.nodesEvaluated,
      });

      // Check time limit
      if (Date.now() - startTime > this.config.maxThinkingTime) {
        break;
      }
    }

    // Sort moves by score
    evaluations.sort((a, b) => {
      if (maximizingPlayer) {
        return b.score - a.score; // Higher is better for white
      } else {
        return a.score - b.score; // Lower is better for black
      }
    });

    // Apply randomness for lower difficulties
    let bestMove: Move;
    if (this.config.randomness > 0 && Math.random() < this.config.randomness) {
      // Pick a random move from top moves
      const topCount = Math.min(3, evaluations.length);
      const randomIndex = Math.floor(Math.random() * topCount);
      bestMove = evaluations[randomIndex]!.move;
    } else {
      bestMove = evaluations[0]!.move;
    }

    const thinkingTime = Date.now() - startTime;

    return {
      bestMove,
      score: evaluations[0]!.score,
      thinkingTime,
      depth: this.stats.maxDepthReached,
      nodesEvaluated: this.stats.nodesEvaluated,
      topMoves: evaluations.slice(0, 5), // Top 5 moves
    };
  }

  /**
   * Minimax algorithm with alpha-beta pruning
   *
   * @param game - Current game state
   * @param depth - Remaining search depth
   * @param alpha - Alpha value for pruning
   * @param beta - Beta value for pruning
   * @param maximizingPlayer - True if maximizing player (white)
   * @param startTime - Search start time for time management
   * @returns Best score for this position
   */
  private minimax(
    game: Game,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: boolean,
    startTime: number
  ): number {
    this.stats.nodesEvaluated++;
    this.stats.maxDepthReached = Math.max(
      this.stats.maxDepthReached,
      this.config.maxDepth - depth
    );

    // Terminal conditions
    const status = game.getStatus();
    if (status === 'checkmate') {
      // Checkmate is very bad/good depending on side
      return maximizingPlayer ? -10000 + (this.config.maxDepth - depth) : 10000 - (this.config.maxDepth - depth);
    }
    if (status === 'stalemate' || status === 'draw') {
      return 0; // Draw is neutral
    }

    // Depth limit reached or time up
    if (depth === 0 || Date.now() - startTime > this.config.maxThinkingTime) {
      return evaluateBoard(game.getBoard(), 'white');
    }

    const legalMoves = game.getLegalMoves();
    if (legalMoves.length === 0) {
      return 0; // No moves (shouldn't happen, but defensive)
    }

    if (maximizingPlayer) {
      let maxEval = -Infinity;

      for (const move of legalMoves) {
        const gameCopy = this.cloneGame(game);
        gameCopy.move(move);

        const evaluation = this.minimax(
          gameCopy,
          depth - 1,
          alpha,
          beta,
          false,
          startTime
        );

        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);

        // Beta cutoff (pruning)
        if (beta <= alpha) {
          this.stats.pruneCount++;
          break;
        }

        // Time check
        if (Date.now() - startTime > this.config.maxThinkingTime) {
          break;
        }
      }

      return maxEval;
    } else {
      let minEval = Infinity;

      for (const move of legalMoves) {
        const gameCopy = this.cloneGame(game);
        gameCopy.move(move);

        const evaluation = this.minimax(
          gameCopy,
          depth - 1,
          alpha,
          beta,
          true,
          startTime
        );

        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);

        // Alpha cutoff (pruning)
        if (beta <= alpha) {
          this.stats.pruneCount++;
          break;
        }

        // Time check
        if (Date.now() - startTime > this.config.maxThinkingTime) {
          break;
        }
      }

      return minEval;
    }
  }

  /**
   * Evaluate a specific move
   *
   * @param game - Current game state
   * @param move - Move to evaluate
   * @returns Move evaluation
   */
  public async evaluateMove(game: Game, move: Move): Promise<MoveEvaluation> {
    const gameCopy = this.cloneGame(game);
    gameCopy.move(move);

    const maximizingPlayer = game.getTurn() !== 'white';
    const score = this.minimax(
      gameCopy,
      this.config.maxDepth - 1,
      -Infinity,
      Infinity,
      maximizingPlayer,
      Date.now()
    );

    return {
      move,
      score,
      depth: this.config.maxDepth,
      nodesEvaluated: this.stats.nodesEvaluated,
    };
  }

  /**
   * Clone a game state for search
   * 
   * Creates a deep copy by exporting to FEN and loading it back.
   * This ensures complete isolation between search branches.
   *
   * @param game - Game to clone
   * @returns Cloned game
   */
  private cloneGame(game: Game): Game {
    // Clone by creating a new game from FEN string
    // This avoids circular dependency issues
    const fen = game.getFen();
    const GameClass = game.constructor as any;
    const cloned = new GameClass();
    cloned.loadFen(fen);
    return cloned;
  }
}
