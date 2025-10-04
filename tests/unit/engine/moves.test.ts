/**
 * Move Generator Tests
 *
 * Tests for move generation, validation, and game-ending conditions.
 */

import { describe, expect, it } from '@jest/globals';
import { Board } from '@/engine/board';
import { MoveGenerator } from '@/engine/moves';
import type { CastlingRights, Color } from '@/types/index';

describe('MoveGenerator', () => {
  const defaultCastlingRights: CastlingRights = {
    whiteKingside: true,
    whiteQueenside: true,
    blackKingside: true,
    blackQueenside: true,
  };

  describe('generateLegalMoves', () => {
    it('should generate 20 moves in the starting position for white', () => {
      const board = new Board();
      board.setupStartingPosition();
      const generator = new MoveGenerator(board, defaultCastlingRights);

      const moves = generator.generateLegalMoves('white');

      // 16 pawn moves (8 pawns * 2 moves each) + 4 knight moves (2 knights * 2 moves each)
      expect(moves).toHaveLength(20);
    });

    it('should generate 20 moves in the starting position for black', () => {
      const board = new Board();
      board.setupStartingPosition();
      const generator = new MoveGenerator(board, defaultCastlingRights);

      const moves = generator.generateLegalMoves('black');

      expect(moves).toHaveLength(20);
    });

    it('should generate no moves when in checkmate', () => {
      const board = new Board();
      // Checkmate: king surrounded by own pieces, attacked by protected queen
      board.setPiece('e4', { type: 'king', color: 'white' });
      board.setPiece('d5', { type: 'pawn', color: 'white' });
      board.setPiece('e5', { type: 'pawn', color: 'white' });
      board.setPiece('f5', { type: 'pawn', color: 'white' });
      board.setPiece('d4', { type: 'pawn', color: 'white' });
      board.setPiece('f4', { type: 'pawn', color: 'white' });
      board.setPiece('d3', { type: 'pawn', color: 'white' });
      board.setPiece('f3', { type: 'pawn', color: 'white' });
      board.setPiece('e3', { type: 'queen', color: 'black' });
      board.setPiece('e2', { type: 'rook', color: 'black' }); // Protects the queen
      board.setPiece('a8', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);
      const moves = generator.generateLegalMoves('white');

      expect(moves).toHaveLength(0);
    });
  });

  describe('generateLegalMovesFrom', () => {
    it('should generate correct knight moves', () => {
      const board = new Board();
      board.setPiece('e4', { type: 'knight', color: 'white' });
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e8', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);
      const moves = generator.generateLegalMovesFrom('e4', 'white');

      // Knight on e4 has 8 possible moves
      expect(moves).toHaveLength(8);
    });

    it('should not generate moves that leave king in check', () => {
      const board = new Board();
      // Pinned piece scenario - bishop is pinned and cannot move
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e2', { type: 'bishop', color: 'white' });
      board.setPiece('e8', { type: 'rook', color: 'black' });
      board.setPiece('a1', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);
      const moves = generator.generateLegalMovesFrom('e2', 'white');

      // Bishop is pinned and cannot move at all (bishops move diagonally, not along files)
      expect(moves).toHaveLength(0);
    });

    it('should generate pawn promotion moves', () => {
      const board = new Board();
      board.setPiece('e7', { type: 'pawn', color: 'white' });
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('a8', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);
      const moves = generator.generateLegalMovesFrom('e7', 'white');

      // Should generate 4 promotion moves (queen, rook, bishop, knight)
      expect(moves).toHaveLength(4);
      expect(moves.every((m) => m.to === 'e8' && m.promotion)).toBe(true);
    });

    it('should return empty array for empty square', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e8', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);
      const moves = generator.generateLegalMovesFrom('e4', 'white');

      expect(moves).toHaveLength(0);
    });

    it('should return empty array for opponent piece', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e4', { type: 'knight', color: 'black' });
      board.setPiece('e8', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);
      const moves = generator.generateLegalMovesFrom('e4', 'white');

      expect(moves).toHaveLength(0);
    });
  });

  describe('isMoveLegal', () => {
    it('should return true for legal move', () => {
      const board = new Board();
      board.setupStartingPosition();
      const generator = new MoveGenerator(board, defaultCastlingRights);

      expect(generator.isMoveLegal('e2', 'e4', 'white')).toBe(true);
    });

    it('should return false for move that leaves king in check', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e2', { type: 'bishop', color: 'white' });
      board.setPiece('e8', { type: 'rook', color: 'black' });
      board.setPiece('a1', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);

      // Moving the bishop away would expose the king to check
      expect(generator.isMoveLegal('e2', 'd3', 'white')).toBe(false);
    });
  });

  describe('validateMove', () => {
    it('should validate a legal move', () => {
      const board = new Board();
      board.setupStartingPosition();
      const generator = new MoveGenerator(board, defaultCastlingRights);

      const result = generator.validateMove({ from: 'e2', to: 'e4' }, 'white');

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid starting square', () => {
      const board = new Board();
      board.setupStartingPosition();
      const generator = new MoveGenerator(board, defaultCastlingRights);

      const result = generator.validateMove({ from: 'z9', to: 'e4' }, 'white');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid square');
    });

    it('should reject empty starting square', () => {
      const board = new Board();
      board.setupStartingPosition();
      const generator = new MoveGenerator(board, defaultCastlingRights);

      const result = generator.validateMove({ from: 'e4', to: 'e5' }, 'white');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('No piece at starting square');
    });

    it('should reject moving opponent piece', () => {
      const board = new Board();
      board.setupStartingPosition();
      const generator = new MoveGenerator(board, defaultCastlingRights);

      const result = generator.validateMove({ from: 'e7', to: 'e5' }, 'white');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Not your piece');
    });

    it('should reject same square move', () => {
      const board = new Board();
      board.setupStartingPosition();
      const generator = new MoveGenerator(board, defaultCastlingRights);

      const result = generator.validateMove({ from: 'e2', to: 'e2' }, 'white');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Cannot move to the same square');
    });

    it('should reject illegal move', () => {
      const board = new Board();
      board.setupStartingPosition();
      const generator = new MoveGenerator(board, defaultCastlingRights);

      const result = generator.validateMove({ from: 'e2', to: 'e5' }, 'white');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Illegal move');
    });

    it('should require promotion when pawn reaches end rank', () => {
      const board = new Board();
      board.setPiece('e7', { type: 'pawn', color: 'white' });
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('a8', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);
      const result = generator.validateMove({ from: 'e7', to: 'e8' }, 'white');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Pawn promotion required');
    });

    it('should accept promotion when provided', () => {
      const board = new Board();
      board.setPiece('e7', { type: 'pawn', color: 'white' });
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('a8', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);
      const result = generator.validateMove(
        { from: 'e7', to: 'e8', promotion: 'queen' },
        'white'
      );

      expect(result.valid).toBe(true);
    });
  });

  describe('isCheckmate', () => {
    it('should detect back rank mate', () => {
      const board = new Board();
      // Checkmate: king surrounded by own pieces, attacked by protected queen
      board.setPiece('e4', { type: 'king', color: 'white' });
      board.setPiece('d5', { type: 'pawn', color: 'white' });
      board.setPiece('e5', { type: 'pawn', color: 'white' });
      board.setPiece('f5', { type: 'pawn', color: 'white' });
      board.setPiece('d4', { type: 'pawn', color: 'white' });
      board.setPiece('f4', { type: 'pawn', color: 'white' });
      board.setPiece('d3', { type: 'pawn', color: 'white' });
      board.setPiece('f3', { type: 'pawn', color: 'white' });
      board.setPiece('e3', { type: 'queen', color: 'black' });
      board.setPiece('e2', { type: 'rook', color: 'black' }); // Protects the queen
      board.setPiece('a8', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);

      expect(generator.isCheckmate('white')).toBe(true);
    });

    it('should return false when not in check', () => {
      const board = new Board();
      board.setupStartingPosition();
      const generator = new MoveGenerator(board, defaultCastlingRights);

      expect(generator.isCheckmate('white')).toBe(false);
    });

    it('should return false when in check but can escape', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e5', { type: 'rook', color: 'black' });
      board.setPiece('e8', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);

      expect(generator.isCheckmate('white')).toBe(false);
    });
  });

  describe('isStalemate', () => {
    it('should detect stalemate', () => {
      const board = new Board();
      // Classic stalemate: king in corner with no moves, not in check
      board.setPiece('a1', { type: 'king', color: 'white' });
      board.setPiece('b3', { type: 'king', color: 'black' });
      board.setPiece('c2', { type: 'queen', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);

      expect(generator.isStalemate('white')).toBe(true);
    });

    it('should return false when in check', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e5', { type: 'rook', color: 'black' });
      board.setPiece('e8', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);

      expect(generator.isStalemate('white')).toBe(false);
    });

    it('should return false when moves are available', () => {
      const board = new Board();
      board.setupStartingPosition();
      const generator = new MoveGenerator(board, defaultCastlingRights);

      expect(generator.isStalemate('white')).toBe(false);
    });
  });

  describe('En Passant', () => {
    it('should generate en passant capture', () => {
      const board = new Board();
      board.setPiece('e5', { type: 'pawn', color: 'white' });
      board.setPiece('d5', { type: 'pawn', color: 'black' });
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e8', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights, 'd6');
      const moves = generator.generateLegalMovesFrom('e5', 'white');

      const enPassantMove = moves.find((m) => m.to === 'd6' && m.enPassant);
      expect(enPassantMove).toBeDefined();
      expect(enPassantMove?.enPassant).toBe(true);
    });

    it('should not generate en passant when not adjacent', () => {
      const board = new Board();
      board.setPiece('e5', { type: 'pawn', color: 'white' });
      board.setPiece('b5', { type: 'pawn', color: 'black' });
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e8', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights, 'b6');
      const moves = generator.generateLegalMovesFrom('e5', 'white');

      const enPassantMove = moves.find((m) => m.enPassant);
      expect(enPassantMove).toBeUndefined();
    });
  });

  describe('Castling', () => {
    it('should allow white kingside castling', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('h1', { type: 'rook', color: 'white' });
      board.setPiece('e8', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);
      const moves = generator.generateLegalMovesFrom('e1', 'white');

      const castlingMove = moves.find((m) => m.castling === 'kingside');
      expect(castlingMove).toBeDefined();
      expect(castlingMove?.to).toBe('g1');
    });

    it('should allow white queenside castling', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('a1', { type: 'rook', color: 'white' });
      board.setPiece('e8', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);
      const moves = generator.generateLegalMovesFrom('e1', 'white');

      const castlingMove = moves.find((m) => m.castling === 'queenside');
      expect(castlingMove).toBeDefined();
      expect(castlingMove?.to).toBe('c1');
    });

    it('should not allow castling when path is blocked', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('h1', { type: 'rook', color: 'white' });
      board.setPiece('g1', { type: 'knight', color: 'white' });
      board.setPiece('e8', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);
      const moves = generator.generateLegalMovesFrom('e1', 'white');

      const castlingMove = moves.find((m) => m.castling === 'kingside');
      expect(castlingMove).toBeUndefined();
    });

    it('should not allow castling when king is in check', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('h1', { type: 'rook', color: 'white' });
      board.setPiece('e5', { type: 'rook', color: 'black' });
      board.setPiece('e8', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);
      const moves = generator.generateLegalMovesFrom('e1', 'white');

      const castlingMove = moves.find((m) => m.castling);
      expect(castlingMove).toBeUndefined();
    });

    it('should not allow castling through attacked square', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('h1', { type: 'rook', color: 'white' });
      board.setPiece('f5', { type: 'rook', color: 'black' });
      board.setPiece('e8', { type: 'king', color: 'black' });

      const generator = new MoveGenerator(board, defaultCastlingRights);
      const moves = generator.generateLegalMovesFrom('e1', 'white');

      const castlingMove = moves.find((m) => m.castling === 'kingside');
      expect(castlingMove).toBeUndefined();
    });

    it('should not allow castling when rights are lost', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('h1', { type: 'rook', color: 'white' });
      board.setPiece('e8', { type: 'king', color: 'black' });

      const noCastlingRights: CastlingRights = {
        whiteKingside: false,
        whiteQueenside: false,
        blackKingside: false,
        blackQueenside: false,
      };

      const generator = new MoveGenerator(board, noCastlingRights);
      const moves = generator.generateLegalMovesFrom('e1', 'white');

      const castlingMove = moves.find((m) => m.castling);
      expect(castlingMove).toBeUndefined();
    });
  });
});
