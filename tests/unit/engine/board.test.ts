/**
 * Board class tests
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Board } from '@/engine/board';
import type { Piece } from '@/types/index';

describe('Board', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  describe('constructor', () => {
    it('should create an empty board by default', () => {
      expect(board.isEmpty('e4')).toBe(true);
      expect(board.isEmpty('a1')).toBe(true);
      expect(board.isEmpty('h8')).toBe(true);
    });

    it('should accept initial board state', () => {
      const initialBoard: (Piece | null)[][] = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      initialBoard[0]![0] = { type: 'rook', color: 'white' };

      const customBoard = new Board(initialBoard);
      expect(customBoard.getPiece('a1')).toEqual({ type: 'rook', color: 'white' });
    });
  });

  describe('setupStartingPosition', () => {
    it('should set up standard chess starting position', () => {
      board.setupStartingPosition();

      // Check white pieces
      expect(board.getPiece('a1')).toEqual({ type: 'rook', color: 'white' });
      expect(board.getPiece('b1')).toEqual({ type: 'knight', color: 'white' });
      expect(board.getPiece('c1')).toEqual({ type: 'bishop', color: 'white' });
      expect(board.getPiece('d1')).toEqual({ type: 'queen', color: 'white' });
      expect(board.getPiece('e1')).toEqual({ type: 'king', color: 'white' });
      expect(board.getPiece('f1')).toEqual({ type: 'bishop', color: 'white' });
      expect(board.getPiece('g1')).toEqual({ type: 'knight', color: 'white' });
      expect(board.getPiece('h1')).toEqual({ type: 'rook', color: 'white' });

      // Check white pawns
      for (const file of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
        expect(board.getPiece(`${file}2`)).toEqual({ type: 'pawn', color: 'white' });
      }

      // Check black pieces
      expect(board.getPiece('a8')).toEqual({ type: 'rook', color: 'black' });
      expect(board.getPiece('b8')).toEqual({ type: 'knight', color: 'black' });
      expect(board.getPiece('c8')).toEqual({ type: 'bishop', color: 'black' });
      expect(board.getPiece('d8')).toEqual({ type: 'queen', color: 'black' });
      expect(board.getPiece('e8')).toEqual({ type: 'king', color: 'black' });

      // Check black pawns
      for (const file of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
        expect(board.getPiece(`${file}7`)).toEqual({ type: 'pawn', color: 'black' });
      }

      // Check empty squares
      expect(board.isEmpty('e4')).toBe(true);
      expect(board.isEmpty('d5')).toBe(true);
    });
  });

  describe('getPiece and setPiece', () => {
    it('should get and set pieces correctly', () => {
      const piece: Piece = { type: 'knight', color: 'white' };

      board.setPiece('e4', piece);
      expect(board.getPiece('e4')).toEqual(piece);
    });

    it('should return null for empty squares', () => {
      expect(board.getPiece('e4')).toBeNull();
    });

    it('should handle invalid squares gracefully', () => {
      expect(board.getPiece('z9')).toBeNull();
      expect(board.getPiece('')).toBeNull();
    });

    it('should clear a square when setting null', () => {
      board.setPiece('e4', { type: 'pawn', color: 'white' });
      board.setPiece('e4', null);
      expect(board.isEmpty('e4')).toBe(true);
    });
  });

  describe('getPieceAt and setPieceAt', () => {
    it('should get and set pieces by coordinates', () => {
      const piece: Piece = { type: 'queen', color: 'black' };

      board.setPieceAt(3, 4, piece); // e4
      expect(board.getPieceAt(3, 4)).toEqual(piece);
      expect(board.getPiece('e4')).toEqual(piece);
    });

    it('should return null for out-of-bounds coordinates', () => {
      expect(board.getPieceAt(-1, 0)).toBeNull();
      expect(board.getPieceAt(8, 0)).toBeNull();
      expect(board.getPieceAt(0, -1)).toBeNull();
      expect(board.getPieceAt(0, 8)).toBeNull();
    });
  });

  describe('movePiece', () => {
    it('should move a piece from one square to another', () => {
      const piece: Piece = { type: 'knight', color: 'white' };
      board.setPiece('b1', piece);

      const captured = board.movePiece('b1', 'c3');

      expect(board.getPiece('c3')).toEqual(piece);
      expect(board.isEmpty('b1')).toBe(true);
      expect(captured).toBeNull();
    });

    it('should capture a piece when moving to occupied square', () => {
      const whitePiece: Piece = { type: 'pawn', color: 'white' };
      const blackPiece: Piece = { type: 'pawn', color: 'black' };

      board.setPiece('e4', whitePiece);
      board.setPiece('d5', blackPiece);

      const captured = board.movePiece('e4', 'd5');

      expect(board.getPiece('d5')).toEqual(whitePiece);
      expect(board.isEmpty('e4')).toBe(true);
      expect(captured).toEqual(blackPiece);
    });
  });

  describe('squareToCoords and coordsToSquare', () => {
    it('should convert square notation to coordinates', () => {
      expect(board.squareToCoords('a1')).toEqual({ row: 0, col: 0 });
      expect(board.squareToCoords('h1')).toEqual({ row: 0, col: 7 });
      expect(board.squareToCoords('a8')).toEqual({ row: 7, col: 0 });
      expect(board.squareToCoords('h8')).toEqual({ row: 7, col: 7 });
      expect(board.squareToCoords('e4')).toEqual({ row: 3, col: 4 });
    });

    it('should return null for invalid squares', () => {
      expect(board.squareToCoords('i1')).toBeNull();
      expect(board.squareToCoords('a0')).toBeNull();
      expect(board.squareToCoords('a9')).toBeNull();
      expect(board.squareToCoords('z9')).toBeNull();
      expect(board.squareToCoords('')).toBeNull();
      expect(board.squareToCoords('abc')).toBeNull();
    });

    it('should convert coordinates to square notation', () => {
      expect(board.coordsToSquare(0, 0)).toBe('a1');
      expect(board.coordsToSquare(0, 7)).toBe('h1');
      expect(board.coordsToSquare(7, 0)).toBe('a8');
      expect(board.coordsToSquare(7, 7)).toBe('h8');
      expect(board.coordsToSquare(3, 4)).toBe('e4');
    });

    it('should return null for out-of-bounds coordinates', () => {
      expect(board.coordsToSquare(-1, 0)).toBeNull();
      expect(board.coordsToSquare(8, 0)).toBeNull();
      expect(board.coordsToSquare(0, -1)).toBeNull();
      expect(board.coordsToSquare(0, 8)).toBeNull();
    });

    it('should be reversible', () => {
      const squares = ['a1', 'e4', 'd5', 'h8', 'c3', 'f6'];

      for (const square of squares) {
        const coords = board.squareToCoords(square);
        expect(coords).not.toBeNull();
        const backToSquare = board.coordsToSquare(coords!.row, coords!.col);
        expect(backToSquare).toBe(square);
      }
    });
  });

  describe('isValidSquare and isValidCoords', () => {
    it('should validate square notation', () => {
      expect(board.isValidSquare('a1')).toBe(true);
      expect(board.isValidSquare('h8')).toBe(true);
      expect(board.isValidSquare('e4')).toBe(true);
      expect(board.isValidSquare('i1')).toBe(false);
      expect(board.isValidSquare('a9')).toBe(false);
      expect(board.isValidSquare('')).toBe(false);
    });

    it('should validate coordinates', () => {
      expect(board.isValidCoords(0, 0)).toBe(true);
      expect(board.isValidCoords(7, 7)).toBe(true);
      expect(board.isValidCoords(3, 4)).toBe(true);
      expect(board.isValidCoords(-1, 0)).toBe(false);
      expect(board.isValidCoords(8, 0)).toBe(false);
      expect(board.isValidCoords(0, -1)).toBe(false);
      expect(board.isValidCoords(0, 8)).toBe(false);
    });
  });

  describe('findPieces', () => {
    it('should find all pieces of a color', () => {
      board.setupStartingPosition();

      const whitePieces = board.findPieces('white');
      const blackPieces = board.findPieces('black');

      expect(whitePieces).toHaveLength(16);
      expect(blackPieces).toHaveLength(16);

      // Check that all white pieces are actually white
      whitePieces.forEach(({ piece }) => {
        expect(piece.color).toBe('white');
      });
    });

    it('should return empty array when no pieces of color exist', () => {
      const whitePieces = board.findPieces('white');
      expect(whitePieces).toHaveLength(0);
    });
  });

  describe('findKing', () => {
    it('should find the king of each color', () => {
      board.setupStartingPosition();

      expect(board.findKing('white')).toBe('e1');
      expect(board.findKing('black')).toBe('e8');
    });

    it('should return null when king is not found', () => {
      expect(board.findKing('white')).toBeNull();
    });
  });

  describe('clone', () => {
    it('should create a deep copy of the board', () => {
      board.setupStartingPosition();

      const cloned = board.clone();

      // Modify original
      board.movePiece('e2', 'e4');

      // Cloned should be unchanged
      expect(cloned.getPiece('e2')).toEqual({ type: 'pawn', color: 'white' });
      expect(cloned.isEmpty('e4')).toBe(true);
    });

    it('should clone an empty board', () => {
      const cloned = board.clone();

      expect(cloned.isEmpty('e4')).toBe(true);
      expect(cloned.isEmpty('a1')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all pieces from the board', () => {
      board.setupStartingPosition();
      board.clear();

      expect(board.isEmpty('a1')).toBe(true);
      expect(board.isEmpty('e1')).toBe(true);
      expect(board.isEmpty('e8')).toBe(true);
      expect(board.findPieces('white')).toHaveLength(0);
      expect(board.findPieces('black')).toHaveLength(0);
    });
  });

  describe('isEmpty and isOccupiedBy', () => {
    it('should check if square is empty', () => {
      expect(board.isEmpty('e4')).toBe(true);

      board.setPiece('e4', { type: 'pawn', color: 'white' });
      expect(board.isEmpty('e4')).toBe(false);
    });

    it('should check if square is occupied by specific color', () => {
      board.setPiece('e4', { type: 'pawn', color: 'white' });

      expect(board.isOccupiedBy('e4', 'white')).toBe(true);
      expect(board.isOccupiedBy('e4', 'black')).toBe(false);
      expect(board.isOccupiedBy('d4', 'white')).toBe(false);
    });
  });

  describe('toString', () => {
    it('should generate string representation', () => {
      board.setupStartingPosition();

      const str = board.toString();

      // Check it contains expected characters
      expect(str).toContain('r'); // black rook
      expect(str).toContain('R'); // white rook
      expect(str).toContain('k'); // black king
      expect(str).toContain('K'); // white king
      expect(str).toContain('.'); // empty square
      expect(str.split('\n')).toHaveLength(8); // 8 ranks
    });
  });

  describe('toAscii', () => {
    it('should generate ASCII art representation', () => {
      board.setupStartingPosition();

      const ascii = board.toAscii();

      expect(ascii).toContain('♔'); // white king
      expect(ascii).toContain('♚'); // black king
      expect(ascii).toContain('a'); // file labels
      expect(ascii).toContain('8'); // rank labels
    });
  });
});
