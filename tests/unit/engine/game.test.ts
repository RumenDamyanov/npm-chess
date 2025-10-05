/**
 * Game State Management Tests
 *
 * Tests for the Game class including move execution, game state,
 * and special rules.
 */

import { describe, expect, it } from '@jest/globals';
import { Game } from '@/engine/game';

describe('Game', () => {
  describe('constructor', () => {
    it('should create a new game with starting position', () => {
      const game = new Game();

      expect(game.getTurn()).toBe('white');
      expect(game.getStatus()).toBe('active');
      expect(game.getHistory()).toHaveLength(0);
      expect(game.getFullMoveNumber()).toBe(1);
      expect(game.getHalfMoveClock()).toBe(0);
    });

    it('should set up castling rights', () => {
      const game = new Game();
      const rights = game.getCastlingRights();

      expect(rights.whiteKingside).toBe(true);
      expect(rights.whiteQueenside).toBe(true);
      expect(rights.blackKingside).toBe(true);
      expect(rights.blackQueenside).toBe(true);
    });
  });

  describe('move', () => {
    it('should execute a legal move', () => {
      const game = new Game();
      const move = game.move({ from: 'e2', to: 'e4' });

      expect(move).not.toBeNull();
      expect(move?.from).toBe('e2');
      expect(move?.to).toBe('e4');
      expect(move?.piece.type).toBe('pawn');
    });

    it('should reject an illegal move', () => {
      const game = new Game();
      const move = game.move({ from: 'e2', to: 'e5' });

      expect(move).toBeNull();
    });

    it('should switch turns after a move', () => {
      const game = new Game();

      expect(game.getTurn()).toBe('white');
      game.move({ from: 'e2', to: 'e4' });
      expect(game.getTurn()).toBe('black');
    });

    it('should add move to history', () => {
      const game = new Game();

      expect(game.getHistory()).toHaveLength(0);
      game.move({ from: 'e2', to: 'e4' });
      expect(game.getHistory()).toHaveLength(1);
    });

    it('should handle pawn captures', () => {
      const game = new Game();

      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'd7', to: 'd5' });
      const move = game.move({ from: 'e4', to: 'd5' });

      expect(move?.captured).toBeDefined();
      expect(move?.captured?.type).toBe('pawn');
    });

    it('should handle pawn promotion', () => {
      const game = new Game();

      // Set up a position where white pawn can promote
      game.getBoard().clear();
      game.getBoard().setPiece('e7', { type: 'pawn', color: 'white' });
      game.getBoard().setPiece('e1', { type: 'king', color: 'white' });
      game.getBoard().setPiece('a8', { type: 'king', color: 'black' });

      const move = game.move({ from: 'e7', to: 'e8', promotion: 'queen' });

      expect(move).not.toBeNull();
      expect(move?.promotion).toBe('queen');
      expect(game.getBoard().getPiece('e8')?.type).toBe('queen');
    });

    it('should update half move clock for pawn moves', () => {
      const game = new Game();

      game.move({ from: 'e2', to: 'e4' });
      expect(game.getHalfMoveClock()).toBe(0);

      game.move({ from: 'e7', to: 'e5' });
      expect(game.getHalfMoveClock()).toBe(0);
    });

    it('should update half move clock for non-pawn moves', () => {
      const game = new Game();

      game.move({ from: 'g1', to: 'f3' });
      expect(game.getHalfMoveClock()).toBe(1);

      game.move({ from: 'g8', to: 'f6' });
      expect(game.getHalfMoveClock()).toBe(2);
    });

    it('should reset half move clock on capture', () => {
      const game = new Game();

      game.move({ from: 'g1', to: 'f3' });
      game.move({ from: 'g8', to: 'f6' });
      expect(game.getHalfMoveClock()).toBe(2);

      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'd7', to: 'd5' });
      game.move({ from: 'e4', to: 'd5' }); // Capture
      expect(game.getHalfMoveClock()).toBe(0);
    });

    it('should update full move number after black moves', () => {
      const game = new Game();

      expect(game.getFullMoveNumber()).toBe(1);
      game.move({ from: 'e2', to: 'e4' });
      expect(game.getFullMoveNumber()).toBe(1);
      game.move({ from: 'e7', to: 'e5' });
      expect(game.getFullMoveNumber()).toBe(2);
    });
  });

  describe('en passant', () => {
    it('should set en passant square after pawn double move', () => {
      const game = new Game();

      game.move({ from: 'e2', to: 'e4' });
      expect(game.getEnPassantSquare()).toBe('e3');
    });

    it('should clear en passant square after other moves', () => {
      const game = new Game();

      game.move({ from: 'e2', to: 'e4' });
      expect(game.getEnPassantSquare()).toBe('e3');

      game.move({ from: 'g8', to: 'f6' });
      expect(game.getEnPassantSquare()).toBeNull();
    });

    it('should allow en passant capture', () => {
      const game = new Game();

      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'a7', to: 'a6' });
      game.move({ from: 'e4', to: 'e5' });
      game.move({ from: 'd7', to: 'd5' });

      const move = game.move({ from: 'e5', to: 'd6' });

      expect(move).not.toBeNull();
      expect(move?.enPassant).toBe(true);
      expect(game.getBoard().getPiece('d5')).toBeNull();
    });
  });

  describe('castling', () => {
    it('should allow white kingside castling', () => {
      const game = new Game();

      // Clear pieces between king and rook
      game.getBoard().setPiece('f1', null);
      game.getBoard().setPiece('g1', null);

      const move = game.move({ from: 'e1', to: 'g1' });

      expect(move).not.toBeNull();
      expect(move?.castling).toBe('kingside');
      expect(game.getBoard().getPiece('g1')?.type).toBe('king');
      expect(game.getBoard().getPiece('f1')?.type).toBe('rook');
    });

    it('should allow white queenside castling', () => {
      const game = new Game();

      // Clear pieces between king and rook
      game.getBoard().setPiece('b1', null);
      game.getBoard().setPiece('c1', null);
      game.getBoard().setPiece('d1', null);

      const move = game.move({ from: 'e1', to: 'c1' });

      expect(move).not.toBeNull();
      expect(move?.castling).toBe('queenside');
      expect(game.getBoard().getPiece('c1')?.type).toBe('king');
      expect(game.getBoard().getPiece('d1')?.type).toBe('rook');
    });

    it('should lose castling rights after king moves', () => {
      const game = new Game();

      game.getBoard().setPiece('f1', null);
      game.getBoard().setPiece('g1', null);

      game.move({ from: 'e1', to: 'f1' });

      const rights = game.getCastlingRights();
      expect(rights.whiteKingside).toBe(false);
      expect(rights.whiteQueenside).toBe(false);
    });

    it('should lose kingside castling rights after rook moves', () => {
      const game = new Game();

      // Clear the knight to allow rook to move
      game.getBoard().setPiece('g1', null);
      game.move({ from: 'h1', to: 'g1' });

      const rights = game.getCastlingRights();
      expect(rights.whiteKingside).toBe(false);
      expect(rights.whiteQueenside).toBe(true);
    });
  });

  describe('undo', () => {
    it('should undo a move', () => {
      const game = new Game();

      game.move({ from: 'e2', to: 'e4' });
      expect(game.getTurn()).toBe('black');

      const undoneMove = game.undo();

      expect(undoneMove).not.toBeNull();
      expect(undoneMove?.from).toBe('e2');
      expect(game.getTurn()).toBe('white');
      expect(game.getBoard().getPiece('e2')?.type).toBe('pawn');
      expect(game.getBoard().getPiece('e4')).toBeNull();
    });

    it('should undo a capture', () => {
      const game = new Game();

      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'd7', to: 'd5' });
      game.move({ from: 'e4', to: 'd5' });

      game.undo();

      expect(game.getBoard().getPiece('e4')?.type).toBe('pawn');
      expect(game.getBoard().getPiece('e4')?.color).toBe('white');
      expect(game.getBoard().getPiece('d5')?.type).toBe('pawn');
      expect(game.getBoard().getPiece('d5')?.color).toBe('black');
    });

    it('should undo castling', () => {
      const game = new Game();

      game.getBoard().setPiece('f1', null);
      game.getBoard().setPiece('g1', null);
      game.move({ from: 'e1', to: 'g1' });

      game.undo();

      expect(game.getBoard().getPiece('e1')?.type).toBe('king');
      expect(game.getBoard().getPiece('h1')?.type).toBe('rook');
      expect(game.getBoard().getPiece('g1')).toBeNull();
      expect(game.getBoard().getPiece('f1')).toBeNull();
    });

    it('should return null when no moves to undo', () => {
      const game = new Game();
      const undoneMove = game.undo();

      expect(undoneMove).toBeNull();
    });
  });

  describe('game status', () => {
    it('should detect check', () => {
      const game = new Game();

      // Set up a position where white is in check
      game.getBoard().clear();
      game.getBoard().setPiece('e1', { type: 'king', color: 'white' });
      game.getBoard().setPiece('e5', { type: 'rook', color: 'black' });
      game.getBoard().setPiece('a8', { type: 'king', color: 'black' });

      expect(game.isInCheck()).toBe(true);
    });

    it('should detect checkmate', () => {
      const game = new Game();

      // Set up checkmate position
      game.getBoard().clear();
      game.getBoard().setPiece('e4', { type: 'king', color: 'white' });
      game.getBoard().setPiece('d5', { type: 'pawn', color: 'white' });
      game.getBoard().setPiece('e5', { type: 'pawn', color: 'white' });
      game.getBoard().setPiece('f5', { type: 'pawn', color: 'white' });
      game.getBoard().setPiece('d4', { type: 'pawn', color: 'white' });
      game.getBoard().setPiece('f4', { type: 'pawn', color: 'white' });
      game.getBoard().setPiece('d3', { type: 'pawn', color: 'white' });
      game.getBoard().setPiece('f3', { type: 'pawn', color: 'white' });
      game.getBoard().setPiece('e3', { type: 'queen', color: 'black' });
      game.getBoard().setPiece('e2', { type: 'rook', color: 'black' });
      game.getBoard().setPiece('a8', { type: 'king', color: 'black' });

      // Refresh move generator after manual board changes
      game.refreshMoveGenerator();

      expect(game.getStatus()).toBe('checkmate');
      expect(game.isGameOver()).toBe(true);
    });

    it('should detect stalemate', () => {
      const game = new Game();

      // Set up stalemate position
      game.getBoard().clear();
      game.getBoard().setPiece('a1', { type: 'king', color: 'white' });
      game.getBoard().setPiece('b3', { type: 'king', color: 'black' });
      game.getBoard().setPiece('c2', { type: 'queen', color: 'black' });

      // Refresh move generator after manual board changes
      game.refreshMoveGenerator();

      expect(game.getStatus()).toBe('stalemate');
      expect(game.isGameOver()).toBe(true);
    });
  });

  describe('getLegalMoves', () => {
    it('should return all legal moves for current player', () => {
      const game = new Game();
      const moves = game.getLegalMoves();

      expect(moves.length).toBe(20);
    });

    it('should return no moves when in checkmate', () => {
      const game = new Game();

      // Set up checkmate position
      game.getBoard().clear();
      game.getBoard().setPiece('e4', { type: 'king', color: 'white' });
      game.getBoard().setPiece('d5', { type: 'pawn', color: 'white' });
      game.getBoard().setPiece('e5', { type: 'pawn', color: 'white' });
      game.getBoard().setPiece('f5', { type: 'pawn', color: 'white' });
      game.getBoard().setPiece('d4', { type: 'pawn', color: 'white' });
      game.getBoard().setPiece('f4', { type: 'pawn', color: 'white' });
      game.getBoard().setPiece('d3', { type: 'pawn', color: 'white' });
      game.getBoard().setPiece('f3', { type: 'pawn', color: 'white' });
      game.getBoard().setPiece('e3', { type: 'queen', color: 'black' });
      game.getBoard().setPiece('e2', { type: 'rook', color: 'black' });
      game.getBoard().setPiece('a8', { type: 'king', color: 'black' });

      // Refresh move generator after manual board changes
      game.refreshMoveGenerator();

      const moves = game.getLegalMoves();
      expect(moves).toHaveLength(0);
    });
  });

  describe('getLegalMovesFrom', () => {
    it('should return legal moves from a specific square', () => {
      const game = new Game();
      const moves = game.getLegalMovesFrom('e2');

      expect(moves.length).toBe(2); // e3 and e4
    });

    it('should return empty array for empty square', () => {
      const game = new Game();
      const moves = game.getLegalMovesFrom('e4');

      expect(moves).toHaveLength(0);
    });
  });

  describe('reset', () => {
    it('should reset game to starting position', () => {
      const game = new Game();

      game.move({ from: 'e2', to: 'e4' });
      game.move({ from: 'e7', to: 'e5' });

      game.reset();

      expect(game.getTurn()).toBe('white');
      expect(game.getHistory()).toHaveLength(0);
      expect(game.getFullMoveNumber()).toBe(1);
      expect(game.getBoard().getPiece('e2')?.type).toBe('pawn');
      expect(game.getBoard().getPiece('e4')).toBeNull();
    });
  });

  describe('getPosition', () => {
    it('should return current position data', () => {
      const game = new Game();
      const position = game.getPosition();

      expect(position.turn).toBe('white');
      expect(position.board).toBeDefined();
      expect(position.castlingRights).toBeDefined();
      expect(position.halfMoveClock).toBe(0);
      expect(position.fullMoveNumber).toBe(1);
    });
  });
});
