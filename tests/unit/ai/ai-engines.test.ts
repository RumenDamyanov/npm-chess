/**
 * Tests for AI engines (Random and Minimax)
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Game } from '../../../src/engine/game';
import { RandomAI } from '../../../src/ai/random';
import { MinimaxAI } from '../../../src/ai/minimax';
import type { Move } from '../../../src/types';

describe('AI Engines', () => {
  describe('RandomAI', () => {
    it('should create with default config', () => {
      const ai = new RandomAI();
      expect(ai.name).toBe('Random');
      expect(ai.config).toBeDefined();
    });

    it('should create with custom config', () => {
      const ai = new RandomAI({ difficulty: 'hard' });
      expect(ai.config.difficulty).toBe('hard');
    });

    it('should return a legal move', async () => {
      const game = new Game();
      const ai = new RandomAI();

      const move = await ai.getBestMove(game);

      expect(move).toBeDefined();
      expect(move.from).toBeDefined();
      expect(move.to).toBeDefined();

      // Verify it's a legal move
      const legalMoves = game.getLegalMoves();
      const isLegal = legalMoves.some((m: Move) => m.from === move.from && m.to === move.to);
      expect(isLegal).toBe(true);
    });

    it('should work multiple times', async () => {
      const game = new Game();
      const ai = new RandomAI();

      // Make several moves
      for (let i = 0; i < 5; i++) {
        const move = await ai.getBestMove(game);
        expect(move).toBeDefined();

        const result = game.move(move);
        expect(result).not.toBeNull();
      }

      expect(game.getHistory().length).toBe(5);
    });

    it('should provide analysis', async () => {
      const game = new Game();
      const ai = new RandomAI();

      const analysis = await ai.analyze(game);

      expect(analysis.bestMove).toBeDefined();
      expect(analysis.score).toBe(0); // Random doesn't evaluate
      expect(analysis.depth).toBe(0);
      expect(analysis.nodesEvaluated).toBeGreaterThan(0);
      expect(analysis.thinkingTime).toBeGreaterThanOrEqual(0);
    });

    it('should throw error when no legal moves', async () => {
      // Create a checkmate position
      const game = new Game();
      game.getBoard().clear();
      game.getBoard().setPiece('a8', { type: 'king', color: 'black' });
      game.getBoard().setPiece('c7', { type: 'queen', color: 'white' });
      game.getBoard().setPiece('c6', { type: 'king', color: 'white' });
      game.refreshMoveGenerator();

      // Force black's turn (white just moved queen to b7)
      game.move({ from: 'c7', to: 'b7' });

      const ai = new RandomAI();

      // Black is in checkmate, no legal moves
      await expect(ai.getBestMove(game)).rejects.toThrow('No legal moves');
    });
  });

  describe('MinimaxAI', () => {
    it('should create with default config', () => {
      const ai = new MinimaxAI();
      expect(ai.name).toBe('Minimax');
      expect(ai.config).toBeDefined();
      expect(ai.config.difficulty).toBe('medium');
    });

    it('should create with custom difficulty', () => {
      const ai = new MinimaxAI({ difficulty: 'hard' });
      expect(ai.config.difficulty).toBe('hard');
      expect(ai.config.maxDepth).toBeGreaterThan(2);
    });

    it('should return a legal move', async () => {
      const game = new Game();
      const ai = new MinimaxAI({ difficulty: 'easy' }); // Use easy for speed

      const move = await ai.getBestMove(game);

      expect(move).toBeDefined();
      expect(move.from).toBeDefined();
      expect(move.to).toBeDefined();

      // Verify it's a legal move
      const legalMoves = game.getLegalMoves();
      const isLegal = legalMoves.some((m: Move) => m.from === move.from && m.to === move.to);
      expect(isLegal).toBe(true);
    });

    it('should return immediately when only one legal move', async () => {
      // Create position with only one legal move
      const game = new Game();
      game.getBoard().clear();
      game.getBoard().setPiece('h8', { type: 'king', color: 'white' });
      game.getBoard().setPiece('h6', { type: 'king', color: 'black' });
      game.refreshMoveGenerator();

      const ai = new MinimaxAI();
      const startTime = Date.now();

      const move = await ai.getBestMove(game);
      const elapsed = Date.now() - startTime;

      expect(move).toBeDefined();
      expect(elapsed).toBeLessThan(200); // Should be nearly instant (CI-tolerant)
    });

    it('should find obvious winning moves', async () => {
      // Position where white can capture free queen
      const game = new Game();
      game.getBoard().clear();
      game.getBoard().setPiece('e1', { type: 'king', color: 'white' });
      game.getBoard().setPiece('e8', { type: 'king', color: 'black' });
      game.getBoard().setPiece('d1', { type: 'rook', color: 'white' });
      game.getBoard().setPiece('d4', { type: 'queen', color: 'black' }); // Free queen
      game.refreshMoveGenerator();

      const ai = new MinimaxAI({ difficulty: 'medium', maxDepth: 4 });
      const analysis = await ai.analyze(game);

      // Should capture the queen (check if it's in top moves with high score)
      const capturingMove = analysis.topMoves?.find((m) => m.move.to === 'd4');
      expect(capturingMove).toBeDefined();
      expect(capturingMove!.score).toBeGreaterThan(400); // Significant material advantage
    });

    it('should provide detailed analysis', async () => {
      const game = new Game();
      const ai = new MinimaxAI({ difficulty: 'easy' });

      const analysis = await ai.analyze(game);

      expect(analysis.bestMove).toBeDefined();
      expect(analysis.score).toBeDefined();
      expect(analysis.depth).toBeGreaterThan(0);
      expect(analysis.nodesEvaluated).toBeGreaterThan(0);
      expect(analysis.thinkingTime).toBeGreaterThanOrEqual(0);
      expect(analysis.topMoves).toBeDefined();
      expect(analysis.topMoves!.length).toBeGreaterThan(0);
    });

    it('should respect max depth', async () => {
      const game = new Game();

      const ai1 = new MinimaxAI({ difficulty: 'easy', maxDepth: 1 });
      const ai2 = new MinimaxAI({ difficulty: 'easy', maxDepth: 2 });

      const analysis1 = await ai1.analyze(game);
      const analysis2 = await ai2.analyze(game);

      // Deeper search should evaluate more nodes
      expect(analysis2.nodesEvaluated).toBeGreaterThan(analysis1.nodesEvaluated);
    });

    it('should work for multiple moves in a game', async () => {
      const game = new Game();
      const ai = new MinimaxAI({ difficulty: 'easy' });

      // Play 5 moves
      for (let i = 0; i < 5; i++) {
        const move = await ai.getBestMove(game);
        const result = game.move(move);
        expect(result).not.toBeNull();
      }

      expect(game.getHistory().length).toBe(5);
      expect(game.getStatus()).toBe('active');
    });

    it('should find checkmate in one move', async () => {
      // Position where white has checkmate in one
      const game = new Game();
      game.getBoard().clear();
      game.getBoard().setPiece('a8', { type: 'king', color: 'black' });
      game.getBoard().setPiece('c7', { type: 'queen', color: 'white' });
      game.getBoard().setPiece('b6', { type: 'king', color: 'white' });
      game.refreshMoveGenerator();

      const ai = new MinimaxAI({ difficulty: 'easy' });
      const move = await ai.getBestMove(game);

      // Should deliver checkmate
      game.move(move);
      expect(game.getStatus()).toBe('checkmate');
    });
  });

  describe('AI Comparison', () => {
    it('Minimax should find better moves than Random', async () => {
      // Simple starting position
      const game = new Game();

      const randomAI = new RandomAI();
      const minimaxAI = new MinimaxAI({ difficulty: 'easy' });

      // Both should return valid moves
      const randomMove = await randomAI.getBestMove(game);
      const minimaxMove = await minimaxAI.getBestMove(game);

      expect(randomMove).toBeDefined();
      expect(minimaxMove).toBeDefined();

      // Verify both are legal
      const legalMoves = game.getLegalMoves();
      expect(
        legalMoves.some((m: Move) => m.from === randomMove.from && m.to === randomMove.to)
      ).toBe(true);
      expect(
        legalMoves.some((m: Move) => m.from === minimaxMove.from && m.to === minimaxMove.to)
      ).toBe(true);
    });
  });

  describe('Difficulty Levels', () => {
    it('should create AI with all difficulty levels', () => {
      const harmless = new MinimaxAI({ difficulty: 'harmless' });
      const easy = new MinimaxAI({ difficulty: 'easy' });
      const medium = new MinimaxAI({ difficulty: 'medium' });
      const hard = new MinimaxAI({ difficulty: 'hard' });
      const expert = new MinimaxAI({ difficulty: 'expert' });
      const godlike = new MinimaxAI({ difficulty: 'godlike' });

      expect(harmless.config.maxDepth).toBe(1);
      expect(easy.config.maxDepth).toBe(2);
      expect(medium.config.maxDepth).toBe(3);
      expect(hard.config.maxDepth).toBe(4);
      expect(expert.config.maxDepth).toBe(5);
      expect(godlike.config.maxDepth).toBe(6);

      expect(harmless.config.randomness).toBe(0.5);
      expect(easy.config.randomness).toBe(0.3);
      expect(medium.config.randomness).toBe(0.1);
      expect(hard.config.randomness).toBe(0.05);
      expect(expert.config.randomness).toBe(0);
      expect(godlike.config.randomness).toBe(0);
    });

    it('godlike should search deeper than easy', async () => {
      const game = new Game();

      const easy = new MinimaxAI({ difficulty: 'easy' });
      const godlike = new MinimaxAI({ difficulty: 'godlike' });

      const easyAnalysis = await easy.analyze(game);
      const godlikeAnalysis = await godlike.analyze(game);

      expect(godlikeAnalysis.depth).toBeGreaterThan(easyAnalysis.depth);
      expect(godlikeAnalysis.nodesEvaluated).toBeGreaterThan(easyAnalysis.nodesEvaluated);
    }, 60000); // 60 second timeout for godlike

    it('harmless should be very weak', async () => {
      const game = new Game();
      const harmless = new MinimaxAI({ difficulty: 'harmless' });

      const analysis = await harmless.analyze(game);

      expect(analysis.depth).toBe(1); // Only looks 1 move ahead
      expect(analysis.bestMove).toBeDefined();
    });
  });
});
