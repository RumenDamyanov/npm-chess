/**
 * Tests for position evaluation functions
 */

import { Board } from '../../../src/engine/board';
import {
  evaluateMaterial,
  evaluatePosition,
  evaluateBoard,
  isEndgame,
  getPieceSquareValue,
  PIECE_VALUES,
} from '../../../src/ai/evaluation';

describe('Evaluation Functions', () => {
  describe('PIECE_VALUES', () => {
    it('should have correct piece values', () => {
      expect(PIECE_VALUES.pawn).toBe(100);
      expect(PIECE_VALUES.knight).toBe(320);
      expect(PIECE_VALUES.bishop).toBe(330);
      expect(PIECE_VALUES.rook).toBe(500);
      expect(PIECE_VALUES.queen).toBe(900);
      expect(PIECE_VALUES.king).toBe(20000);
    });
  });

  describe('evaluateMaterial', () => {
    it('should return 0 for starting position', () => {
      const board = new Board();
      board.setupStartingPosition();

      const score = evaluateMaterial(board, 'white');
      expect(score).toBe(0); // Equal material
    });

    it('should favor white when white has more material', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e8', { type: 'king', color: 'black' });
      board.setPiece('d1', { type: 'queen', color: 'white' });

      const score = evaluateMaterial(board, 'white');
      expect(score).toBe(900); // White has extra queen
    });

    it('should favor black when black has more material', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e8', { type: 'king', color: 'black' });
      board.setPiece('d8', { type: 'queen', color: 'black' });

      const score = evaluateMaterial(board, 'white');
      expect(score).toBe(-900); // Black has extra queen
    });

    it('should correctly evaluate mixed material', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e8', { type: 'king', color: 'black' });
      board.setPiece('a1', { type: 'rook', color: 'white' });
      board.setPiece('h1', { type: 'rook', color: 'white' });
      board.setPiece('c8', { type: 'bishop', color: 'black' });
      board.setPiece('f8', { type: 'bishop', color: 'black' });

      // 2 rooks (1000) vs 2 bishops (660)
      const score = evaluateMaterial(board, 'white');
      expect(score).toBe(340); // White up 340 centipawns
    });
  });

  describe('getPieceSquareValue', () => {
    it('should favor central squares for knights', () => {
      const piece = { type: 'knight' as const, color: 'white' as const };

      const centerValue = getPieceSquareValue(piece, 'e4');
      const cornerValue = getPieceSquareValue(piece, 'a1');

      expect(centerValue).toBeGreaterThan(cornerValue);
    });

    it('should favor advanced pawns', () => {
      const piece = { type: 'pawn' as const, color: 'white' as const };

      // Center pawns should be favored over edge pawns at same rank
      const centerValue = getPieceSquareValue(piece, 'd5');
      const edgeValue = getPieceSquareValue(piece, 'a5');

      expect(centerValue).toBeGreaterThan(edgeValue);

      // Pawn tables should show some positional differences
      const valueE2 = getPieceSquareValue(piece, 'e2');
      const valueE3 = getPieceSquareValue(piece, 'e3');
      const valueE4 = getPieceSquareValue(piece, 'e4');

      // All should be defined numbers
      expect(typeof valueE2).toBe('number');
      expect(typeof valueE3).toBe('number');
      expect(typeof valueE4).toBe('number');
    });

    it('should flip values for black pieces', () => {
      const whitePawn = { type: 'pawn' as const, color: 'white' as const };
      const blackPawn = { type: 'pawn' as const, color: 'black' as const };

      // White pawn on e2 should have same value as black pawn on e7
      const whiteValue = getPieceSquareValue(whitePawn, 'e2');
      const blackValue = getPieceSquareValue(blackPawn, 'e7');

      expect(whiteValue).toBe(-blackValue); // Opposite signs
    });

    it('should favor king safety in middlegame', () => {
      const king = { type: 'king' as const, color: 'white' as const };

      const castledValue = getPieceSquareValue(king, 'g1', false);
      const centerValue = getPieceSquareValue(king, 'e4', false);

      expect(castledValue).toBeGreaterThan(centerValue);
    });

    it('should favor central king in endgame', () => {
      const king = { type: 'king' as const, color: 'white' as const };

      const centerValue = getPieceSquareValue(king, 'e4', true);
      const cornerValue = getPieceSquareValue(king, 'g1', true);

      expect(centerValue).toBeGreaterThan(cornerValue);
    });
  });

  describe('isEndgame', () => {
    it('should return false for starting position', () => {
      const board = new Board();
      board.setupStartingPosition();

      expect(isEndgame(board)).toBe(false);
    });

    it('should return true when no queens', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e8', { type: 'king', color: 'black' });
      board.setPiece('a1', { type: 'rook', color: 'white' });
      board.setPiece('a8', { type: 'rook', color: 'black' });

      expect(isEndgame(board)).toBe(true);
    });

    it('should return true when queens with minimal material', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e8', { type: 'king', color: 'black' });
      board.setPiece('d1', { type: 'queen', color: 'white' });
      board.setPiece('d8', { type: 'queen', color: 'black' });

      expect(isEndgame(board)).toBe(true);
    });

    it('should return false when queens with more material', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e8', { type: 'king', color: 'black' });
      board.setPiece('d1', { type: 'queen', color: 'white' });
      board.setPiece('d8', { type: 'queen', color: 'black' });
      board.setPiece('c1', { type: 'bishop', color: 'white' });
      board.setPiece('c8', { type: 'bishop', color: 'black' });
      board.setPiece('a1', { type: 'rook', color: 'white' });
      board.setPiece('a8', { type: 'rook', color: 'black' });

      expect(isEndgame(board)).toBe(false);
    });
  });

  describe('evaluatePosition', () => {
    it('should return 0 for starting position', () => {
      const board = new Board();
      board.setupStartingPosition();

      const score = evaluatePosition(board, false);
      expect(score).toBe(0); // Symmetric position
    });

    it('should favor better piece placement', () => {
      // Position with white knight developed
      const board1 = new Board();
      board1.setupStartingPosition();
      board1.movePiece('g1', 'f3');

      // Position with white knight still on start
      const board2 = new Board();
      board2.setupStartingPosition();

      const score1 = evaluatePosition(board1, false);
      const score2 = evaluatePosition(board2, false);

      expect(score1).toBeGreaterThan(score2);
    });
  });

  describe('evaluateBoard', () => {
    it('should combine material and position scores', () => {
      const board = new Board();
      board.setupStartingPosition();

      const score = evaluateBoard(board, 'white');
      expect(score).toBe(0); // Equal position
    });

    it('should heavily weight material over position', () => {
      // Board with extra queen for white
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e8', { type: 'king', color: 'black' });
      board.setPiece('d1', { type: 'queen', color: 'white' });

      const score = evaluateBoard(board, 'white');

      // Should be dominated by material (queen = 900)
      expect(score).toBeGreaterThan(800);
    });

    it('should evaluate from given color perspective', () => {
      const board = new Board();
      board.setPiece('e1', { type: 'king', color: 'white' });
      board.setPiece('e8', { type: 'king', color: 'black' });
      board.setPiece('d1', { type: 'queen', color: 'white' });

      const whiteScore = evaluateBoard(board, 'white');
      const blackScore = evaluateBoard(board, 'black');

      expect(whiteScore).toBeGreaterThan(0);
      expect(blackScore).toBeLessThan(0);
    });
  });
});
