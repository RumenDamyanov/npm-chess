/**
 * Piece movement tests
 */

import { Board } from '@/engine/board';
import {
  getPseudoLegalMoves,
  isSquareUnderAttack,
  isKingInCheck,
} from '@/engine/pieces';
import type { Coordinates } from '@/types/index';

describe('Pieces', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  describe('Pawn moves', () => {
    it('should move one square forward', () => {
      board.setPiece('e2', { type: 'pawn', color: 'white' });

      const moves = getPseudoLegalMoves(board, { row: 1, col: 4 }, 'pawn', 'white');

      expect(moves).toContainEqual({ row: 2, col: 4 }); // e3
    });

    it('should move two squares forward from starting position', () => {
      board.setPiece('e2', { type: 'pawn', color: 'white' });

      const moves = getPseudoLegalMoves(board, { row: 1, col: 4 }, 'pawn', 'white');

      expect(moves).toContainEqual({ row: 2, col: 4 }); // e3
      expect(moves).toContainEqual({ row: 3, col: 4 }); // e4
    });

    it('should not move two squares if not on starting rank', () => {
      board.setPiece('e3', { type: 'pawn', color: 'white' });

      const moves = getPseudoLegalMoves(board, { row: 2, col: 4 }, 'pawn', 'white');

      expect(moves).toHaveLength(1);
      expect(moves).toContainEqual({ row: 3, col: 4 }); // e4
    });

    it('should capture diagonally', () => {
      board.setPiece('e4', { type: 'pawn', color: 'white' });
      board.setPiece('d5', { type: 'pawn', color: 'black' });
      board.setPiece('f5', { type: 'pawn', color: 'black' });

      const moves = getPseudoLegalMoves(board, { row: 3, col: 4 }, 'pawn', 'white');

      expect(moves).toContainEqual({ row: 4, col: 3 }); // d5 capture
      expect(moves).toContainEqual({ row: 4, col: 5 }); // f5 capture
      expect(moves).toContainEqual({ row: 4, col: 4 }); // e5 forward
    });

    it('should not move forward if blocked', () => {
      board.setPiece('e2', { type: 'pawn', color: 'white' });
      board.setPiece('e3', { type: 'pawn', color: 'black' });

      const moves = getPseudoLegalMoves(board, { row: 1, col: 4 }, 'pawn', 'white');

      expect(moves).toHaveLength(0);
    });

    it('black pawn should move downward', () => {
      board.setPiece('e7', { type: 'pawn', color: 'black' });

      const moves = getPseudoLegalMoves(board, { row: 6, col: 4 }, 'pawn', 'black');

      expect(moves).toContainEqual({ row: 5, col: 4 }); // e6
      expect(moves).toContainEqual({ row: 4, col: 4 }); // e5
    });
  });

  describe('Knight moves', () => {
    it('should move in L-shape pattern', () => {
      board.setPiece('e4', { type: 'knight', color: 'white' });

      const moves = getPseudoLegalMoves(board, { row: 3, col: 4 }, 'knight', 'white');

      expect(moves).toHaveLength(8);
      expect(moves).toContainEqual({ row: 5, col: 3 }); // d6
      expect(moves).toContainEqual({ row: 5, col: 5 }); // f6
      expect(moves).toContainEqual({ row: 4, col: 2 }); // c5
      expect(moves).toContainEqual({ row: 4, col: 6 }); // g5
      expect(moves).toContainEqual({ row: 2, col: 2 }); // c3
      expect(moves).toContainEqual({ row: 2, col: 6 }); // g3
      expect(moves).toContainEqual({ row: 1, col: 3 }); // d2
      expect(moves).toContainEqual({ row: 1, col: 5 }); // f2
    });

    it('should jump over pieces', () => {
      board.setPiece('e4', { type: 'knight', color: 'white' });
      board.setPiece('e5', { type: 'pawn', color: 'white' });
      board.setPiece('d4', { type: 'pawn', color: 'white' });

      const moves = getPseudoLegalMoves(board, { row: 3, col: 4 }, 'knight', 'white');

      expect(moves).toHaveLength(8); // Can still move to all 8 squares
    });

    it('should not capture own pieces', () => {
      board.setPiece('e4', { type: 'knight', color: 'white' });
      board.setPiece('d6', { type: 'pawn', color: 'white' });

      const moves = getPseudoLegalMoves(board, { row: 3, col: 4 }, 'knight', 'white');

      expect(moves).not.toContainEqual({ row: 5, col: 3 }); // d6 blocked by own piece
      expect(moves).toHaveLength(7);
    });
  });

  describe('Bishop moves', () => {
    it('should move diagonally', () => {
      board.setPiece('e4', { type: 'bishop', color: 'white' });

      const moves = getPseudoLegalMoves(board, { row: 3, col: 4 }, 'bishop', 'white');

      // Northeast diagonal
      expect(moves).toContainEqual({ row: 4, col: 5 }); // f5
      expect(moves).toContainEqual({ row: 5, col: 6 }); // g6
      expect(moves).toContainEqual({ row: 6, col: 7 }); // h7

      // Southeast diagonal
      expect(moves).toContainEqual({ row: 2, col: 5 }); // f3
      expect(moves).toContainEqual({ row: 1, col: 6 }); // g2
      expect(moves).toContainEqual({ row: 0, col: 7 }); // h1

      expect(moves).toHaveLength(13); // All diagonal squares
    });

    it('should stop at pieces', () => {
      board.setPiece('e4', { type: 'bishop', color: 'white' });
      board.setPiece('g6', { type: 'pawn', color: 'black' });

      const moves = getPseudoLegalMoves(board, { row: 3, col: 4 }, 'bishop', 'white');

      expect(moves).toContainEqual({ row: 5, col: 6 }); // Can capture g6
      expect(moves).not.toContainEqual({ row: 6, col: 7 }); // Can't go beyond g6
    });
  });

  describe('Rook moves', () => {
    it('should move orthogonally', () => {
      board.setPiece('e4', { type: 'rook', color: 'white' });

      const moves = getPseudoLegalMoves(board, { row: 3, col: 4 }, 'rook', 'white');

      // North
      expect(moves).toContainEqual({ row: 4, col: 4 }); // e5
      expect(moves).toContainEqual({ row: 7, col: 4 }); // e8

      // South
      expect(moves).toContainEqual({ row: 2, col: 4 }); // e3
      expect(moves).toContainEqual({ row: 0, col: 4 }); // e1

      // East
      expect(moves).toContainEqual({ row: 3, col: 5 }); // f4
      expect(moves).toContainEqual({ row: 3, col: 7 }); // h4

      // West
      expect(moves).toContainEqual({ row: 3, col: 3 }); // d4
      expect(moves).toContainEqual({ row: 3, col: 0 }); // a4

      expect(moves).toHaveLength(14);
    });
  });

  describe('Queen moves', () => {
    it('should move like bishop and rook combined', () => {
      board.setPiece('e4', { type: 'queen', color: 'white' });

      const moves = getPseudoLegalMoves(board, { row: 3, col: 4 }, 'queen', 'white');

      expect(moves).toHaveLength(27); // 13 diagonal + 14 orthogonal
    });
  });

  describe('King moves', () => {
    it('should move one square in any direction', () => {
      board.setPiece('e4', { type: 'king', color: 'white' });

      const moves = getPseudoLegalMoves(board, { row: 3, col: 4 }, 'king', 'white');

      expect(moves).toHaveLength(8);
      expect(moves).toContainEqual({ row: 4, col: 4 }); // e5
      expect(moves).toContainEqual({ row: 4, col: 5 }); // f5
      expect(moves).toContainEqual({ row: 3, col: 5 }); // f4
      expect(moves).toContainEqual({ row: 2, col: 5 }); // f3
      expect(moves).toContainEqual({ row: 2, col: 4 }); // e3
      expect(moves).toContainEqual({ row: 2, col: 3 }); // d3
      expect(moves).toContainEqual({ row: 3, col: 3 }); // d4
      expect(moves).toContainEqual({ row: 4, col: 3 }); // d5
    });

    it('should not move to own pieces', () => {
      board.setPiece('e4', { type: 'king', color: 'white' });
      board.setPiece('e5', { type: 'pawn', color: 'white' });
      board.setPiece('f4', { type: 'pawn', color: 'white' });

      const moves = getPseudoLegalMoves(board, { row: 3, col: 4 }, 'king', 'white');

      expect(moves).toHaveLength(6); // 8 - 2 blocked squares
      expect(moves).not.toContainEqual({ row: 4, col: 4 });
      expect(moves).not.toContainEqual({ row: 3, col: 5 });
    });
  });

  describe('isSquareUnderAttack', () => {
    it('should detect pawn attacks', () => {
      board.setPiece('e4', { type: 'pawn', color: 'white' });

      const underAttack = isSquareUnderAttack(board, { row: 4, col: 3 }, 'white'); // d5

      expect(underAttack).toBe(true);
    });

    it('should detect knight attacks', () => {
      board.setPiece('e4', { type: 'knight', color: 'white' });

      const underAttack = isSquareUnderAttack(board, { row: 5, col: 5 }, 'white'); // f6

      expect(underAttack).toBe(true);
    });

    it('should detect bishop attacks', () => {
      board.setPiece('a1', { type: 'bishop', color: 'white' });

      const underAttack = isSquareUnderAttack(board, { row: 7, col: 7 }, 'white'); // h8

      expect(underAttack).toBe(true);
    });

    it('should detect rook attacks', () => {
      board.setPiece('a1', { type: 'rook', color: 'white' });

      const underAttack = isSquareUnderAttack(board, { row: 0, col: 7 }, 'white'); // h1

      expect(underAttack).toBe(true);
    });

    it('should detect queen attacks', () => {
      board.setPiece('d4', { type: 'queen', color: 'white' });

      const underAttackDiag = isSquareUnderAttack(board, { row: 6, col: 6 }, 'white'); // g7
      const underAttackOrth = isSquareUnderAttack(board, { row: 3, col: 0 }, 'white'); // a4

      expect(underAttackDiag).toBe(true);
      expect(underAttackOrth).toBe(true);
    });

    it('should detect king attacks', () => {
      board.setPiece('e4', { type: 'king', color: 'white' });

      const underAttack = isSquareUnderAttack(board, { row: 4, col: 4 }, 'white'); // e5

      expect(underAttack).toBe(true);
    });

    it('should not detect attacks through pieces', () => {
      board.setPiece('a1', { type: 'rook', color: 'white' });
      board.setPiece('d1', { type: 'pawn', color: 'black' });

      const underAttack = isSquareUnderAttack(board, { row: 0, col: 7 }, 'white'); // h1

      expect(underAttack).toBe(false); // Blocked by pawn at d1
    });

    it('should return false if no attacks', () => {
      const underAttack = isSquareUnderAttack(board, { row: 4, col: 4 }, 'white');

      expect(underAttack).toBe(false);
    });
  });

  describe('isKingInCheck', () => {
    it('should detect when king is in check', () => {
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e8', { type: 'rook', color: 'black' });

      const inCheck = isKingInCheck(board, 'white');

      expect(inCheck).toBe(true);
    });

    it('should return false when king is not in check', () => {
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('a8', { type: 'rook', color: 'black' });

      const inCheck = isKingInCheck(board, 'white');

      expect(inCheck).toBe(false);
    });

    it('should return false when king is not found', () => {
      const inCheck = isKingInCheck(board, 'white');

      expect(inCheck).toBe(false);
    });

    it('should detect check from knight', () => {
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('d3', { type: 'knight', color: 'black' });

      const inCheck = isKingInCheck(board, 'white');

      expect(inCheck).toBe(true);
    });

    it('should detect check from diagonal attack', () => {
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('h4', { type: 'bishop', color: 'black' });

      const inCheck = isKingInCheck(board, 'white');

      expect(inCheck).toBe(true);
    });

    it('should not detect check through pieces', () => {
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e8', { type: 'rook', color: 'black' });
      board.setPiece('e4', { type: 'pawn', color: 'white' });

      const inCheck = isKingInCheck(board, 'white');

      expect(inCheck).toBe(false); // Own pawn blocks check
    });
  });
});
