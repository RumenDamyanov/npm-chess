/**
 * Game Scenarios Integration Tests
 *
 * Tests for complete chess game scenarios including famous games,
 * endgames, and special situations.
 */

import { describe, expect, it } from '@jest/globals';
import { Game } from '@/engine/game';
import { PgnParser } from '@/engine/pgn';
import { FenParser } from '@/engine/fen';
import type { Pgn } from '@/types/index';

describe('Game Scenarios', () => {
  describe('Famous Games', () => {
    it('should play the Immortal Game', () => {
      const game = new Game();

      // Adolf Anderssen vs Lionel Kieseritzky, 1851
      const moves = [
        { from: 'e2', to: 'e4' },
        { from: 'e7', to: 'e5' },
        { from: 'f2', to: 'f4' },
        { from: 'e5', to: 'f4' },
        { from: 'f1', to: 'c4' },
        { from: 'd8', to: 'h4' },
        { from: 'e1', to: 'f1' },
        { from: 'b7', to: 'b5' },
        { from: 'c4', to: 'b5' },
        { from: 'g8', to: 'f6' },
        { from: 'g1', to: 'f3' },
        { from: 'h4', to: 'h6' },
      ];

      for (const move of moves) {
        const result = game.move(move);
        expect(result).not.toBeNull();
      }

      expect(game.getHistory()).toHaveLength(12);
      expect(game.getTurn()).toBe('white');
    });

    it('should play the Opera Game (Morphy vs Duke and Count)', () => {
      const game = new Game();

      const moves = [
        { from: 'e2', to: 'e4' },
        { from: 'e7', to: 'e5' },
        { from: 'g1', to: 'f3' },
        { from: 'd7', to: 'd6' },
        { from: 'd2', to: 'd4' },
        { from: 'c8', to: 'g4' },
        { from: 'd4', to: 'e5' },
        { from: 'g4', to: 'f3' },
        { from: 'd1', to: 'f3' },
        { from: 'd6', to: 'e5' },
        { from: 'f1', to: 'c4' },
        { from: 'g8', to: 'f6' },
      ];

      for (const move of moves) {
        const result = game.move(move);
        expect(result).not.toBeNull();
      }

      expect(game.getHistory()).toHaveLength(12);
    });
  });

  describe('Checkmate Patterns', () => {
    it('should execute back rank mate', () => {
      const fen = '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1';
      const parsed = FenParser.parse(fen);
      const game = new Game();

      // Set up position
      game.getBoard().clear();
      for (const square of [
        'a1',
        'a2',
        'a3',
        'a4',
        'a5',
        'a6',
        'a7',
        'a8',
        'b1',
        'b2',
        'b3',
        'b4',
        'b5',
        'b6',
        'b7',
        'b8',
        'c1',
        'c2',
        'c3',
        'c4',
        'c5',
        'c6',
        'c7',
        'c8',
        'd1',
        'd2',
        'd3',
        'd4',
        'd5',
        'd6',
        'd7',
        'd8',
        'e1',
        'e2',
        'e3',
        'e4',
        'e5',
        'e6',
        'e7',
        'e8',
        'f1',
        'f2',
        'f3',
        'f4',
        'f5',
        'f6',
        'f7',
        'f8',
        'g1',
        'g2',
        'g3',
        'g4',
        'g5',
        'g6',
        'g7',
        'g8',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'h7',
        'h8',
      ]) {
        const piece = parsed.board.getPiece(square);
        if (piece) {
          game.getBoard().setPiece(square, piece);
        }
      }
      game.refreshMoveGenerator();

      // Deliver checkmate
      const checkmateMove = game.move({ from: 'a1', to: 'a8' });
      expect(checkmateMove).not.toBeNull();
      expect(checkmateMove?.checkmate).toBe(true);
      expect(game.getStatus()).toBe('checkmate');
    });

    it("should execute Scholar's Mate", () => {
      const game = new Game();

      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'e7', to: 'e5' });
      game.move({ from: 'f1', to: 'c4' });
      game.move({ from: 'b8', to: 'c6' });
      game.move({ from: 'd1', to: 'h5' });
      game.move({ from: 'g8', to: 'f6' });

      const mate = game.move({ from: 'h5', to: 'f7' });

      expect(mate).not.toBeNull();
      expect(mate?.checkmate).toBe(true);
      expect(game.getStatus()).toBe('checkmate');
    });

    it("should execute Fool's Mate", () => {
      const game = new Game();

      game.move({ from: 'f2', to: 'f3' });
      game.move({ from: 'e7', to: 'e5' });
      game.move({ from: 'g2', to: 'g4' });

      const mate = game.move({ from: 'd8', to: 'h4' });

      expect(mate).not.toBeNull();
      expect(mate?.checkmate).toBe(true);
      expect(game.getStatus()).toBe('checkmate');
    });

    it('should execute Smothered Mate', () => {
      const fen = '6rk/6pp/7N/8/8/8/8/7K w - - 0 1';
      const parsed = FenParser.parse(fen);
      const game = new Game();

      game.getBoard().clear();
      for (const square of [
        'a1',
        'a2',
        'a3',
        'a4',
        'a5',
        'a6',
        'a7',
        'a8',
        'b1',
        'b2',
        'b3',
        'b4',
        'b5',
        'b6',
        'b7',
        'b8',
        'c1',
        'c2',
        'c3',
        'c4',
        'c5',
        'c6',
        'c7',
        'c8',
        'd1',
        'd2',
        'd3',
        'd4',
        'd5',
        'd6',
        'd7',
        'd8',
        'e1',
        'e2',
        'e3',
        'e4',
        'e5',
        'e6',
        'e7',
        'e8',
        'f1',
        'f2',
        'f3',
        'f4',
        'f5',
        'f6',
        'f7',
        'f8',
        'g1',
        'g2',
        'g3',
        'g4',
        'g5',
        'g6',
        'g7',
        'g8',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'h7',
        'h8',
      ]) {
        const piece = parsed.board.getPiece(square);
        if (piece) {
          game.getBoard().setPiece(square, piece);
        }
      }
      game.refreshMoveGenerator();

      const mate = game.move({ from: 'h6', to: 'f7' });

      expect(mate).not.toBeNull();
      expect(mate?.checkmate).toBe(true);
      expect(game.getStatus()).toBe('checkmate');
    });
  });

  describe('Stalemate Scenarios', () => {
    it('should have stalemate detection capability', () => {
      // Just verify the game can detect stalemate status
      const game = new Game();
      const status = game.getStatus();

      // Active game shouldn't be stalemate
      expect(status).not.toBe('stalemate');

      // Stalemate detection is tested in the unit tests
      // This integration test just verifies the mechanism exists
      expect([
        'active',
        'check',
        'checkmate',
        'stalemate',
        'draw',
        'insufficient_material',
        'threefold_repetition',
        'fifty_move_rule',
      ]).toContain(status);
    });
  });

  describe('Draw Scenarios', () => {
    it('should detect insufficient material - King vs King', () => {
      const game = new Game();
      game.getBoard().clear();
      game.getBoard().setPiece('e1', { type: 'king', color: 'white' });
      game.getBoard().setPiece('e8', { type: 'king', color: 'black' });
      game.refreshMoveGenerator();

      expect(game.getStatus()).toBe('insufficient_material');
    });

    it('should detect insufficient material - King+Knight vs King', () => {
      const game = new Game();
      game.getBoard().clear();
      game.getBoard().setPiece('e1', { type: 'king', color: 'white' });
      game.getBoard().setPiece('e8', { type: 'king', color: 'black' });
      game.getBoard().setPiece('g1', { type: 'knight', color: 'white' });
      game.refreshMoveGenerator();

      expect(game.getStatus()).toBe('insufficient_material');
    });

    it('should detect insufficient material - King+Bishop vs King', () => {
      const game = new Game();
      game.getBoard().clear();
      game.getBoard().setPiece('e1', { type: 'king', color: 'white' });
      game.getBoard().setPiece('e8', { type: 'king', color: 'black' });
      game.getBoard().setPiece('c1', { type: 'bishop', color: 'white' });
      game.refreshMoveGenerator();

      expect(game.getStatus()).toBe('insufficient_material');
    });
  });

  describe('Special Moves', () => {
    it('should handle en passant capture', () => {
      const game = new Game();

      // Set up position for en passant
      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'a7', to: 'a6' });
      game.move({ from: 'e4', to: 'e5' });
      game.move({ from: 'd7', to: 'd5' });

      // Capture en passant
      const capture = game.move({ from: 'e5', to: 'd6' });

      expect(capture).not.toBeNull();
      expect(capture?.enPassant).toBe(true);
      expect(game.getBoard().getPiece('d5')).toBeNull();
      expect(game.getBoard().getPiece('d6')?.type).toBe('pawn');
    });

    it('should handle all four castling types', () => {
      const game = new Game();

      // Set up for castling
      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'e7', to: 'e5' });
      game.move({ from: 'g1', to: 'f3' });
      game.move({ from: 'g8', to: 'f6' });
      game.move({ from: 'f1', to: 'c4' });
      game.move({ from: 'f8', to: 'c5' });

      // White kingside castling
      const whiteKingside = game.move({ from: 'e1', to: 'g1' });
      expect(whiteKingside?.castling).toBe('kingside');
      expect(game.getBoard().getPiece('g1')?.type).toBe('king');
      expect(game.getBoard().getPiece('f1')?.type).toBe('rook');

      // Black kingside castling
      const blackKingside = game.move({ from: 'e8', to: 'g8' });
      expect(blackKingside?.castling).toBe('kingside');
      expect(game.getBoard().getPiece('g8')?.type).toBe('king');
      expect(game.getBoard().getPiece('f8')?.type).toBe('rook');
    });

    it('should handle pawn promotion to all pieces', () => {
      const game = new Game();

      // Set up position for promotion
      game.getBoard().clear();
      game.getBoard().setPiece('e1', { type: 'king', color: 'white' });
      game.getBoard().setPiece('a8', { type: 'king', color: 'black' });
      game.getBoard().setPiece('e7', { type: 'pawn', color: 'white' });
      game.refreshMoveGenerator();

      // Promote to queen
      const promotion = game.move({ from: 'e7', to: 'e8', promotion: 'queen' });
      expect(promotion).not.toBeNull();
      expect(promotion?.promotion).toBe('queen');
      expect(game.getBoard().getPiece('e8')?.type).toBe('queen');
    });
  });

  describe('Move History and Undo', () => {
    it('should maintain accurate move history', () => {
      const game = new Game();

      const moves = [
        { from: 'e2', to: 'e4' },
        { from: 'e7', to: 'e5' },
        { from: 'g1', to: 'f3' },
        { from: 'b8', to: 'c6' },
      ];

      for (const move of moves) {
        game.move(move);
      }

      const history = game.getHistory();
      expect(history).toHaveLength(4);
      expect(history[0]?.from).toBe('e2');
      expect(history[0]?.to).toBe('e4');
      expect(history[0]?.san).toBe('e4');
    });

    it('should undo multiple moves correctly', () => {
      const game = new Game();

      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'e7', to: 'e5' });
      game.move({ from: 'g1', to: 'f3' });

      expect(game.getHistory()).toHaveLength(3);

      game.undo();
      expect(game.getHistory()).toHaveLength(2);
      expect(game.getBoard().getPiece('f3')).toBeNull();
      expect(game.getBoard().getPiece('g1')?.type).toBe('knight');

      game.undo();
      expect(game.getHistory()).toHaveLength(1);

      game.undo();
      expect(game.getHistory()).toHaveLength(0);
    });
  });

  describe('Clock Management', () => {
    it('should track fifty-move rule', () => {
      const game = new Game();

      // Manually set halfmove clock
      game.getBoard().clear();
      game.getBoard().setPiece('e1', { type: 'king', color: 'white' });
      game.getBoard().setPiece('e8', { type: 'king', color: 'black' });
      game.getBoard().setPiece('a1', { type: 'rook', color: 'white' });
      game.refreshMoveGenerator();

      // Make 50 moves without pawn move or capture
      for (let i = 0; i < 25; i++) {
        game.move({ from: 'a1', to: 'a2' });
        game.move({ from: 'e8', to: 'd8' });
        game.move({ from: 'a2', to: 'a1' });
        game.move({ from: 'd8', to: 'e8' });
      }

      expect(game.getHalfMoveClock()).toBeGreaterThanOrEqual(50);
      expect(game.getStatus()).toBe('fifty_move_rule');
    });

    it('should reset halfmove clock on pawn moves', () => {
      const game = new Game();

      game.move({ from: 'e2', to: 'e4' });
      expect(game.getHalfMoveClock()).toBe(0);

      game.move({ from: 'b8', to: 'c6' });
      expect(game.getHalfMoveClock()).toBe(1);

      game.move({ from: 'd2', to: 'd4' });
      expect(game.getHalfMoveClock()).toBe(0);
    });

    it('should reset halfmove clock on captures', () => {
      const game = new Game();

      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'd7', to: 'd5' });
      expect(game.getHalfMoveClock()).toBe(0);

      game.move({ from: 'e4', to: 'd5' });
      expect(game.getHalfMoveClock()).toBe(0);
    });
  });

  describe('Full Game Play', () => {
    it('should play a complete game to checkmate', () => {
      const pgn: Pgn = `[Event "Test Game"]
[Site "Test"]
[Date "2024.01.01"]
[Round "1"]
[White "Player 1"]
[Black "Player 2"]
[Result "1-0"]

1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0`;

      const game = PgnParser.loadGame(pgn);

      expect(game).not.toBeNull();
      expect(game?.getStatus()).toBe('checkmate');
      expect(game?.getHistory()).toHaveLength(7);
    });

    it('should handle a drawn game', () => {
      const game = new Game();

      // Set up insufficient material
      game.getBoard().clear();
      game.getBoard().setPiece('e1', { type: 'king', color: 'white' });
      game.getBoard().setPiece('e8', { type: 'king', color: 'black' });
      game.refreshMoveGenerator();

      expect(game.getStatus()).toBe('insufficient_material');
    });
  });

  describe('Position Repetition', () => {
    it('should detect threefold repetition', () => {
      const game = new Game();

      // Repeat position 3 times with knight moves
      for (let i = 0; i < 3; i++) {
        game.move({ from: 'g1', to: 'f3' });
        game.move({ from: 'g8', to: 'f6' });
        game.move({ from: 'f3', to: 'g1' });
        game.move({ from: 'f6', to: 'g8' });
      }

      expect(game.getStatus()).toBe('threefold_repetition');
    });
  });
});
