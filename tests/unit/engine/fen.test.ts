/**
 * FEN Parser and Generator Tests
 *
 * Tests for parsing and generating FEN notation.
 */

import { describe, expect, it } from '@jest/globals';
import { FenParser } from '@/engine/fen';
import type { Fen } from '@/types/index';

describe('FenParser', () => {
  describe('parse', () => {
    it('should parse starting position FEN', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const result = FenParser.parse(fen);

      expect(result.turn).toBe('white');
      expect(result.halfMoveClock).toBe(0);
      expect(result.fullMoveNumber).toBe(1);
      expect(result.enPassantSquare).toBeNull();
      expect(result.castlingRights.whiteKingside).toBe(true);
      expect(result.castlingRights.whiteQueenside).toBe(true);
      expect(result.castlingRights.blackKingside).toBe(true);
      expect(result.castlingRights.blackQueenside).toBe(true);
    });

    it('should parse board position correctly', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const result = FenParser.parse(fen);

      // Check white pieces
      expect(result.board.getPiece('e1')?.type).toBe('king');
      expect(result.board.getPiece('e1')?.color).toBe('white');
      expect(result.board.getPiece('d1')?.type).toBe('queen');
      expect(result.board.getPiece('a1')?.type).toBe('rook');
      expect(result.board.getPiece('h1')?.type).toBe('rook');
      expect(result.board.getPiece('e2')?.type).toBe('pawn');

      // Check black pieces
      expect(result.board.getPiece('e8')?.type).toBe('king');
      expect(result.board.getPiece('e8')?.color).toBe('black');
      expect(result.board.getPiece('d8')?.type).toBe('queen');
      expect(result.board.getPiece('e7')?.type).toBe('pawn');
    });

    it('should parse position after e4', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      const result = FenParser.parse(fen);

      expect(result.board.getPiece('e4')?.type).toBe('pawn');
      expect(result.board.getPiece('e4')?.color).toBe('white');
      expect(result.board.getPiece('e2')).toBeNull();
      expect(result.turn).toBe('black');
      expect(result.enPassantSquare).toBe('e3');
    });

    it('should parse position with no castling rights', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1';
      const result = FenParser.parse(fen);

      expect(result.castlingRights.whiteKingside).toBe(false);
      expect(result.castlingRights.whiteQueenside).toBe(false);
      expect(result.castlingRights.blackKingside).toBe(false);
      expect(result.castlingRights.blackQueenside).toBe(false);
    });

    it('should parse position with partial castling rights', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Kq - 0 1';
      const result = FenParser.parse(fen);

      expect(result.castlingRights.whiteKingside).toBe(true);
      expect(result.castlingRights.whiteQueenside).toBe(false);
      expect(result.castlingRights.blackKingside).toBe(false);
      expect(result.castlingRights.blackQueenside).toBe(true);
    });

    it('should parse position with halfmove clock', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 42 1';
      const result = FenParser.parse(fen);

      expect(result.halfMoveClock).toBe(42);
    });

    it('should parse position with fullmove number', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 25';
      const result = FenParser.parse(fen);

      expect(result.fullMoveNumber).toBe(25);
    });

    it('should throw error for invalid FEN (wrong number of parts)', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -';
      expect(() => FenParser.parse(fen)).toThrow('Invalid FEN: expected 6 parts');
    });

    it('should throw error for invalid FEN (wrong number of ranks)', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      expect(() => FenParser.parse(fen)).toThrow('Invalid FEN: expected 8 ranks');
    });

    it('should throw error for invalid active color', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1';
      expect(() => FenParser.parse(fen)).toThrow('Invalid FEN: invalid active color');
    });

    it('should throw error for invalid castling character', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkX - 0 1';
      expect(() => FenParser.parse(fen)).toThrow('Invalid FEN: invalid castling character');
    });

    it('should throw error for invalid en passant square', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq e5 0 1';
      expect(() => FenParser.parse(fen)).toThrow('Invalid FEN: invalid en passant square');
    });

    it('should throw error for invalid halfmove clock', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - -1 1';
      expect(() => FenParser.parse(fen)).toThrow('Invalid FEN: invalid halfmove clock');
    });

    it('should throw error for invalid fullmove number', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0';
      expect(() => FenParser.parse(fen)).toThrow('Invalid FEN: invalid fullmove number');
    });

    it('should parse complex middlegame position', () => {
      const fen: Fen = 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4';
      const result = FenParser.parse(fen);

      expect(result.turn).toBe('white');
      expect(result.halfMoveClock).toBe(4);
      expect(result.fullMoveNumber).toBe(4);
      expect(result.board.getPiece('c4')?.type).toBe('bishop');
      expect(result.board.getPiece('c4')?.color).toBe('white');
      expect(result.board.getPiece('c6')?.type).toBe('knight');
      expect(result.board.getPiece('c6')?.color).toBe('black');
    });
  });

  describe('generate', () => {
    it('should generate starting position FEN', () => {
      const parsed = FenParser.parse(FenParser.STARTING_POSITION);
      const generated = FenParser.generate(
        parsed.board,
        parsed.turn,
        parsed.castlingRights,
        parsed.enPassantSquare,
        parsed.halfMoveClock,
        parsed.fullMoveNumber
      );

      expect(generated).toBe(FenParser.STARTING_POSITION);
    });

    it('should generate FEN after e4', () => {
      const originalFen: Fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      const parsed = FenParser.parse(originalFen);
      const generated = FenParser.generate(
        parsed.board,
        parsed.turn,
        parsed.castlingRights,
        parsed.enPassantSquare,
        parsed.halfMoveClock,
        parsed.fullMoveNumber
      );

      expect(generated).toBe(originalFen);
    });

    it('should generate FEN with no castling rights', () => {
      const originalFen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1';
      const parsed = FenParser.parse(originalFen);
      const generated = FenParser.generate(
        parsed.board,
        parsed.turn,
        parsed.castlingRights,
        parsed.enPassantSquare,
        parsed.halfMoveClock,
        parsed.fullMoveNumber
      );

      expect(generated).toBe(originalFen);
    });

    it('should generate FEN with partial castling rights', () => {
      const originalFen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Kq - 0 1';
      const parsed = FenParser.parse(originalFen);
      const generated = FenParser.generate(
        parsed.board,
        parsed.turn,
        parsed.castlingRights,
        parsed.enPassantSquare,
        parsed.halfMoveClock,
        parsed.fullMoveNumber
      );

      expect(generated).toBe(originalFen);
    });

    it('should generate complex middlegame position', () => {
      const originalFen: Fen = 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4';
      const parsed = FenParser.parse(originalFen);
      const generated = FenParser.generate(
        parsed.board,
        parsed.turn,
        parsed.castlingRights,
        parsed.enPassantSquare,
        parsed.halfMoveClock,
        parsed.fullMoveNumber
      );

      expect(generated).toBe(originalFen);
    });

    it('should handle empty ranks correctly', () => {
      const originalFen: Fen = '8/8/8/8/8/8/8/8 w - - 0 1';
      const parsed = FenParser.parse(originalFen);
      const generated = FenParser.generate(
        parsed.board,
        parsed.turn,
        parsed.castlingRights,
        parsed.enPassantSquare,
        parsed.halfMoveClock,
        parsed.fullMoveNumber
      );

      expect(generated).toBe(originalFen);
    });
  });

  describe('validate', () => {
    it('should validate correct FEN', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      expect(FenParser.validate(fen)).toBe(true);
    });

    it('should reject invalid FEN', () => {
      const fen: Fen = 'invalid fen string';
      expect(FenParser.validate(fen)).toBe(false);
    });

    it('should reject FEN with wrong number of parts', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq';
      expect(FenParser.validate(fen)).toBe(false);
    });

    it('should reject FEN with invalid castling', () => {
      const fen: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w XYZ - 0 1';
      expect(FenParser.validate(fen)).toBe(false);
    });
  });

  describe('STARTING_POSITION', () => {
    it('should have correct starting position constant', () => {
      expect(FenParser.STARTING_POSITION).toBe(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      );
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain position through parse/generate cycle', () => {
      const fens: Fen[] = [
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',
        'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
      ];

      for (const fen of fens) {
        const parsed = FenParser.parse(fen);
        const generated = FenParser.generate(
          parsed.board,
          parsed.turn,
          parsed.castlingRights,
          parsed.enPassantSquare,
          parsed.halfMoveClock,
          parsed.fullMoveNumber
        );
        expect(generated).toBe(fen);
      }
    });
  });
});
