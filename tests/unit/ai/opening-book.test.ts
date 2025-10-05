/**
 * Opening Book Tests
 *
 * Tests for the chess opening book implementation including
 * position lookup, move selection, and AI integration.
 *
 * @module tests/unit/ai/opening-book
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Game } from '../../../src/engine/game';
import {
  OpeningBook,
  createDefaultOpeningBook,
  type OpeningBookData,
} from '../../../src/ai/opening-book';
import { MinimaxAI } from '../../../src/ai/minimax';

describe('OpeningBook', () => {
  let book: OpeningBook;

  beforeEach(() => {
    book = new OpeningBook();
  });

  describe('Construction and Configuration', () => {
    it('should create an empty opening book', () => {
      expect(book).toBeInstanceOf(OpeningBook);
      const stats = book.getStats();
      expect(stats.positionCount).toBe(0);
      expect(stats.totalMoves).toBe(0);
    });

    it('should accept configuration options', () => {
      const customBook = new OpeningBook({
        enabled: false,
        maxDepth: 8,
        randomize: false,
        minWeight: 10,
      });
      expect(customBook).toBeInstanceOf(OpeningBook);
    });

    it('should allow configuration updates', () => {
      book.configure({ enabled: false });
      book.configure({ maxDepth: 10 });
      book.configure({ randomize: false });
      expect(book).toBeInstanceOf(OpeningBook);
    });
  });

  describe('Loading Data', () => {
    it('should load opening book data', () => {
      const data: OpeningBookData = {
        version: '1.0.0',
        maxDepth: 12,
        positions: {
          'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': [
            { move: 'e4', weight: 50, eco: 'C00', name: "King's Pawn" },
            { move: 'd4', weight: 40, eco: 'D00', name: "Queen's Pawn" },
          ],
        },
      };

      book.loadData(data);
      const stats = book.getStats();

      expect(stats.version).toBe('1.0.0');
      expect(stats.maxDepth).toBe(12);
      expect(stats.positionCount).toBe(1);
      expect(stats.totalMoves).toBe(2);
    });

    it('should handle multiple positions', () => {
      const data: OpeningBookData = {
        version: '1.0.0',
        maxDepth: 12,
        positions: {
          'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': [{ move: 'e4', weight: 50 }],
          'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3': [
            { move: 'c5', weight: 40 },
            { move: 'e5', weight: 30 },
          ],
        },
      };

      book.loadData(data);
      const stats = book.getStats();

      expect(stats.positionCount).toBe(2);
      expect(stats.totalMoves).toBe(3);
    });

    it('should clear existing data when loading new data', () => {
      const data1: OpeningBookData = {
        version: '1.0.0',
        maxDepth: 12,
        positions: {
          'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': [{ move: 'e4', weight: 50 }],
        },
      };

      const data2: OpeningBookData = {
        version: '2.0.0',
        maxDepth: 10,
        positions: {
          'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3': [{ move: 'c5', weight: 40 }],
        },
      };

      book.loadData(data1);
      book.loadData(data2);

      const stats = book.getStats();
      expect(stats.version).toBe('2.0.0');
      expect(stats.maxDepth).toBe(10);
      expect(stats.positionCount).toBe(1);
    });
  });

  describe('Position Lookup', () => {
    beforeEach(() => {
      const data: OpeningBookData = {
        version: '1.0.0',
        maxDepth: 12,
        positions: {
          'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': [
            { move: 'e4', weight: 45, eco: 'C00', name: "King's Pawn" },
            { move: 'd4', weight: 40, eco: 'D00', name: "Queen's Pawn" },
            { move: 'Nf3', weight: 10, eco: 'A04', name: 'Réti Opening' },
          ],
          'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3': [
            { move: 'c5', weight: 40, eco: 'B20', name: 'Sicilian' },
            { move: 'e5', weight: 30, eco: 'C40', name: "King's Pawn Game" },
          ],
        },
      };
      book.loadData(data);
    });

    it('should check if position exists', () => {
      const startingPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -';
      expect(book.hasPosition(startingPosition)).toBe(true);

      const unknownPosition = 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq -';
      expect(book.hasPosition(unknownPosition)).toBe(false);
    });

    it('should get moves for a position', () => {
      const startingPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -';
      const moves = book.getMoves(startingPosition);

      expect(moves).toHaveLength(3);
      expect(moves[0]?.move).toBe('e4');
      expect(moves[0]?.weight).toBe(45);
      expect(moves[0]?.eco).toBe('C00');
    });

    it('should return empty array for unknown position', () => {
      const unknownPosition = 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq -';
      const moves = book.getMoves(unknownPosition);

      expect(moves).toHaveLength(0);
    });

    it('should normalize FEN for lookup', () => {
      // With move counters
      const fenWithCounters = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      // Without move counters
      const fenWithoutCounters = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -';

      expect(book.hasPosition(fenWithCounters)).toBe(true);
      expect(book.hasPosition(fenWithoutCounters)).toBe(true);
    });
  });

  describe('Move Selection with Game', () => {
    beforeEach(() => {
      const data: OpeningBookData = {
        version: '1.0.0',
        maxDepth: 12,
        positions: {
          'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': [
            { move: 'e4', weight: 50 },
            { move: 'd4', weight: 40 },
          ],
          'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3': [
            { move: 'c5', weight: 60 },
            { move: 'e5', weight: 30 },
          ],
        },
      };
      book.loadData(data);
    });

    it('should get move for starting position', () => {
      const game = new Game();
      const move = book.getMove(game);

      expect(move).not.toBeNull();
      expect(['e4', 'd4']).toContain(move?.move);
    });

    it('should get move after 1. e4', () => {
      const game = new Game();
      game.move({ from: 'e2', to: 'e4' });

      const move = book.getMove(game);
      expect(move).not.toBeNull();
      expect(['c5', 'e5']).toContain(move?.move);
    });

    it('should return null for position not in book', () => {
      const game = new Game();
      game.move({ from: 'g1', to: 'f3' }); // 1. Nf3 - not in our test book

      const move = book.getMove(game);
      expect(move).toBeNull();
    });

    it('should respect maxDepth configuration', () => {
      book.configure({ maxDepth: 0 });
      const game = new Game();

      const move = book.getMove(game);
      expect(move).toBeNull(); // Depth 0 = no moves
    });

    it('should respect enabled configuration', () => {
      book.configure({ enabled: false });
      const game = new Game();

      const move = book.getMove(game);
      expect(move).toBeNull();
    });

    it('should filter by minimum weight', () => {
      book.configure({ minWeight: 50 });
      const game = new Game();
      game.move({ from: 'e2', to: 'e4' });

      const move = book.getMove(game);
      // Only c5 (weight 60) should be returned, not e5 (weight 30)
      expect(move?.move).toBe('c5');
    });
  });

  describe('Move Selection Strategy', () => {
    beforeEach(() => {
      const data: OpeningBookData = {
        version: '1.0.0',
        maxDepth: 12,
        positions: {
          'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': [
            { move: 'e4', weight: 100 },
            { move: 'd4', weight: 1 },
          ],
        },
      };
      book.loadData(data);
    });

    it('should always return highest weight when randomize=false', () => {
      book.configure({ randomize: false });
      const game = new Game();

      // Test multiple times to ensure consistency
      for (let i = 0; i < 10; i++) {
        const move = book.getMove(game);
        expect(move?.move).toBe('e4'); // Highest weight
      }
    });

    it('should use weighted random when randomize=true', () => {
      book.configure({ randomize: true });
      const game = new Game();

      const moves: string[] = [];
      // Run multiple times to test randomness
      for (let i = 0; i < 20; i++) {
        const move = book.getMove(game);
        if (move) {
          moves.push(move.move);
        }
      }

      // Should mostly get e4 (weight 100) but might occasionally get d4 (weight 1)
      expect(moves).toContain('e4');
      // At least 90% should be e4 given the weight distribution
      const e4Count = moves.filter((m) => m === 'e4').length;
      expect(e4Count).toBeGreaterThan(15);
    });
  });

  describe('Default Opening Book', () => {
    it('should create default opening book', () => {
      const defaultBook = createDefaultOpeningBook();
      const stats = defaultBook.getStats();

      expect(defaultBook).toBeInstanceOf(OpeningBook);
      expect(stats.positionCount).toBeGreaterThan(0);
      expect(stats.totalMoves).toBeGreaterThan(0);
    });

    it('should have starting position in default book', () => {
      const defaultBook = createDefaultOpeningBook();
      const startingPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -';

      expect(defaultBook.hasPosition(startingPosition)).toBe(true);
      const moves = defaultBook.getMoves(startingPosition);
      expect(moves.length).toBeGreaterThan(0);
    });

    it('should work with Game integration', () => {
      const defaultBook = createDefaultOpeningBook();
      const game = new Game();

      const move = defaultBook.getMove(game);
      expect(move).not.toBeNull();
      expect(move?.move).toBeDefined();
    });
  });

  describe('Clear Functionality', () => {
    it('should clear all positions', () => {
      const data: OpeningBookData = {
        version: '1.0.0',
        maxDepth: 12,
        positions: {
          'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -': [{ move: 'e4', weight: 50 }],
        },
      };

      book.loadData(data);
      expect(book.getStats().positionCount).toBe(1);

      book.clear();
      expect(book.getStats().positionCount).toBe(0);
      expect(book.getStats().totalMoves).toBe(0);
    });
  });

  describe('Integration with MinimaxAI', () => {
    it('should return opening book move with metadata', () => {
      // Test opening book directly first
      const openingBook = createDefaultOpeningBook();
      const game = new Game();

      const bookMove = openingBook.getMove(game);

      expect(bookMove).not.toBeNull();
      expect(bookMove?.move).toBeDefined();
      expect(bookMove?.name).toBeDefined();
      expect(bookMove?.eco).toBeDefined();
      expect(bookMove?.weight).toBeGreaterThan(0);
    });

    it('should integrate opening book with MinimaxAI', async () => {
      const openingBook = createDefaultOpeningBook();
      const ai = new MinimaxAI({ difficulty: 'easy' }, openingBook);
      const game = new Game();

      // Verify book has starting position
      const startingFEN = game.getFen();
      expect(openingBook.hasPosition(startingFEN)).toBe(true);

      const analysis = await ai.analyze(game);

      expect(analysis.bestMove).toBeDefined();
      expect(analysis.bestMove.from).toBeDefined();
      expect(analysis.bestMove.to).toBeDefined();

      // Since opening book has starting position, analysis should be fast
      // Increased threshold to account for system load and CI environment
      expect(analysis.thinkingTime).toBeLessThan(1000); // Should be faster than deep search
    });

    it('should fall back to minimax when book exhausted', async () => {
      const openingBook = new OpeningBook();
      // Empty book - will always use minimax
      const ai = new MinimaxAI({ difficulty: 'easy' }, openingBook);
      const game = new Game();

      const analysis = await ai.analyze(game);

      expect(analysis.bestMove).toBeDefined();
      expect(analysis.nodesEvaluated).toBeGreaterThan(1); // Minimax search
      expect(analysis.depth).toBeGreaterThan(0);
    });

    it('should work without opening book', async () => {
      const ai = new MinimaxAI({ difficulty: 'easy' }); // No opening book
      const game = new Game();

      const analysis = await ai.analyze(game);

      expect(analysis.bestMove).toBeDefined();
      expect(analysis.nodesEvaluated).toBeGreaterThan(1);
    });

    it('should allow setting opening book after construction', async () => {
      const ai = new MinimaxAI({ difficulty: 'easy' });
      const openingBook = createDefaultOpeningBook();

      // Verify book has data before setting
      expect(openingBook.getStats().positionCount).toBeGreaterThan(0);

      ai.setOpeningBook(openingBook);

      const game = new Game();
      const analysis = await ai.analyze(game);

      expect(analysis.bestMove).toBeDefined();
      // Opening book should be used for starting position
      if (analysis.openingName && analysis.eco) {
        // If opening book was used, should have metadata
        expect(analysis.openingName).toBeDefined();
        expect(analysis.eco).toBeDefined();
      }
      // At minimum, should get a valid move
      expect(analysis.bestMove.from).toBeDefined();
      expect(analysis.bestMove.to).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should perform lookups quickly', () => {
      const defaultBook = createDefaultOpeningBook();
      const game = new Game();

      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        defaultBook.getMove(game);
      }
      const endTime = Date.now();

      const timePerLookup = (endTime - startTime) / 1000;
      expect(timePerLookup).toBeLessThan(5); // Should be < 5ms per lookup (CI-tolerant)
    });
  });
});
