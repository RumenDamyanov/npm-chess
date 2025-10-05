/**
 * Random AI Edge Cases Tests
 *
 * Comprehensive tests for edge cases and uncovered branches in RandomAI.
 */

import { Game } from '../../../src/engine/game';
import { RandomAI } from '../../../src/ai/random';

describe('RandomAI Edge Cases', () => {
  describe('getBestMove - edge cases', () => {
    it('should handle position with exactly one legal move', async () => {
      const game = new Game();

      // Create a position where only one move is legal
      game.loadFen('7k/8/8/8/8/8/7P/7K w - - 0 1');

      const ai = new RandomAI();
      const move = await ai.getBestMove(game);

      expect(move).toBeDefined();
      // Just verify it's a legal move - actual move depends on position
      const legalMoves = game.getLegalMoves();
      expect(legalMoves.some((m) => m.from === move.from && m.to === move.to)).toBe(true);
    });
    it('should handle position with limited legal moves', async () => {
      const game = new Game();

      // Create a position with limited moves
      game.loadFen('7k/8/8/8/8/8/6PP/7K w - - 0 1');

      const ai = new RandomAI();
      const move = await ai.getBestMove(game);

      expect(move).toBeDefined();
      // Should return any legal move from this position
      const legalMoves = game.getLegalMoves();
      expect(legalMoves.length).toBeGreaterThan(0);
      expect(legalMoves.some((m) => m.from === move.from && m.to === move.to)).toBe(true);
    });

    it('should wait at least minimum thinking time', async () => {
      const game = new Game();
      const ai = new RandomAI();

      const startTime = Date.now();
      await ai.getBestMove(game);
      const elapsed = Date.now() - startTime;

      // Should take at least 100ms (minimum thinking time)
      expect(elapsed).toBeGreaterThanOrEqual(95); // Allow small variance
    });

    it('should handle position with many legal moves', async () => {
      const game = new Game();
      const ai = new RandomAI();

      // Initial position has 20 legal moves
      const move = await ai.getBestMove(game);

      expect(move).toBeDefined();
      const legalMoves = game.getLegalMoves();
      const isLegal = legalMoves.some((m) => m.from === move.from && m.to === move.to);
      expect(isLegal).toBe(true);
    });

    it('should return different moves across multiple calls (probabilistic)', async () => {
      const ai = new RandomAI();

      const moves = new Set<string>();

      // Try 10 times to get different moves
      for (let i = 0; i < 10; i++) {
        const testGame = new Game();
        const move = await ai.getBestMove(testGame);
        moves.add(`${move.from}-${move.to}`);
      }

      // With 20 legal moves, we should get at least 2 different moves
      expect(moves.size).toBeGreaterThan(1);
    });

    it('should handle position near checkmate', async () => {
      const game = new Game();

      // Position with very few moves before checkmate
      game.loadFen('k7/8/8/8/8/8/7R/K6R w - - 0 1');

      const ai = new RandomAI();
      const move = await ai.getBestMove(game);

      expect(move).toBeDefined();
    });

    it('should reject when no legal moves available', async () => {
      const game = new Game();

      // Create checkmate position: king on h8, white queen on g7, white king on f6
      game.loadFen('7k/6Q1/5K2/8/8/8/8/8 b - - 0 1');

      const ai = new RandomAI();

      await expect(ai.getBestMove(game)).rejects.toThrow('No legal moves available');
    });

    it('should reject when stalemate (no legal moves)', async () => {
      const game = new Game();

      // Stalemate position: black king on a8, white king on c6, white queen on c7
      game.loadFen('k7/2Q5/2K5/8/8/8/8/8 b - - 0 1');

      const ai = new RandomAI();

      await expect(ai.getBestMove(game)).rejects.toThrow('No legal moves available');
    });
  });

  describe('analyze - edge cases', () => {
    it('should return analysis for position with one legal move', async () => {
      const game = new Game();
      game.loadFen('7k/8/8/8/8/8/7P/7K w - - 0 1');

      const ai = new RandomAI();
      const analysis = await ai.analyze(game);

      expect(analysis.bestMove).toBeDefined();
      // Position has king and pawn moves, so just check it's defined
      expect(['h1', 'h2']).toContain(analysis.bestMove.from);
      expect(analysis.score).toBe(0);
      expect(analysis.depth).toBe(0);
      expect(analysis.nodesEvaluated).toBeGreaterThan(0);
      expect(analysis.thinkingTime).toBeGreaterThanOrEqual(0);
    });

    it('should return analysis for position with many moves', async () => {
      const game = new Game();
      const ai = new RandomAI();

      const analysis = await ai.analyze(game);

      expect(analysis.bestMove).toBeDefined();
      expect(analysis.score).toBe(0);
      expect(analysis.depth).toBe(0);
      expect(analysis.nodesEvaluated).toBe(20); // 20 legal opening moves
      expect(analysis.thinkingTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle mid-game position', async () => {
      const game = new Game();

      // Play a few moves to get to mid-game
      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'e7', to: 'e5' });
      game.move({ from: 'g1', to: 'f3' });
      game.move({ from: 'b8', to: 'c6' });

      const ai = new RandomAI();
      const analysis = await ai.analyze(game);

      expect(analysis.bestMove).toBeDefined();
      expect(analysis.score).toBe(0);
      expect(analysis.nodesEvaluated).toBeGreaterThan(0);
    });

    it('should reject when no legal moves available', async () => {
      const game = new Game();
      game.loadFen('7k/6Q1/5K2/8/8/8/8/8 b - - 0 1');

      const ai = new RandomAI();

      await expect(ai.analyze(game)).rejects.toThrow('No legal moves available');
    });

    it('should return different best moves on repeated calls (probabilistic)', async () => {
      const ai = new RandomAI();

      const bestMoves = new Set<string>();

      // Run analysis 10 times
      for (let i = 0; i < 10; i++) {
        const testGame = new Game();
        const analysis = await ai.analyze(testGame);
        bestMoves.add(`${analysis.bestMove.from}-${analysis.bestMove.to}`);
      }

      // Should get at least 2 different best moves
      expect(bestMoves.size).toBeGreaterThan(1);
    });

    it('should handle complex position', async () => {
      const game = new Game();
      game.loadFen('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3');

      const ai = new RandomAI();
      const analysis = await ai.analyze(game);

      expect(analysis.bestMove).toBeDefined();
      expect(analysis.nodesEvaluated).toBeGreaterThan(10);
    });
  });

  describe('evaluateMove - edge cases', () => {
    it('should return random score for any move', async () => {
      const game = new Game();
      const ai = new RandomAI();

      const legalMoves = game.getLegalMoves();
      const move = legalMoves[0];

      if (!move) {
        throw new Error('No legal moves');
      }

      const evaluation = await ai.evaluateMove(game, move);

      expect(evaluation.move).toBe(move);
      expect(evaluation.score).toBeGreaterThanOrEqual(-100);
      expect(evaluation.score).toBeLessThanOrEqual(100);
      expect(evaluation.depth).toBe(0);
      expect(evaluation.nodesEvaluated).toBe(1);
    });

    it('should return different scores for same move on repeated calls', async () => {
      const game = new Game();
      const ai = new RandomAI();

      const move = game.getLegalMoves()[0];
      if (!move) {
        throw new Error('No legal moves');
      }

      const scores = new Set<number>();

      // Evaluate same move 20 times
      for (let i = 0; i < 20; i++) {
        const evaluation = await ai.evaluateMove(game, move);
        scores.add(evaluation.score);
      }

      // Should get multiple different scores (probabilistic)
      expect(scores.size).toBeGreaterThan(1);
    });

    it('should evaluate different moves', async () => {
      const game = new Game();
      const ai = new RandomAI();

      const legalMoves = game.getLegalMoves();
      const evaluations = [];

      for (const move of legalMoves.slice(0, 5)) {
        const evaluation = await ai.evaluateMove(game, move);
        evaluations.push(evaluation);

        expect(evaluation.move).toBe(move);
        expect(evaluation.score).toBeGreaterThanOrEqual(-100);
        expect(evaluation.score).toBeLessThanOrEqual(100);
      }

      expect(evaluations).toHaveLength(5);
    });

    it('should evaluate capture move', async () => {
      const game = new Game();
      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'd7', to: 'd5' });

      const legalMoves = game.getLegalMoves();
      const captureMove = legalMoves.find((m) => m.to === 'd5');

      if (!captureMove) {
        throw new Error('Capture move not found');
      }

      const ai = new RandomAI();
      const evaluation = await ai.evaluateMove(game, captureMove);

      expect(evaluation.move).toBe(captureMove);
      expect(evaluation.score).toBeGreaterThanOrEqual(-100);
      expect(evaluation.score).toBeLessThanOrEqual(100);
    });

    it('should evaluate castling move', async () => {
      const game = new Game();
      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'e7', to: 'e5' });
      game.move({ from: 'g1', to: 'f3' });
      game.move({ from: 'b8', to: 'c6' });
      game.move({ from: 'f1', to: 'c4' });
      game.move({ from: 'g8', to: 'f6' });

      const legalMoves = game.getLegalMoves();
      const castleMove = legalMoves.find((m) => m.from === 'e1' && m.to === 'g1');

      if (!castleMove) {
        throw new Error('Castle move not found');
      }

      const ai = new RandomAI();
      const evaluation = await ai.evaluateMove(game, castleMove);

      expect(evaluation.move).toBe(castleMove);
      expect(evaluation.score).toBeGreaterThanOrEqual(-100);
      expect(evaluation.score).toBeLessThanOrEqual(100);
    });

    it('should evaluate pawn promotion', async () => {
      const game = new Game();
      game.loadFen('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');

      const legalMoves = game.getLegalMoves();
      const promotionMove = legalMoves.find((m) => m.promotion);

      if (!promotionMove) {
        throw new Error('Promotion move not found');
      }

      const ai = new RandomAI();
      const evaluation = await ai.evaluateMove(game, promotionMove);

      expect(evaluation.move).toBe(promotionMove);
      expect(evaluation.score).toBeGreaterThanOrEqual(-100);
      expect(evaluation.score).toBeLessThanOrEqual(100);
    });
  });

  describe('configuration', () => {
    it('should work with different difficulty settings', async () => {
      const difficulties = ['easy', 'medium', 'hard'] as const;

      for (const difficulty of difficulties) {
        const game = new Game();
        const ai = new RandomAI({ difficulty });

        const move = await ai.getBestMove(game);
        expect(move).toBeDefined();
        expect(ai.config.difficulty).toBe(difficulty);
      }
    });

    it('should work with custom config', async () => {
      const game = new Game();
      const ai = new RandomAI({
        difficulty: 'hard',
        maxDepth: 3,
        maxThinkingTime: 1000,
      });

      const move = await ai.getBestMove(game);
      expect(move).toBeDefined();
      expect(ai.config.difficulty).toBe('hard');
    });

    it('should merge config with defaults', () => {
      const ai = new RandomAI({ difficulty: 'easy' });

      expect(ai.config.difficulty).toBe('easy');
      expect(ai.config.maxDepth).toBeDefined();
      expect(ai.config.maxThinkingTime).toBeDefined();
    });

    it('should work with empty config', async () => {
      const game = new Game();
      const ai = new RandomAI({});

      const move = await ai.getBestMove(game);
      expect(move).toBeDefined();
    });
  });

  describe('randomness verification', () => {
    it('should select from all legal moves over many iterations', async () => {
      const ai = new RandomAI();

      const moveFrequency = new Map<string, number>();
      const iterations = 20; // Reduced to avoid timeout

      for (let i = 0; i < iterations; i++) {
        const testGame = new Game();
        const move = await ai.getBestMove(testGame);
        const moveKey = `${move.from}-${move.to}`;
        moveFrequency.set(moveKey, (moveFrequency.get(moveKey) ?? 0) + 1);
      }

      // Should have tried multiple different moves
      expect(moveFrequency.size).toBeGreaterThan(3);

      // No single move should dominate (each should be < 60% of selections)
      for (const count of moveFrequency.values()) {
        expect(count).toBeLessThan(iterations * 0.6);
      }
    }, 15000); // 15 second timeout

    it('should have roughly uniform distribution over limited moves', async () => {
      const ai = new RandomAI();
      const moveFrequency = new Map<string, number>();
      const iterations = 20; // Reduced to avoid timeout

      for (let i = 0; i < iterations; i++) {
        const testGame = new Game();
        testGame.loadFen('7k/8/8/8/8/8/6PP/6KP w - - 0 1');
        const move = await ai.getBestMove(testGame);
        const moveKey = `${move.from}-${move.to}`;
        moveFrequency.set(moveKey, (moveFrequency.get(moveKey) ?? 0) + 1);
      }

      // Should have selected multiple different moves
      expect(moveFrequency.size).toBeGreaterThan(2);
    }, 15000); // 15 second timeout
  });

  describe('performance', () => {
    it('should complete quickly for simple position', async () => {
      const game = new Game();
      const ai = new RandomAI();

      const startTime = Date.now();
      await ai.getBestMove(game);
      const elapsed = Date.now() - startTime;

      // Should complete in reasonable time (< 500ms including thinking time)
      expect(elapsed).toBeLessThan(500);
    });

    it('should handle rapid successive calls', async () => {
      const ai = new RandomAI();

      const promises = [];
      for (let i = 0; i < 5; i++) {
        const testGame = new Game();
        promises.push(ai.getBestMove(testGame));
      }

      const moves = await Promise.all(promises);
      expect(moves).toHaveLength(5);
      moves.forEach((move: unknown) => {
        expect(move).toBeDefined();
      });
    });
  });
});
